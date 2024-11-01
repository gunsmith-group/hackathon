import React, {useEffect, useState} from 'react';

import Header from "../../layout/Header";
import BlockChainLogs from "../../components/sandbox/BlockChainLogs";
import {useDispatch} from "react-redux";
import {call_near_contract, call_near_readonly, get_near_contract, near_view_balance} from "../../utils/near";
import {addBlockChainLog} from "../../app/appSlice";
import {refreshContractState} from "../../components/sandbox/ContractState";
import LoadingGif from "../../components/LoadingGif";
import GGContractState from "../../components/sandbox/GGContractState";
import * as _ from "lodash";
import {randomBoxKeysLibrary} from "../../utils/keysLib";
import {keyStores, utils} from "near-api-js";
import {decode_message, encode_message} from "../../utils/nacl";

const MODERATOR_WALLET = process.env.REACT_APP_SANDBOX_MODERATOR;
const GG_CONTRACT = process.env.REACT_APP_SANDBOX_CONTRACT;
const FOUNDATION_WALLET = process.env.REACT_APP_SANDBOX_FOUNDATION;
const ACCOUNT1_WALLET = process.env.REACT_APP_SANDBOX_ACCOUNT1;
const JOIN_AMOUNT = utils.format.parseNearAmount("0.3");

const SandboxManufacturing = () => {
    const [selectedTab, setSelectedTab] = useState(1)

    const tab = (index, label) => {
        const selectTab = () => {
            // console.log('setSelectedTab', index);
            setSelectedTab(index);
        }
        if (index !== selectedTab) {
            return (
                <a onClick={selectTab}
                   className="cursor-pointer whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">{label}</a>
            )
        } else {
            return (
                <a
                   className="whitespace-nowrap border-b-2 border-indigo-500 px-1 py-4 text-sm font-medium text-indigo-600"
                   aria-current="page">{label}</a>
            )
        }
    }

    const renderContent = () => {
        switch (selectedTab) {
            case 1:
                return <form>
                    <div>
                        <_AccountBalance accountId={MODERATOR_WALLET}/>
                        <_ModConfirm/>
                    </div>
                </form>
            case 3:
                return <form>
                    <div>
                        <_AccountBalance accountId={FOUNDATION_WALLET}/>
                        <_JoinForm accountId={FOUNDATION_WALLET}/>
                        <_AddKeysForm accountId={FOUNDATION_WALLET}/>
                        <_AddDepositForm accountId={FOUNDATION_WALLET}/>
                        <_AddContractForm accountId={FOUNDATION_WALLET}/>
                        <_ViewEncodedMessage accountId={FOUNDATION_WALLET}/>
                    </div>
                </form>
            case 2:
                return <form>
                    <div>
                        <_AccountBalance accountId={ACCOUNT1_WALLET}/>
                        <_JoinForm accountId={ACCOUNT1_WALLET}/>
                        <_AddKeysForm accountId={ACCOUNT1_WALLET}/>
                        <_AddDepositForm accountId={ACCOUNT1_WALLET}/>
                        <_AddContractForm accountId={ACCOUNT1_WALLET}/>
                        <_ViewEncodedMessage accountId={ACCOUNT1_WALLET}/>
                    </div>
                </form>
            default:
                return <h1>TODO</h1>
        }
    }

    return (
        <>
            <Header selection={2}/>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tab(1, "Moderator")}
                            {tab(2, "Account1")}
                            {tab(3, "Foundation1")}
                        </nav>
                    </div>
                    {renderContent()}
                </div>
                <div>
                    <GGContractState contractAddress={GG_CONTRACT} />
                    <BlockChainLogs/>
                </div>
            </div>
        </>
    );
}

const _AccountBalance = ({accountId}) => {
    const [balance, setBalance] = useState(null);
    const fetchBalance = async () => setBalance(await near_view_balance(accountId));
    useEffect(() => {
        setBalance(null);
        fetchBalance();
    }, [accountId]);
    return (
        <div className="border-b border-gray-900/10 pb-2">
            <_LabelValue label="Account:" value={accountId}/>
            <_LabelValue label="Balance:" value={balance}/>
        </div>
    )
}

