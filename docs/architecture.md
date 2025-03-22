
---

#### **docs/architecture.md**
System architecture.

```markdown
# System Architecture

Overview of the Hellenic Sao Ledger architecture.

## Components
1. **Smart Contracts** (BSC Testnet):
   - **Core**: HellenicPoliteia, Talanton, Drachma, Obolos, CitizenID.
   - **Supporting**: BridgeReceiver, DisputeResolver, LiquidityPoolManager, Oracle, PerksManager, SmartContractFactory, NFTs.
   - Deployed via Hardhat, interacting via ethers.js.

2. **Web3 App/Website**:
   - **Mobile**: React Native, WalletConnect, XMTP, IPFS.
   - **Website**: React.js, MetaMask, XMTP, IPFS.
   - Features: Voting, staking, payments, chat, forums, NFT marketplace, recovery.

## Flow
- **Users**: Connect wallets (MetaMask/WalletConnect) to app/website.
- **Governance**: HellenicPoliteia manages roles/voting via Talanton/Obolos balances.
- **Tokens**: Talanton (mining/staking), Drachma/Obolos (staking/payments).
- **DeFi/NFTs**: Liquidity pools and NFT contracts enhance economics.
- **Chat/Forums**: XMTP for messaging, IPFS for decentralized storage.
- **Security**: Encrypted recovery via IPFS and trusted contacts.

## Diagram
[User] --> [App/Website]
|          |
v          v
[Wallet] --> [BSC Testnet]
|          |
v          v
[Contracts] <--> [Supporting Services (XMTP, IPFS)]

## Deployment
- Contracts on BSC Testnet via `scripts/deploy.js`.
- App/website hosted locally or on static servers (e.g., IPFS).
