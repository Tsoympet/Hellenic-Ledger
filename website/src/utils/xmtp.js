import { Client } from '@xmtp/xmtp-js';

export async function sendMessage(signer, recipient, content) {
  const xmtp = await Client.create(signer);
  const conversation = await xmtp.conversations.newConversation(recipient);
  await conversation.send(content);
}

export async function receiveMessages(signer, recipient) {
  const xmtp = await Client.create(signer);
  const conversation = await xmtp.conversations.newConversation(recipient);
  const messages = await conversation.messages();
  return messages.map(msg => ({ sender: msg.senderAddress, content: msg.content }));
}
