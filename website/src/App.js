import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { View, Text } from 'react-native'; // Using react-native for consistency
import Home from './pages/Home';
import Voting from './pages/Voting';
import Staking from './pages/Staking';
import Payments from './pages/Payments';
import Chat from './pages/Chat';
import Forums from './pages/Forums';
import Marketplace from './pages/Marketplace';
import Settings from './pages/Settings';

const App = () => {
  const [signer, setSigner] = useState(null);

  return (
    <Router>
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <Link to="/" style={{ marginRight: 10 }}><Text>Home</Text></Link>
        <Link to="/voting" style={{ marginRight: 10 }}><Text>Voting</Text></Link>
        <Link to="/staking" style={{ marginRight: 10 }}><Text>Staking</Text></Link>
        <Link to="/payments" style={{ marginRight: 10 }}><Text>Payments</Text></Link>
        <Link to="/chat" style={{ marginRight: 10 }}><Text>Chat</Text></Link>
        <Link to="/forums" style={{ marginRight: 10 }}><Text>Forums</Text></Link>
        <Link to="/marketplace" style={{ marginRight: 10 }}><Text>Marketplace</Text></Link>
        <Link to="/settings"><Text>Settings</Text></Link>
      </View>
      <Routes>
        <Route path="/" element={<Home onConnect={setSigner} />} />
        <Route path="/voting" element={<Voting signer={signer} />} />
        <Route path="/staking" element={<Staking signer={signer} />} />
        <Route path="/payments" element={<Payments signer={signer} />} />
        <Route path="/chat" element={<Chat signer={signer} />} />
        <Route path="/forums" element={<Forums signer={signer} />} />
        <Route path="/marketplace" element={<Marketplace signer={signer} />} />
        <Route path="/settings" element={<Settings signer={signer} />} />
      </Routes>
    </Router>
  );
};

export default App;
