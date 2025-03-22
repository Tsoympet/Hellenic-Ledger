import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';

const Home = ({ setSigner }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to Hellenic Politeia Hub</h1>
      <WalletConnect onConnect={setSigner} />
    </div>
  );
};

export default Home;
