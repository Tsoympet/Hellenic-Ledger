import React from 'react';

const NFTCard = ({ id, name, price, onBuy }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
      <h3>{name} (ID: {id})</h3>
      <p>Price: {price} Talanton</p>
      <button onClick={() => onBuy(id)}>Buy</button>
    </div>
  );
};

export default NFTCard;