const _AddContractForm = ({accountId,
    publicMessageHint = "We may produce fpv air defense drones, weight !CLASSIFIED! kg, warhead weight !CLASSIFIED! kg, maximum speed !CLASSIFIED! metres/second, range !CLASSIFIED! km, max height !CLASSIFIED! km. Price !CLASSIFIED! in !CLASSIFIED! units package with !CLASSIFIED! upfront payment.",
    secretMessageHint = "We may produce fpv air defense drones, weight 1.5 kg, warhead weight 0.6 kg, maximum speed 45 metres/second, range 7 km, max height 5 km. Price 500 USD in 1000 units package with 50% upfront payment."
}) => {
    const [publicMessage, setPublicMessage] = useState('');
    const [secretMessage, setSecretMessage] = useState('');
    const [encodedMessage, setEncodedMessage] = useState('');
    const [modPublicKey, setModPublicKey] = useState('');
    const [senderPublicKey, setSenderPublicKey] = useState('');
    const [senderPrivateKey, setSenderPrivateKey] = useState('');
    const [senderEncodedMessage, setSenderEncodedMessage] = useState('');


    return (
        <div className="border-b border-gray-900/10 pb-12">
            <h1>Add Contract</h1>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                {/*<_Input label="Title"*/}
                {/*        id="title"*/}
                {/*        value={title}*/}
                {/*        onChange={setTitle}/>*/}
                <_TextArea label="Public Message"
                           value={publicMessage}
                           onChange={setPublicMessage}
                           hint={publicMessageHint}
                />
                <_TextArea label="Secret Message"
                           value={secretMessage}
                           onChange={setSecretMessage}
                           hint={secretMessageHint}
                />
                <_TextArea label="Moderator Encoded Message"
                           value={encodedMessage}
                           onChange={setEncodedMessage}
                           hint=""
                />
                <_TextArea label="Moderator Public Key"
                           value={modPublicKey}
                           onChange={setModPublicKey}
                           hint=""
                />
                <_TextArea label="Sender Encoded Message"
                           value={senderEncodedMessage}
                           onChange={setSenderEncodedMessage}
                           hint=""
                />
                <_TextArea label="Sender Public Key"
                           value={senderPublicKey}
                           onChange={setSenderPublicKey}
                           hint=""
                />
                <_TextArea label="Sender Private Key"
                           value={senderPrivateKey}
                           onChange={setSenderPrivateKey}
                           hint=""
                />
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_LoadModPublicKeyBtn onGenerate={setModPublicKey} enabled={modPublicKey === ''}/>
                <_LoadSenderKeysBtn setSenderPrivateKey={setSenderPrivateKey} setSenderPublicKey={setSenderPublicKey} enabled={senderPublicKey === ''} account_id={accountId}/>
                <_EncodeBtn onGenerate={setEncodedMessage} enabled={(encodedMessage === '') && (modPublicKey !== '') && (secretMessage !== '')} message={secretMessage}
                            modPublicKey={modPublicKey}
                            senderPrivateKey={senderPrivateKey}
                            senderPublicKey={senderPublicKey}
                            setSenderEncodedMessage={setSenderEncodedMessage}
                            label="Encode message for moderator"/>
                <_SubmitBtn
                    label="call add_contract()"
                    accountId={accountId}
                    method="add_contract"
                    args={{"encoded_for_moderator_message": encodedMessage, "public_message": publicMessage, "encoded_for_owner_message": senderEncodedMessage}}
                    enabled={(encodedMessage !== '') && (publicMessage !== '')}
                    contractAddress={GG_CONTRACT}
                />
            </div>
        </div>
    )
};
const _JoinForm = ({accountId}) => {
    const [title, setTitle] = useState('');
    const [publicKey, setPublicKey] = useState('');

    useEffect(() => {
        const shufledKeys = _.shuffle(randomBoxKeysLibrary.public);
        setPublicKey(shufledKeys[0])
    }, []);

    return (
        <div className="border-b border-gray-900/10 pb-12">
            <h1>Join</h1>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <_Input label="Title"
                        id="title"
                        value={title}
                        onChange={setTitle}/>
                <_TextArea label="Public Key"
                           value={publicKey}
                           onChange={setPublicKey}
                           hint="Encoding keypair, will be used for encoding of the messages to moderator"
                />
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_RandomPublicKeyBtn onGenerate={setPublicKey}/>
                <_SubmitBtn
                    label="call join()"
                    accountId={accountId}
                    method="join"
                    args={{"title": title, "public_key": publicKey}}
                    enabled={(title !== '') && (publicKey !== '')}
                    contractAddress={GG_CONTRACT}
                    attachedDeposit={JOIN_AMOUNT}
                />
            </div>
        </div>
    )
};
const _AddKeysForm = ({accountId}) => {
    const [publicKey, setPublicKey] = useState('');

    const pickRandomKey = () => {
        const shufledKeys = _.shuffle(randomBoxKeysLibrary.public);
        setPublicKey(shufledKeys[0])
    }

    useEffect(() => {
        pickRandomKey();
    }, [accountId]);

    return (
        <div className="border-b border-gray-900/10 pb-12">
            <h1>Add public key</h1>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <_TextArea label="Public Keys"
                           value={publicKey}
                           onChange={setPublicKey}
                           hint="Encoding keypairs, will be used for keyholes"
                />
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_RandomPublicKeyBtn onGenerate={setPublicKey}/>
                <_SubmitBtn
                    label="call add_keys()"
                    accountId={accountId}
                    method="add_keys"
                    args={{"public_keys": [publicKey]}}
                    enabled={(publicKey !== '')}
                    contractAddress={GG_CONTRACT}
                    beforeSubmit={() => pickRandomKey()}
                />
            </div>
        </div>
    )
};
const _ViewEncodedMessage = ({accountId}) => {
    const [contractId, setContractId] = useState(0);
    const [messageId, setMessageId] = useState(0);
    const [keyholeId, setKeyholeId] = useState(0);
    const [publicMessage, setPublicMessage] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [keyholeOwner, setKeyholeOwner] = useState('');
    const [encodedMessage, setEncodedMessage] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');

    useEffect(() => {
        setPublicMessage('');
        setPublicKey('');
        setKeyholeOwner('');
        setEncodedMessage('');
        setDecodedMessage('');
    }, [contractId, messageId, keyholeId]);

    return (
        <div className="border-b border-gray-900/10 pb-12">
            <h1>View encoded message via keyhole</h1>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <_Input label="Contract id"
                        value={contractId}
                        onChange={setContractId}
                />
                <_Input label="Message id"
                        value={messageId}
                        onChange={setMessageId}
                />
                <_Input label="Keyhole id"
                        value={keyholeId}
                        onChange={setKeyholeId}
                />

                <_TextArea label="Public Key"
                           value={publicKey}
                           onChange={setPublicKey}
                           hint=""
                />
                <_TextArea label="Encoded Message"
                           value={encodedMessage}
                           onChange={setEncodedMessage}
                           hint=""
                />
                <_TextArea label="Keyhole owner"
                           value={keyholeOwner}
                           onChange={setKeyholeOwner}
                           hint=""
                />

                {decodedMessage && <_TextArea label="Decoded Message"
                           value={decodedMessage}
                           onChange={setDecodedMessage}
                           hint=""
                />}
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_LoadKeyHoleBtn
                    contractId={contractId}
                    messageId={messageId}
                    keyholeId={keyholeId}
                    setKeyholeOwner={setKeyholeOwner}
                    setPublicKey={setPublicKey}
                    setEncodedMessage={setEncodedMessage}
                    enabled={encodedMessage === ''}
                    />
                {(keyholeOwner === accountId) && <_DecodeKeyholeBtn
                    setDecodedMessage={setDecodedMessage}
                    message={encodedMessage}
                    modPublicKey={publicKey}
                />}
            </div>
        </div>
    )
};

