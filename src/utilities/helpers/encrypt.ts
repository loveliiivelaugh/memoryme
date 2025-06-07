// encryption.util.ts
const ivLength = 12; // AES-GCM recommended IV length

export async function encrypt(text: string, key: string) {
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  return {
    ciphertext: Buffer.from(encrypted).toString("base64"),
    iv: Buffer.from(iv).toString("base64")
  };
}

export async function decrypt(ciphertext: string, iv: string, key: string) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(iv, "base64") },
    cryptoKey,
    Buffer.from(ciphertext, "base64")
  );

  return new TextDecoder().decode(decrypted);
}
