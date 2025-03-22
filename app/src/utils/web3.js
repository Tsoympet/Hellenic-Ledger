import { ethers } from 'ethers';

const politeiaABI = [...]; // ABI from HellenicPoliteia.sol
const talantonABI = [...]; // ABI from Talanton.sol
const drachmaABI = [...]; // ABI from Drachma.sol
const obolosABI = [...]; // ABI from Obolos.sol
const titanicNFTABI = [...]; // ABI from TitanicNFT.sol

const politeiaAddress = "0x..."; // Replace with deployed address
const talantonAddress = "0x...";
const drachmaAddress = "0x...";
const obolosAddress = "0x...";
const titanicNFTAddress = "0x...";

export async function getMotions(signer) {
  const politeia = new ethers.Contract(politeiaAddress, politeiaABI, signer);
  // Placeholder: Fetch motions (implement with actual logic)
  return [{ id: 0, title: "Test Motion", description: "Test", role: null }];
}

export async function voteForMotion(signer, motionId, inFavor) {
  const politeia = new ethers.Contract(politeiaAddress, politeiaABI, signer);
  const tx = await politeia.voteForMotion(motionId, inFavor);
  await tx.wait();
}

export async function voteForRole(signer, role, electionId) {
  const politeia = new ethers.Contract(politeiaAddress, politeiaABI, signer);
  const tx = await politeia.voteForRole(role, electionId);
  await tx.wait();
}

export async function stakeTalanton(signer, amount) {
  const talanton = new ethers.Contract(talantonAddress, talantonABI, signer);
  const tx = await talanton.stake(ethers.parseEther(amount));
  await tx.wait();
}

export async function stakeDrachma(signer, amount) {
  const drachma = new ethers.Contract(drachmaAddress, drachmaABI, signer);
  const tx = await drachma.stake(ethers.parseEther(amount));
  await tx.wait();
}

export async function stakeObolos(signer, amount) {
  const obolos = new ethers.Contract(obolosAddress, obolosABI, signer);
  const tx = await obolos.stake(ethers.parseEther(amount));
  await tx.wait();
}

export async function payTalanton(signer, recipient, amount) {
  const talanton = new ethers.Contract(talantonAddress, talantonABI, signer);
  const tx = await talanton.transfer(recipient, ethers.parseEther(amount));
  await tx.wait();
}

export async function payDrachma(signer, recipient, amount) {
  const drachma = new ethers.Contract(drachmaAddress, drachmaABI, signer);
  const tx = await drachma.transfer(recipient, ethers.parseEther(amount));
  await tx.wait();
}

export async function payObolos(signer, recipient, amount) {
  const obolos = new ethers.Contract(obolosAddress, obolosABI, signer);
  const tx = await obolos.transfer(recipient, ethers.parseEther(amount));
  await tx.wait();
}

export async function mineTalanton(signer, nonce) {
  const talanton = new ethers.Contract(talantonAddress, talantonABI, signer);
  const tx = await talanton.mine(nonce);
  await tx.wait();
}

export async function getNFTs(signer) {
  const titanicNFT = new ethers.Contract(titanicNFTAddress, titanicNFTABI, signer);
  // Placeholder: Fetch NFTs (implement with actual logic)
  return [{ id: 1, name: "Titanic NFT", price: "10" }];
}

export async function buyNFT(signer, id) {
  const talanton = new ethers.Contract(talantonAddress, talantonABI, signer);
  // Placeholder: Buy NFT (implement with actual marketplace logic)
  const tx = await talanton.transfer(titanicNFTAddress, ethers.parseEther("10"));
  await tx.wait();
}
