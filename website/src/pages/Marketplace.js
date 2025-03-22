import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import NFTCard from '../components/NFTCard';
import { getNFTs, buyNFT } from '../utils/web3';

const Marketplace = ({ signer }) => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (signer) {
        const nftData = await getNFTs(signer);
        setNfts(nftData);
      }
    };
    fetchNFTs();
  }, [signer]);

  const handleBuy = async (id) => {
    await buyNFT(signer, id);
    const updatedNFTs = await getNFTs(signer);
    setNfts(updatedNFTs);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={nfts}
        renderItem={({ item }) => (
          <NFTCard id={item.id} name={item.name} price={item.price} onBuy={handleBuy} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Marketplace;
