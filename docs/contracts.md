# Contracts Documentation

Details of the smart contracts in the Hellenic Sao Ledger ecosystem.

## Core Contracts
1. **HellenicPoliteia.sol**
   - **Purpose**: Governance DAO managing roles, vaults, and ecosystem operations.
   - **Roles**: Archon (1), Strategoi (10), Prytaneis (50), Grammateis (25), Demos (500), Eponymous Heroes (4).
   - **Features**: Voting, Fame system, revenue distribution, emergency controls.
   - **Key Functions**:
     - `startElection(role, candidate)`: Starts an election.
     - `voteForRole(role, electionId)`: Votes in an election.
     - `proposeSilverMotion(description, stakeRate, miningRate, actionData)`: Proposes a motion.
     - `distributeRevenue(startIndex, batchSize)`: Distributes treasury funds.

2. **Talanton.sol**
   - **Purpose**: Hybrid PoW/PoS token with a 21M cap.
   - **Features**:
     - **Staking (PoS)**: 5% APR, minimum 32,000 TAL required to stake and mine.
     - **Mining (PoW/PoS)**: Requires 32,000 TAL staked, miners compute a nonce off-chain using address, block hash, and staked balance, verified on-chain. Rewards 1 TAL + staking bonus.
   - **Key Functions**:
     - `stake(amount)`: Stakes tokens (min 32,000 TAL).
     - `unstake(amount)`: Unstakes with rewards.
     - `mine(nonce)`: Mines 1 TAL + staking bonus if staked and solution valid.
     - `calculateStakingReward(user)`: Calculates staking reward (5% APR).
     - `calculateStakingBonus(user)`: Calculates mining bonus based on stake duration.

3. **Drachma.sol**
   - **Purpose**: PoS token for payments.
   - **Features**: Staking (3% APR).
   - **Key Functions**: `stake(amount)`, `unstake(amount)`.

4. **Obolos.sol**
   - **Purpose**: PoS token for DeFi/NFTs.
   - **Features**: Staking (2% APR).
   - **Key Functions**: `stake(amount)`, `unstake(amount)`.

5. **CitizenID.sol**
   - **Purpose**: Identity verification.
   - **Key Functions**: `verifyUser(user)`, `revokeVerification(user)`.

## Supporting Contracts
- **BridgeReceiver.sol**: Cross-chain token transfers via LayerZero.
- **DisputeResolver.sol**: Resolves ecosystem disputes.
- **LiquidityPoolManager.sol**: Manages DeFi liquidity pools.
- **Oracle.sol**: Provides price feeds.
- **PerksManager.sol**: Manages voting boosts.
- **SmartContractFactory.sol**: Deploys custom contracts.
- **TitanicNFT.sol**, **QuestNFT.sol**, **RelicNFT.sol**: NFT contracts.

## Deployment
1. Configure `hardhat.config.js` with BSC Testnet credentials.
2. Run:
   ```bash
   npx hardhat run scripts/deploy.js --network bscTestnet

   See scripts/ for funding and ownership transfer scripts.

   Testing
Run tests:
npx hardhat test

See test/ for detailed test cases.


---


