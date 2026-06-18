import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { neon } from '@neondatabase/serverless';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function GET(req: NextRequest) {
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

  try {
    const db = neon(process.env.NEON_DATABASE_URL!);
    
    console.log(`Fetching history for user: ${userAddress}`);
    const history = await db`
      SELECT id, user_address, drug_name, dosage, diagnosis, profile_json as profile, result_json as result, tx_hash, contract_address, created_at
      FROM analyses
      WHERE user_address = ${userAddress}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('History fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
  }
}
