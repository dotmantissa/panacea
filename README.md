# Panacea

Your doctor gave you 8 minutes. We have as long as you need.

Welcome to Panacea, an on-chain medical second opinion platform.

## What is this?

You went to the doctor. They prescribed you some medication. You left the clinic with more questions than answers. You googled it and either found nothing useful, or you ended up in a late night anxiety spiral. 

Panacea reads your prescription and condition, queries clinical guidelines and FDA databases, and uses GenLayer intelligent contract consensus to generate a plain English briefing. Not a replacement for your doctor. Just the information you need to walk back into that clinic as an equal partner in your own health decisions.

## Features

* **Treatment Guideline Review**: Check if the prescribed treatment is standard for your specific condition.
* **Dosage Validation**: Verify the math of the dosage against your age, weight, and medications.
* **Interaction Warnings**: Screen for severe drug interactions before you start swallowing.
* **Smart Questions**: Get a list of sharp, non obvious questions to ask at your next appointment.
* **On-Chain Consensus**: Every verification runs through independent validators on GenLayer and is recorded on-chain.

## How it works

1. **Authentication**: Sign in using Privy (connect your wallet or email).
2. **Form Entry**: Provide your prescription details, diagnosis, age, weight, and other medications.
3. **On-chain Consensus**: Next.js calls our GenLayer intelligent contract. The contract performs a nondeterministic web request to the FDA database, runs the evaluation through validator consensus, and writes the finalized briefing to the blockchain.
4. **Briefing Locker**: Read your briefings at any time.

## Architecture

* **Frontend**: Next.js 14 App Router, styled with custom Vanilla CSS and animated using Framer Motion.
* **Authentication**: Privy client wallet auth.
* **Backend**: Next.js Serverless API routes.
* **Contract**: GenLayer Intelligent Contract (deployed on StudioNet).
* **Database**: Neon Serverless PostgreSQL for caching history.

## Development Setup

### Prerequisites

* Node.js (v18+)
* Python (v3.10+) with `genlayer-test`

### Local Install

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file at the root:
   ```env
   NEON_DATABASE_URL=your_postgres_connection_string
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_app_secret
   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=your_deployed_contract
   GENLAYER_PRIVATE_KEY=your_private_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Contract

Run in memory tests:
```bash
pytest tests/direct/ -v
```

## Disclaimer

Panacea is an intelligent assistant designed to help you prepare for discussions with your healthcare provider. It does not replace medical advice. Always consult your doctor before starting or changing treatments.
