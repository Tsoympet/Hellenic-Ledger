# Talanton Mining Guide

This guide explains how to mine Talanton (TAL) tokens in the Hellenic Sao Ledger ecosystem on Binance Smart Chain (BSC) Testnet. Mining Talanton combines **Proof-of-Work (PoW)** and **Proof-of-Stake (PoS)** mechanisms, requiring both computational effort and a staked commitment.

## Overview
Talanton is a hybrid PoW/PoS token with a 21 million TAL supply cap. Mining requires:
- **Staking (PoS)**: A minimum of 32,000 TAL staked to participate, ensuring miners are committed stakeholders.
- **Mining (PoW)**: Computing a valid `nonce` off-chain that meets a difficulty target, verified on-chain.

### Rewards
- **Base Reward**: 1 TAL per successful mine.
- **Staking Bonus**: Additional TAL based on staking duration (e.g., 0.1 TAL per year per 32,000 TAL staked).

## Prerequisites
- **Wallet**: A BSC-compatible wallet (e.g., MetaMask) with a private key.
- **TAL Tokens**: At least 32,000 TAL to stake (obtainable via testnet faucets or transfers).
- **Node.js**: v16+ for running the off-chain mining script.
- **BSC Testnet**: Access to a BSC Testnet RPC (e.g., `https://data-seed-prebsc-1-s1.binance.org:8545`).
- **Deployed Contract**: The `Talanton.sol` contract address (see deployment details in `docs/contracts.md`).
- **Dependencies**: `ethers` and `dotenv` Node.js packages.

## Mining Process
### Step 1: Stake Talanton (PoS)
1. **Acquire TAL**: Ensure your wallet has at least 32,000 TAL.
2. **Stake via Contract**:
   - Use the mobile app (`app/src/screens/Staking.js`) or website (`website/src/pages/Staking.js`) to call `stake(32000e18)`.
   - Alternatively, use a script or direct contract interaction (see `tools/mineTalanton.js` for automation).
3. **Verify Staking**: Check `stakedBalance` on `Talanton.sol`—must be ≥ 32,000 TAL to mine.

### Step 2: Compute Nonce Off-Chain (PoW)
1. **Setup Environment**:
   - Navigate to `tools/`:
     ```bash
     cd tools

nstall dependencies (if not done)
npm install ethers dotenv

Create .env with your private key:
PRIVATE_KEY=your_private_key_here

Update mineTalanton.js with the Talanton.sol address
const TALANTON_ADDRESS = "0xYourTalantonAddress";

Run the Mining Script:
Execute:
node mineTalanton.js

The script:
Checks if 32,000 TAL is staked (stakes if not, given sufficient balance).
Fetches the previous block’s hash (blockhash(block.number - 1)).
Computes keccak256(address, blockHash, nonce, stakedBalance) until the result is ≤ target (2^256 / 1000).

Output:
Logs nonce search progress (e.g., "Tested 10000 nonces...").
Displays the valid nonce when found (e.g., "Found valid nonce: 12345").

Step 3: Submit On-Chain
The script automatically submits the nonce to mine(nonce) on Talanton.sol.
Transaction: Costs ~50,000-70,000 gas—ensure your wallet has BNB for fees.
Result: If successful, 1 TAL + staking bonus is minted to your address.

Example Mining Workflow
Stake:
Wallet: 0x1234... with 32,000 TAL.
Run stake(32000e18)—staked balance now 32,000 TAL.
Compute Nonce:
Block hash: 0xabc... (from block n-1).
Script iterates: keccak256(0x1234..., 0xabc..., nonce, 32000e18) until solution < target.
Finds nonce = 54321.
Submit:
Calls mine(54321)—tx succeeds, mints ~1.1 TAL (1 base + 0.1 bonus after 1 year).
Key Details
Difficulty: MINING_DIFFICULTY = 1000—1/1000 chance per nonce attempt.
Block Window: Submit within ~256 blocks (~12 minutes) of the target block hash.
Gas Cost: ~50,000-70,000 gas per mine call—low for BSC Testnet.
Staking Bonus: Scales with time staked (e.g., 0.1 TAL/year for 32,000 TAL).
Troubleshooting
"Insufficient TAL": Acquire more TAL via faucet or transfer.
"Block hash unavailable": Wait for the next block and retry.
"Invalid solution": Ensure nonce matches the block hash and staked balance.
Tx Failure: Check BNB balance for gas fees or increase gas limit.
Optimization Tips
Multi-Threading: Enhance mineTalanton.js with worker_threads for faster nonce computation.
Batch Mining: Compute multiple nonces for consecutive blocks to reduce downtime.
UI Integration: Add to app/website for a seamless experience (currently CLI-based).
