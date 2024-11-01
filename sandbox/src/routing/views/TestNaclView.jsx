import React, {useContext, useEffect, useState} from 'react';

import ShowData from "../../components/dev/ShowData";
import {
    confirm_signature,
    // decryptMessage,
    // encryptMessage,
    exportKeyPair, generateRandomBoxKeyPair,
    generateRandomKeyPair,
    sign_message
} from "../../utils/nacl";

 function TestNaclView () {
     const [data, setData] = useState(null)
     const testSignature = () => {
        const randomKeys = generateRandomKeyPair();
        const stringKeys = exportKeyPair(randomKeys);
        const message = "Test message";
        // const encryptedMessage = encryptMessage(message, randomKeys.publicKey);
        // const decryptedMessage = decryptMessage(encryptedMessage.ciphertext, encryptedMessage.nonce, randomKeys.publicKey, randomKeys.secretKey);

         const signature = sign_message(message, stringKeys.privateKeyString);
         const confirmSignature = confirm_signature(signature, stringKeys.publicKeyString);

         setData({
            key: exportKeyPair(randomKeys),
            message,
            signature,
            confirmSignature
        })
     }
     const testEncode = () => {
         const sender = generateRandomKeyPair();
         const recipient = generateRandomKeyPair();
         const message = "Test message";
         // const encryptedMessage = encryptMessage(message, recipient.publicKey, sender.secretKey);
         // const decryptedMessage = decryptMessage(encryptedMessage.ciphertext, encryptedMessage.nonce, sender.publicKey, recipient.secretKey);

         setData({
             sender: exportKeyPair(sender),
             recipient: exportKeyPair(recipient),
             message,
             // encryptedMessage,
             // decryptedMessage
         })
     }

     useEffect(() => {
         let randomKeys = {public: [], private: {}};
         for (let i = 0; i < 250; i++) {
             const key = exportKeyPair(generateRandomBoxKeyPair());
             randomKeys.public.push(key.publicKeyString);
             randomKeys.private[key.publicKeyString] = key.privateKeyString;
         }
         setData(randomKeys);
     }, []);

    return(
        <div>
            <div className="container p-8 mx-auto xl:px-0 ">
                <h1>Test encrypt / decrypt / sign / confirm</h1>
                <p>XXX</p>
                <ShowData data={{data}}/>
                <a className="px-6 py-2 text-white bg-indigo-600 rounded-md md:ml-5 cursor-pointer"
                   onClick={testEncode}> TEST </a> <br/><br/>
            </div>
        </div>
    )
 }

export default TestNaclView;