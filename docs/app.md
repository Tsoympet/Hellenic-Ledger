
---

#### **docs/app.md**
App usage guide.

```markdown
# Mobile App Usage Guide

Guide for using the Hellenic Politeia Hub mobile app (React Native).

## Features
- **Home**: Connect wallet, view dashboard.
- **Voting**: Vote on DAO motions and elections.
- **Staking**: Stake Talanton, Drachma, Obolos.
- **Payments**: Send/receive tokens.
- **Chat**: Encrypted messaging via XMTP.
- **Forums**: Community discussions via IPFS.
- **Marketplace**: Buy/sell NFTs.
- **Settings**: Setup account recovery.

## Setup
1. **Initialize**:
   ```bash
   npx react-native init HellenicPoliteiaHub --version 0.73.6
   cd HellenicPoliteiaHub
2.Install Dependencies:
npm install
3.Copy app/src/, app/package.json, and app/README.md into the project.
Running
Android:
Open android/ in Android Studio, update AndroidManifest.xml for permissions.
Run:
npx react-native run-android
iOS:
Install CocoaPods:
cd ios && pod install && cd ..
Open ios/HellenicPoliteiaHub.xcodeproj in Xcode, update Info.plist.
Run:
npx react-native run-ios
Configuration
Update src/utils/web3.js with contract addresses and ABIs from deployment.
Usage
Connect Wallet: Use WalletConnect on Home screen.
Vote: Navigate to Voting, select a motion/election.
Stake: Go to Staking, enter amount for desired token.
Pay: Use Payments to send tokens.
Chat: Enter recipient address, send messages.
Forums: View/post threads.
Marketplace: Browse and buy NFTs.
Settings: Configure recovery with trusted contacts.
