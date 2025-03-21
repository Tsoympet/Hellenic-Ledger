import React, { useState } from 'react';
import { Button, Text } from 'react-native';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [address, setAddress] = useState(null);

  const connectWallet = async () => {
    try {
      const provider = new WalletConnectProvider({
        rpc: { 97: "https://data-seed-prebsc-1-s1.binance.org:8545" }, // BSC Testnet
      });
      await provider.enable();
      const web3Provider = new ethers.BrowserProvider(provider);
      const signer = await web3Provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      onConnect(signer);
    } catch (error) {
      console.error("Wallet connect error:", error);
    }
  };

  return (
    <>
      <Button title="Connect Wallet" onPress={connectWallet} />
      {address && <Text>Connected: {address}</Text>}
    </>
  );
};

export default WalletConnect;
