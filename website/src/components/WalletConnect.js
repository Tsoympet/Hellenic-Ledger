import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      onConnect(signer);
    } catch (error) {
      console.error("Wallet connect error:", error);
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      {address && <p>Connected: {address}</p>}
    </div>
  );
};

export default WalletConnect;
