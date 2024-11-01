import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

export const generateRandomKeyPair = () => nacl.sign.keyPair();
export const generateRandomBoxKeyPair = () => nacl.box.keyPair();

export const exportKeyPair = (keyPair) => {
    return {
        // publicKeyString: 'ed25519:' + util.encodeBase64(keyPair.publicKey),
        // privateKeyString: 'ed25519:' + util.encodeBase64(keyPair.secretKey),
        publicKeyString: util.encodeBase64(keyPair.publicKey),
        privateKeyString: util.encodeBase64(keyPair.secretKey),
    }
}

export const sign_message = (message, privateKeyString) => {
    const messageUint8 = util.decodeUTF8(message);
    const privateKey = util.decodeBase64(privateKeyString);
    if (privateKey.length !== 64) {
        throw new Error('Bad secret key size: Ed25519 private key must be 64 bytes long, you provided ' + privateKey.length + ' bytes');
    }
    const signedMessage = nacl.sign(messageUint8, privateKey);
    return util.encodeBase64(signedMessage);
}

export const confirm_signature = (signedMessageString, publicKeyString) => {
    const signedMessage = util.decodeBase64(signedMessageString);
    const publicKey = util.decodeBase64(publicKeyString);
    const verifiedMessage = nacl.sign.open(signedMessage, publicKey);
    if (!verifiedMessage) {
        return false;
    }
    return util.encodeUTF8(verifiedMessage);
}

// Function to encode a message
export const encode_message = (message, recipientPublicKeyString, senderPrivateKeyString) => {
    // Convert the strings to Uint8Array
    const messageUint8 = util.decodeUTF8(message);
    const recipientPublicKey = util.decodeBase64(recipientPublicKeyString);
    let senderPrivateKey = util.decodeBase64(senderPrivateKeyString);
    if (senderPrivateKey.length === 64) {
        senderPrivateKey = senderPrivateKey.slice(32);
    }

    // Encrypt the message
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encryptedMessage = nacl.box(messageUint8, nonce, recipientPublicKey, senderPrivateKey);

    // Return the nonce and encrypted message as base64 strings
    // return {
    //     nonce: util.encodeBase64(nonce),
    //     message: util.encodeBase64(encryptedMessage)
    // };
    return util.encodeBase64(nonce) + '.' + util.encodeBase64(encryptedMessage);
};

// Function to decode a message
export const decode_message = (encryptedMessage, senderPublicKeyString, recipientPrivateKeyString) => {
    // Extract nonce and message
    const parts = encryptedMessage.split('.');
    const nonce = util.decodeBase64(parts[0]);
    const message = util.decodeBase64(parts[1]);
    const senderPublicKey = util.decodeBase64(senderPublicKeyString);
    let recipientPrivateKey = util.decodeBase64(recipientPrivateKeyString);
    if (recipientPrivateKey.length === 64) {
        recipientPrivateKey = recipientPrivateKey.slice(32);
    }
    // Decrypt the message
    const decryptedMessage = nacl.box.open(message, nonce, senderPublicKey, recipientPrivateKey);

    // Check if decryption was successful
    if (!decryptedMessage) {
        throw new Error("Failed to decrypt message");
    }

    // Return the decrypted message as a string
    return util.encodeUTF8(decryptedMessage);
};