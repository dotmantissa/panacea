import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { neon } from '@neondatabase/serverless';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { privateKeyToAccount } from 'viem/accounts';
import crypto from 'crypto';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  let userAddress = '';
  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken);
    const user = await privy.getUser(verifiedClaims.userId);
    
    // Find EOA or smart wallet address linked to Privy
    const walletAccount = user.linkedAccounts.find((acc) => acc.type === 'wallet');
    userAddress = walletAccount ? walletAccount.address : user.id;
  } catch (error) {
    console.error('Privy auth failed:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { drugName, dosage, diagnosis, profile } = body;
  if (!drugName || !dosage || !diagnosis || !profile) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const analysisId = crypto.randomUUID();

  try {
    const privateKey = process.env.GENLAYER_PRIVATE_KEY as `0x${string}`;
    if (!privateKey) {
      throw new Error('GENLAYER_PRIVATE_KEY is missing');
    }
    const contractAddress = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS as `0x${string}`;
    if (!contractAddress) {
      throw new Error('NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is missing');
    }

    const account = privateKeyToAccount(privateKey);
    const client = createClient({
      chain: studionet,
      account: account,
    });

    console.log(`Submitting GenLayer tx for drug ${drugName}...`);
    // 1. Submit on-chain transaction
    const txHash = await client.writeContract({
      address: contractAddress,
      functionName: 'analyze_prescription',
      args: [
        analysisId,
        userAddress,
        drugName,
        dosage,
        diagnosis,
        JSON.stringify(profile),
        new Date().toISOString(),
      ],
    });

    console.log(`Waiting for GenLayer tx ${txHash} finalization...`);
    // 2. Wait for finalization
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      status: 'FINALIZED',
    });

    // Verify receipt execution
    // Note: In some versions receipt.status might indicate success or we check if code ran
    console.log(`GenLayer transaction receipt finalized. Status: ${receipt.status}`);

    // 3. Read the finalized analysis from contract storage
    console.log(`Reading analysis ${analysisId} from contract...`);
    const record = await client.readContract({
      address: contractAddress,
      functionName: 'get_analysis',
      args: [analysisId],
    }) as any;

    if (!record || !record.result_json) {
      throw new Error('Analysis record or result_json is missing in contract storage');
    }

    // 4. Save to Neon database
    console.log('Saving result to database...');
    const db = neon(process.env.NEON_DATABASE_URL!);
    await db`
      INSERT INTO analyses (id, user_address, drug_name, dosage, diagnosis, profile_json, result_json, tx_hash, contract_address)
      VALUES (
        ${analysisId}, 
        ${userAddress}, 
        ${drugName}, 
        ${dosage}, 
        ${diagnosis}, 
        ${JSON.stringify(profile)}::jsonb, 
        ${record.result_json}::jsonb, 
        ${txHash}, 
        ${contractAddress}
      )
    `;

    return NextResponse.json({
      id: analysisId,
      user_address: userAddress,
      drug_name: drugName,
      dosage: dosage,
      diagnosis: diagnosis,
      profile: profile,
      result: JSON.parse(record.result_json),
      tx_hash: txHash,
      created_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Analysis execution failed:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
