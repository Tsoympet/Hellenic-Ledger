import React, { useState } from 'react';
import { View, Text } from 'react-native';
import WalletConnect from '../components/WalletConnect';

const Home = () => {
  const [signer, setSigner] = useState(null);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Hellenic Politeia Hub</Text>
      <WalletConnect onConnect={setSigner} />
      {signer && <Text>Connected Wallet: {signer.address}</Text>}
    </View>
  );
};

export default Home;
