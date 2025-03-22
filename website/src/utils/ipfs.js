import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001' });

export async function postToForum(content) {
  const encrypted = JSON.stringify(content); // Placeholder encryption
  const cid = await ipfs.add(encrypted);
  return cid.path;
}

export async function getForumThreads() {
  // Placeholder: Fetch threads
  return [{ title: "Test Thread", content: "Test content" }];
}
