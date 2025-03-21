import React from 'react';
import { View, Text, Button } from 'react-native';

const NFTCard = ({ id, name, price, onBuy }) => {
  return (
    <View style={{ padding: 10, borderWidth: 1, margin: 5 }}>
      <Text>{name} (ID: {id})</Text>
      <Text>Price: {price} Talanton</Text>
      <Button title="Buy" onPress={() => onBuy(id)} />
    </View>
  );
};

export default NFTCard;
