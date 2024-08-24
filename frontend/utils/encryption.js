import * as paillierBigint from "paillier-bigint";

export const encryptFile = async (file) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const fileContent = new Uint8Array(fileArrayBuffer);

  const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(
    512
  );

  const encryptedData = [];
  fileContent.forEach((byte) => {
    const encrypted = publicKey.encrypt(BigInt(byte));

    const byteArray = encrypted
      .toString()
      .split("")
      .map((char) => char.charCodeAt(0));
    encryptedData.push(...byteArray);
  });

  return new Blob([new Uint8Array(encryptedData)], {
    type: "application/octet-stream",
  });
};

const addLaplaceNoise = (value, epsilon = 1.0, sensitivity = 1.0) => {
  const scale = sensitivity / epsilon;
  const uniformRandom = Math.random() - 0.5;
  return (
    value +
    -(scale * Math.sign(uniformRandom)) *
      Math.log(1 - 2 * Math.abs(uniformRandom))
  );
};

export const applyDifferentialPrivacy = (data) => {
  return data.map((item) => addLaplaceNoise(item));
};
