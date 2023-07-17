import crypto from "crypto";

// OUR encryption key is the uid of the user
function encryptToken(state: string, token: object, encryptionKey: string) {
  const jsonString = JSON.stringify(token);

  // Convert hexadecimal state to buffer
  const stateBuffer = Buffer.from(state.slice(2), "hex");
  const iv = Buffer.alloc(12);
  // Copy the state buffer into the IV buffer
  stateBuffer.copy(iv);

  // Create encryption key
  const key = Buffer.alloc(16, encryptionKey, "hex");

  const cipher = crypto.createCipheriv("aes-128-ccm", key, iv, {
    authTagLength: 16,
  });

  const encryptedData = Buffer.concat([
    cipher.update(jsonString, "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  console.log(encryptedData, jsonString);
  return encryptedData.toString("hex");
}

function decryptToken(
  encryptedData: any,
  state: string,
  encryptionKey: string
) {
  // Convert hexadecimal state to buffer
  const stateBuffer = Buffer.from(state.slice(2), "hex");
  const iv = Buffer.alloc(12);
  // Copy the state buffer into the IV buffer
  stateBuffer.copy(iv);

  // Create encryption key
  const key = Buffer.alloc(16, encryptionKey, "hex");

  const decipher = crypto.createDecipheriv("aes-128-ccm", key, iv, {
    authTagLength: 16,
  });

  // Create a buffer from the encrypted data, then transform it into a uint8array
  const encryptedBuffer = Uint8Array.from(Buffer.from(encryptedData, "hex"));
  // Slice out auth tag and payload from the array
  const authTag = encryptedBuffer.slice(encryptedBuffer.length - 16);
  const encryptedPayload = encryptedBuffer.slice(
    0,
    encryptedBuffer.length - 16
  );

  decipher.setAuthTag(authTag);

  const decryptedData = Buffer.concat([
    Buffer.from(decipher.update(encryptedPayload)),
    Buffer.from(decipher.final()),
  ]).toString("utf8");

  return decryptedData;
}
