# Talanton Mining Guide

This guide explains how to mine Talanton (TAL) tokens in the Hellenic Sao Ledger ecosystem on Binance Smart Chain (BSC) Testnet. Mining Talanton combines **Proof-of-Work (PoW)** and **Proof-of-Stake (PoS)** with a Bitcoin-style difficulty adjustment and reward halving mechanism.

## Overview
Talanton is a hybrid PoW/PoS token with a 21 million TAL supply cap. Mining requires:
- **Staking (PoS)**: Minimum 1,000 TAL staked, with higher rewards for 32,000 TAL.
- **Mining (PoW)**: Computing a valid `nonce` off-chain, verified on-chain, with increasing difficulty and halving rewards.

### Rewards
- **Base Reward**: 
  - 1 TAL (initially) for ≥ 32,000 TAL staked, halved every ~420,000 blocks (~2 months).
  - 0.1 TAL (initially) for ≥ 1,000 TAL staked, halved similarly.
- **Staking Bonus**: Additional TAL based on staking duration (e.g., 0.1 TAL/year per 32,000 TAL).

### Difficulty and Halving
- **Difficulty**: Starts at 1,000, increases 10% every ~20,160 blocks (~1 week), making mining harder.
- **Halving**: Rewards halve every ~420,000 blocks (e.g., 1 TAL → 0.5 TAL → 0.25 TAL), reducing issuance over time.

## Prerequisites
- **Wallet**: BSC-compatible (e.g., MetaMask) with a private key.
- **TAL Tokens**: At least 1,000 TAL (32,000 TAL for full reward) via testnet faucets or transfers.
- **Node.js**: v16+ for the off-chain mining script.
- **BSC Testnet**: RPC endpoint (e.g., `https://data-seed-prebsc-1-s1.binance.org:8545`).
- **Deployed Contract**: `Talanton.sol` address (see `docs/contracts.md`).
- **Dependencies**: `ethers` and `dotenv` Node.js packages.

## Mining Process
### Step 1: Stake Talanton (PoS)
1. **Acquire TAL**: Ensure at least 1,000 TAL (32,000 TAL recommended).
2. **Stake via Contract**:
   - Use the app (`app/src/screens/Staking.js`) or website (`website/src/pages/Staking.js`) to call `stake(32000e18)`.
   - Alternatively, use `tools/mineTalanton.js`.
3. **Verify Staking**: Check `stakedBalance`—1,000 TAL minimum, 32,000 TAL for full reward.

### Step 2: Compute Nonce Off-Chain (PoW)
1. **Setup Environment**:
   - Navigate to `tools/`:
     ```bash
     cd tools

     Install dependencies:
     npm install ethers dotenv

     Create .env:
     PRIVATE_KEY=your_private_key_here

     Update mineTalanton.js with Talanton.sol address:
     const TALANTON_ADDRESS = "0xYourTalantonAddress";

2.Run the Script:
Execute:
node mineTalanton.js
Checks staking (stakes 32,000 TAL if needed).
Fetches currentTarget and previous block hash.
Computes keccak256(address, blockHash, nonce, stakedBalance) until ≤ currentTarget.

3.Output:
Logs difficulty, target, and reward.
Displays valid nonce (e.g., "Found valid nonce: 12345").

Step 3: Submit On-Chain
Script submits nonce to mine(nonce).
Gas: ~50,000-70,000 gas—ensure BNB for fees.
Result: Mints current base reward (e.g., 1 TAL or 0.1 TAL) + staking bonus.
Example Workflow
Stake: Wallet with 32,000 TAL stakes via stake(32000e18).
Compute: Script finds nonce for block n-1, difficulty 1,000, target 2^256 / 1000.
Submit: mine(nonce) mints ~1.1 TAL (1 base + 0.1 bonus after 1 year).
After Halving: Post-420,000 blocks, reward drops to 0.5 TAL, difficulty rises (e.g., 1,100).
Key Details
Initial Difficulty: 1,000, increases 10% every ~1 week.
Halving: Every ~2 months (420,000 blocks), rewards halve.
Block Window: Submit within ~256 blocks (~12 minutes).
Gas Cost: ~50,000-70,000 gas per mine.
Troubleshooting
"Insufficient TAL": Acquire more TAL.
"Block hash unavailable": Retry next block.
"Invalid solution": Check nonce against current target.
Tx Failure: Verify BNB balance or gas limit.
Optimization Tips
Multi-Threading: Use worker_threads for faster nonce search.
Monitor Halving: Adjust mining frequency as rewards decrease.
UI Integration: Add to app/website for ease.
Security Notes
Private Key: Secure in .env, never commit.
Front-Running: Possible nonce sniping—consider commit-reveal for production.
Audit: Ensure Talanton.sol is audited for mainnet.
