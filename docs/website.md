
---

#### **docs/website.md**
Website usage guide.

```markdown
# Website Usage Guide

Guide for using the Hellenic Politeia Hub website (React.js).

## Features
Mirrors the mobile app:
- **Home**: Connect wallet, view dashboard.
- **Voting**: Vote on DAO motions/elections.
- **Staking**: Stake tokens.
- **Payments**: Send/receive tokens.
- **Chat**: Encrypted messaging.
- **Forums**: Community discussions.
- **Marketplace**: NFT trading.
- **Settings**: Account recovery setup.

## Setup
1. **Initialize**:
   ```bash
   npx create-react-app hellenic-politeia-web
   cd hellenic-politeia-web
2.Install Dependencies:
npm install
3.Copy website/src/, website/public/, website/package.json, and website/README.md into the project.
Running
Start the development server:
npm start
Open http://localhost:3000.
Building
Build for production:
npm run build
Serve the build/ folder (e.g., npx serve -s build).
Configuration
Update src/utils/web3.js with contract addresses and ABIs.
Usage
Connect Wallet: Use MetaMask on Home page.
Navigate via links to access features (mirrors app usage).
