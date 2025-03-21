import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import Voting from './screens/Voting';
import Staking from './screens/Staking';
import Payments from './screens/Payments';
import Chat from './screens/Chat';
import Forums from './screens/Forums';
import Marketplace from './screens/Marketplace';
import Settings from './screens/Settings';

const Stack = createStackNavigator();

const App = () => {
  const [signer, setSigner] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={() => <Home onConnect={setSigner} />} />
        <Stack.Screen name="Voting" component={() => <Voting signer={signer} />} />
        <Stack.Screen name="Staking" component={() => <Staking signer={signer} />} />
        <Stack.Screen name="Payments" component={() => <Payments signer={signer} />} />
        <Stack.Screen name="Chat" component={() => <Chat signer={signer} />} />
        <Stack.Screen name="Forums" component={() => <Forums signer={signer} />} />
        <Stack.Screen name="Marketplace" component={() => <Marketplace signer={signer} />} />
        <Stack.Screen name="Settings" component={() => <Settings signer={signer} />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
