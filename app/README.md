# Hellenic Politeia Hub (Mobile App)

A React Native app for interacting with the Hellenic Sao Ledger on BSC.

## Structure
- `src/components/`: Reusable UI components
- `src/screens/`: Main app screens
- `src/utils/`: Web3, XMTP, IPFS, and security utilities
- `App.js`: Main entry point
- `android/`, `ios/`: Platform-specific files

## Prerequisites
- Node.js v16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)
- BSC Testnet access

## Installation
1. Navigate to `app/`:
   ```bash
   cd app
2. Install dependencies
npm install
  Running the App
Start Metro: npm start
Run on Android:npm run android
Run on iOS: npm run ios
Configuration
Update src/utils/web3.js with deployed contract addresses and ABIs.
Contributing
Follow React Native style guides.
Submit PRs to the main branch.


---

### **Notes**
- **Dependencies**: Install via `npm install` in the `app/` directory—requires React Native setup (`npx react-native init` generates `android/` and `ios/`).
- **Placeholders**: `web3.js` contains placeholder logic (e.g., `getMotions`, `getNFTs`)—replace with actual contract calls using ABIs and addresses post-deployment.
- **Navigation**: Uses `@react-navigation` for screen transitions—expand with more screens as needed.
- **Execution**: Run `npx react-native run-android` or `run-ios` 

---

### **Next Steps**
- **Add to GitHub**: Place these in `app/`:
  ```bash
  mkdir -p app/src/components app/src/screens app/src/utils
  # Copy each .js file into appropriate folder
  git add app/*
  git commit -m "Add React Native mobile app source"
  git push origin main

  Setup: Initialize React Native project (npx react-native init HellenicPoliteiaHub) and overwrite with these files—I can guide you through this.
