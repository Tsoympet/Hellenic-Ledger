# Tools Directory

This directory contains off-chain utilities for interacting with the Hellenic Sao Ledger smart contracts on Binance Smart Chain (BSC) Testnet.

## Contents
- **`mineTalanton.js`**: A Node.js script to perform off-chain mining for the `Talanton.sol` contract, computing a valid nonce and submitting it on-chain to mint Talanton tokens.

## Prerequisites
- **Node.js**: v16+ installed.
- **Dependencies**: `ethers` and `dotenv` for Ethereum interactions and environment variable management.
- **BSC Testnet Access**: A wallet with TAL tokens and BSC Testnet RPC endpoint (e.g., `https://data-seed-prebsc-1-s1.binance.org:8545`).
- **Talanton Contract**: Deployed `Talanton.sol` address.

## Setup
1. **Navigate to `tools/`**:
   ```bash
   cd tools
2.Initialize Node.js Project (if not already done):
npm init -y
3.Install Dependencies:
npm install ethers dotenv
4.Create .env File:
In the tools/ directory, create a .env file with your private key:
PRIVATE_KEY=your_private_key_here
Security Note: Never commit .env to Git—ensure it’s in .gitignore.
5.Update Script:
Open mineTalanton.js and replace TALANTON_ADDRESS with the deployed Talanton.sol address:
const TALANTON_ADDRESS = "0xYourTalantonAddress";

Usage
Running the Mining Script
Ensure Staking:
The script checks if 32,000 TAL is staked; if not, it attempts to stake (requires sufficient TAL balance).
Run the Script:
node mineTalanton.js
Output:
The script logs staking status, nonce computation progress, and transaction details upon successful mining.
Example Workflow
Stake: If not already staked, the script stakes 32,000 TAL.
Mine: Computes a nonce such that keccak256(address, blockHash, nonce, stakedBalance) <= target, then submits it to mine(nonce).
Result: Mints 1 TAL + staking bonus to your wallet.

Configuration
RPC_URL: Default is BSC Testnet (https://data-seed-prebsc-1-s1.binance.org:8545)—update if using a different provider.
MINING_DIFFICULTY: Set to 1000, matching Talanton.sol—adjust if the contract changes.
Gas Limit: Set to 100,000—tune based on BSC Testnet gas usage (~50,000-70,000 typical).

Notes
Efficiency: Single-threaded for simplicity—optimize with multi-threading (e.g., worker_threads) for faster nonce computation.
Security: Keep PRIVATE_KEY secure in .env.
Block Window: Must submit within ~256 blocks (~12 minutes) of the target block hash—run frequently to avoid expiration.

Troubleshooting
"Insufficient TAL balance": Ensure your wallet has at least 32,000 TAL.
"Block hash unavailable": Wait for the next block and retry.
Tx Failure: Check gas limit or BSC Testnet connectivity.

Contributing
Submit pull requests to enhance the script (e.g., multi-threading, UI integration).
Report issues via GitHub Issues.


---


