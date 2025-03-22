# Hellenic Politeia Hub (Website)

A React.js website for interacting with the Hellenic Sao Ledger on BSC.

## Structure
- `src/components/`: Reusable UI components
- `src/pages/`: Website pages
- `src/utils/`: Web3, XMTP, IPFS, and security utilities
- `src/App.js`: Main entry point
- `public/`: Static assets
- `package.json`: Website dependencies
- `README.md`: This file

## Prerequisites
- Node.js v16+
- BSC Testnet access

## Installation
1. Navigate to `website/`:
   ```bash
   cd website
2.Install dependencies:
npm install

Running the Website
Start the development server:
npm start
Open http://localhost:3000 in your browser.

Configuration
Update src/utils/web3.js with deployed contract addresses and ABIs.

Building for Production
Build the website:
npm run build
Serve the build/ folder with a static server (e.g., npx serve -s build).
Contributing
Follow React style guides.
Submit PRs to the main branch.
License
MIT

---

### **Notes**
- **Mirroring**: Components and utilities are largely mirrored from the mobile app, adjusted for web (e.g., MetaMask instead of WalletConnect, React Router instead of React Navigation).
- **Dependencies**: Install via `npm install` in the `website/` directory—requires `create-react-app` setup (`npx create-react-app hellenic-politeia-web`).
- **Placeholders**: `web3.js` contains placeholder logic—replace with actual contract calls post-deployment.
- **Styling**: Uses basic React Native styles for consistency—adapt to CSS/SCSS for web if preferred.

---

### **Next Steps**
- **Add to GitHub**: Place these in `website/`:
  ```bash
  mkdir -p website/src/components website/src/pages website/src/utils website/public
  # Copy each .js, .html, .json, .md file into appropriate folder
  git add website/*
  git commit -m "Add React.js website source"
  git push origin main
  Setup: Initialize React project (npx create-react-app hellenic-politeia-web) and overwrite with these files
  Run: Test the website locally (npm start)
