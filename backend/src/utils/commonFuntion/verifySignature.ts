import { Ed25519PublicKey, Ed25519Signature } from '@aptos-labs/ts-sdk';

export const verifySignatureAptos = (
  message: string,
  signature: string | number[],
  publicKeyHex: string,
): boolean => {
  try {
    if (!message || !signature || !publicKeyHex) return false;

    const publicKey = new Ed25519PublicKey(publicKeyHex);
    let sigBytes: Uint8Array;

    if (typeof signature === 'string') {
      if (/^[0-9a-fA-F]+$/.test(signature.replace(/^0x/, ''))) {
        const hex = signature.startsWith('0x') ? signature.slice(2) : signature;
        const bytes = hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
        sigBytes = new Uint8Array(bytes);
      } else {
        const buff = Buffer.from(signature, 'base64');
        sigBytes = new Uint8Array(buff);
      }
    } else {
      sigBytes = new Uint8Array(signature);
    }

    const msgBytes = new TextEncoder().encode(message);
    const edSig = new Ed25519Signature(sigBytes);
    return publicKey.verifySignature({ message: msgBytes, signature: edSig });
  } catch (e) {
    return false;
  }
};
