/**
 * Generates an ECDH P-256 Key Pair for Perfect Forward Secrecy (PFS)
 */
export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

/**
 * Exports a public CryptoKey to raw Base64 format for network transmission
 */
export async function exportPublicKey(key) {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Imports a Base64 SPKI public key back into a CryptoKey
 */
export async function importPublicKey(base64Key) {
  const binaryDer = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

/**
 * Derives a symmetric AES-GCM key from local private key and remote public key
 */
export async function deriveSharedSecret(privateKey, publicKey) {
  return await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plain text using AES-GCM
 */
export async function encryptMessage(secretKey, text) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    secretKey,
    enc.encode(text)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
  };
}

/**
 * Decrypts AES-GCM encrypted payload
 */
export async function decryptMessage(secretKey, ciphertext, ivBase64) {
  const dec = new TextDecoder();
  const encryptedBuf = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const ivBuf = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuf },
    secretKey,
    encryptedBuf
  );

  return dec.decode(decrypted);
}
