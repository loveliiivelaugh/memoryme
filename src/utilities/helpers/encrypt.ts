export async function encrypt(text: string, key: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedBytes.slice(0, -16); // everything but the last 16 bytes
  const tag = encryptedBytes.slice(-16); // last 16 bytes = auth tag

  return {
    ciphertext: Buffer.from(ciphertext).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    tag: Buffer.from(tag).toString("base64"),
  };
}
export async function decrypt(ciphertext: string, iv: string, tag: string, key: string) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  // Recombine ciphertext and tag
  const ctBytes = Buffer.from(ciphertext, "base64");
  const tagBytes = Buffer.from(tag, "base64");
  const combined = new Uint8Array(ctBytes.length + tagBytes.length);
  combined.set(ctBytes);
  combined.set(tagBytes, ctBytes.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(iv, "base64") },
    cryptoKey,
    combined
  );

  return new TextDecoder().decode(decryptedBuffer);
}