const _DecodeKeyholeBtn = ({
                        message, modPublicKey,
                               setDecodedMessage,
                        label= "Decode",
                        className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
                        enabled = true
                    }) => {
    const handle = async () => {
        const modPrivateKey = randomBoxKeysLibrary.private[modPublicKey];
        console.log('_DecodeKeyholeBtn', modPublicKey, modPrivateKey);

        const decoded_message = decode_message(message, modPublicKey, modPrivateKey);

        setDecodedMessage(decoded_message);
    }
    if (!enabled) {
        return ( <a className={`${className} gg-bg-3`}>{label}</a>
        );
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}

const _LoadKeyHoleBtn = ({
                               contractId, messageId, keyholeId,
                             setKeyholeOwner, setEncodedMessage, setPublicKey,
                        label= "Load keyhole",
                        className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
                        enabled = true
                    }) => {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        // const contract = await get_near_contract(MODERATOR_WALLET, GG_CONTRACT, 'get_keyhole');
        // const keyhole = await call_near_contract(MODERATOR_WALLET, contract, 'get_keyhole', {contract_id: contractId, message_id: messageId, keyhole_id: keyholeId});
        // call_near_readonly is crushed sometime, not sure why
        try {
            const keyhole = await call_near_readonly(GG_CONTRACT, 'get_keyhole', {
                contract_id: parseInt(contractId),
                message_id: parseInt(messageId),
                keyhole_id: parseInt(keyholeId)
            });
            console.log('keyhole', keyhole);
            setKeyholeOwner(keyhole.keyhole_owner);
            setPublicKey(keyhole.keyhole_public_key);
            setEncodedMessage(keyhole.encoded_keyhole_message);
        } catch (e) {

        }



        setLoading(false);
    }
    if (!enabled) {
        return ( <a className={`${className} gg-bg-3`}>{label}</a>
        );
    }
    if (loading) {
        return ( <a className={`${className} gg-bg-3`}>{label} <LoadingGif /></a>
        );
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}

const _AddDepositForm = ({accountId}) => {
    const [amount, setAmount] = useState(JOIN_AMOUNT);

    return (
        <div className="border-b border-gray-900/10 pb-12">
            <h1>Add deposit</h1>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <_Input label="Amount"
                           value={amount}
                           onChange={setAmount}
                />
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_SubmitBtn
                    label="call add_deposit()"
                    accountId={accountId}
                    method="add_deposit"
                    args={{}}
                    enabled={(amount !== '')}
                    contractAddress={GG_CONTRACT}
                    attachedDeposit={amount}
                />
            </div>
        </div>
    )
};
const _LabelValue = ({label, value}) => {
    return (
        <>
            <span className="text-sm/6 font-medium text-gray-900">{label}&nbsp;</span>
            <span className="text-sm/6 text-gray-500">{value ? value : <LoadingGif />}</span> <br/>
        </>
    )
}

const _ModConfirm = () => {
    const [accountId, setAccountId] = useState('');
    const [confirmation, setConfirmation] = useState('');

    return (
        <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
                <_Input label="Account ID"
                        id="account_id"
                    value={accountId}
                    onChange={setAccountId}/>
                <_TextArea label="Confirmation"
                    value={confirmation}
                    onChange={setConfirmation}
                />
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <_SubmitBtn
                    label="call mod_confirm()"
                    accountId={MODERATOR_WALLET}
                    method="mod_confirm"
                    args={{"account_id": accountId, "confirmation": confirmation}}
                    enabled={(accountId !== '') && (confirmation!== '')}
                    contractAddress={GG_CONTRACT}
                />
            </div>
        </div>
    )
};

const _Input = ({label, id, value, onChange}) => {
    const handleChange = (event) => onChange(event.target.value);
    return (<div className="sm:col-span-4">
        <label htmlFor={id}
               className="block text-sm/6 font-medium text-gray-900">{label}</label>
        <div className="mt-2">
            <input type="text" name={id} id={id}
                   value={value}
                   onChange={handleChange}
                   className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 "/>
        </div>
    </div>);
}

const _DisabledInput = ({label, value}) => {
    return (<div className="sm:col-span-4">
        <label
               className="block text-sm/6 font-medium text-gray-900">{label}</label>
        <div className="mt-2">
            <input type="text"
                   value={value}
                   disabled={true}
                   className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 "/>
        </div>
    </div>);
}

const _TextArea = ({label, onChange, value, hint = 'Confirmation reason explained, like "Confirmation showed on public facebook profile during 1 week"'}) => {
    const handleChange = (event) => onChange(event.target.value);
    return (
        <div className="col-span-full">
            <label htmlFor="about"
                   className="block text-sm/6 font-medium text-gray-900">{label}</label>
            <div className="mt-2">
                                <textarea id="about" name="about" rows="3"
                                          onChange={handleChange}
                                          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400" value={value}></textarea>
            </div>
            <p className="mt-3 text-sm/6 text-gray-600">{hint}</p>
        </div>
    )
}

const _RandomPublicKeyBtn = ({
                                 onGenerate,
                                 label= "Pick random public key",
                                 className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                             }) => {
    const handle = () => {
        console.log('[HANDLE]');
        const shufledKeys = _.shuffle(randomBoxKeysLibrary.public);
        onGenerate(shufledKeys[0]);
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}

const _LoadModPublicKeyBtn = ({
                                 onGenerate,
                                 label= "Load mod key",
                                 className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
                                 enabled = true
                             }) => {
    const handle = async () => {
        console.log('[HANDLE]');
        const mod_public_key = await call_near_readonly(GG_CONTRACT, 'get_mod_public_key');
        onGenerate(mod_public_key);
    }
    if (!enabled) {
        return ( <a className={`${className} gg-bg-3`}>{label}</a>
        );
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}
const _LoadSenderKeysBtn = ({
                                account_id,
                                setSenderPrivateKey,
                                 setSenderPublicKey,
                                 label= "Load sender key",
                                 className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
                                 enabled = true
                             }) => {
    const handle = async () => {
        console.log('[HANDLE]');
        const member_public_key = await call_near_readonly(GG_CONTRACT, 'get_member_public_key', {account_id});
        setSenderPublicKey(member_public_key);
        setSenderPrivateKey(randomBoxKeysLibrary.private[member_public_key]);
    }
    if (!enabled) {
        return ( <a className={`${className} gg-bg-3`}>{label}</a>
        );
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}
const _EncodeBtn = ({
                        message, modPublicKey, senderPrivateKey, senderPublicKey, setSenderEncodedMessage,
                                 onGenerate,
                                 label= "Load mod public key",
                                 className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
                                 enabled = true
                             }) => {
    const handle = async () => {
        const modPrivateKey = randomBoxKeysLibrary.private[modPublicKey];
        console.log('_EncodeBtn', modPublicKey, senderPrivateKey, senderPublicKey, modPrivateKey);

        const encoded_message = encode_message(message, modPublicKey, senderPrivateKey);
        const decoded_message = decode_message(encoded_message, senderPublicKey, modPrivateKey);

        onGenerate(encoded_message);

        const sender_encoded_message = encode_message(message, senderPublicKey, senderPrivateKey);
        const sender_decoded_message = decode_message(sender_encoded_message, senderPublicKey, senderPrivateKey);
        setSenderEncodedMessage(sender_encoded_message);

        console.log('[ENCODING]', encoded_message, decoded_message, sender_encoded_message, sender_decoded_message);
    }
    if (!enabled) {
        return ( <a className={`${className} gg-bg-3`}>{label}</a>
        );
    }
    return ( <a className={`${className} cursor-pointer`} onClick={handle}>{label}</a>
    );
}

const _SubmitBtn = ({
                        label,
                        accountId,
                        method,
                        args = {},
                        contractAddress,
                        gas = '30000000000000',
                        attachedDeposit = 0,
                        className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm",
    // focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:bg-indigo-500
                        enabled=true,
                        beforeSubmit = () => {}
                    }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    console.log('[BTN]', enabled);

    const doCall = async () => {
        beforeSubmit();
        setLoading(true);
        const contract = await get_near_contract(accountId, contractAddress, method);
        await call_near_contract(
            accountId,
            contract,
            method,
            args,
            attachedDeposit,
            gas,
            (data) => {
                dispatch(addBlockChainLog(data));
                refreshContractState(contractAddress);
            },
            (data) => dispatch(addBlockChainLog(data)),
        );
        setLoading(false);
    }
    if (loading) {
        return  <a className={`${className} gg-bg-3`}>{label} <LoadingGif/></a>

    }
    if (!enabled) {
        return <a className={`${className} gg-bg-3`}>{label}</a>
    }

    return ( <a className={`${className} cursor-pointer`} onClick={doCall}>{label}</a>
    );
}

export default SandboxManufacturing;