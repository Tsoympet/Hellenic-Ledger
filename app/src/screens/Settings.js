import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { setupRecovery } from '../utils/security';

const Settings = ({ signer }) => {
  const [trustedContacts, setTrustedContacts] = useState(['', '', '']);

  const handleSetupRecovery = async () => {
    await setupRecovery(signer, trustedContacts);
    console.log("Recovery setup complete");
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text>Setup Account Recovery</Text>
      {trustedContacts.map((contact, index) => (
        <TextInput
          key={index}
          value={contact}
          onChangeText={(text) => {
            const newContacts = [...trustedContacts];
            newContacts[index] = text;
            setTrustedContacts(newContacts);
          }}
          placeholder={`Trusted Contact ${index + 1}`}
          style={{ borderWidth: 1, marginVertical: 5 }}
        />
      ))}
      <Button title="Setup Recovery" onPress={handleSetupRecovery} />
    </View>
  );
};

export default Settings;
