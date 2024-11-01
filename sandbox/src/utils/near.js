import {connect, Contract, InMemorySigner, KeyPair, keyStores, providers} from "near-api-js";
import {format} from "date-fns";
import * as dotProp from "dot-prop-immutable";
import {utils} from "near-api-js";

export const get_near_contract = async (accountId, contractAddress, method) => {
    const myKeyStore = new keyStores.InMemoryKeyStore();
    const keyPair = KeyPair.fromString(process.env.REACT_APP_SANDBOX_PRIVATE_KEY);
    const networkId = "testnet";
    await myKeyStore.setKey(networkId, accountId, keyPair);

    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair);
    const config = {
        networkId: 'testnet',
        // myKeyStore,
        deps: { keyStore: signer.keyStore },
        nodeUrl: 'https://rpc.testnet.near.org',
    };
    const near = await connect(config);
    const account = await near.account(accountId);
    return new Contract(account, contractAddress, {
        changeMethods: [method],
    });
}


export const call_near_contract = async (accountId,
                                         contract,
                                         method,
                                        args = {},
                                        attachedDeposit = 0,
                                         gas = '30000000000000',
                                         onSuccess = (data) => {},
                                         onError = (data) => {},
                                         ) => {
    console.log('[Near call]', contract, method, args, attachedDeposit, gas);
    try {

        let result;
        if (attachedDeposit) {
            result = await contract[method](args, gas, attachedDeposit);
        } else {
            result = await contract[method](args);
        }
        console.log('callContract done - ', result);
        onSuccess({"type": "call", accountId, method, args, result, date: format(new Date(), "HH:ii:ss")});
        return result;
    } catch (error) {
        console.log('Error - ', error);
        onError({"type": "error", accountId, method, args, "raw": error, "msg": dotProp.get(error, "kind.kind.FunctionCallError.ExecutionError", "Cant parse error, click for details"), date: format(new Date(), "HH:ii:ss")});
    }
}

export const call_near_readonly = async (account_id, method_name, args = {}) => {
    const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");

    const rawResult = await provider.query({
        request_type: "call_function",
        account_id,
        method_name,
        args_base64: btoa(JSON.stringify(args)), // "e30=",
        finality: "optimistic",
    });

    return JSON.parse(Buffer.from(rawResult.result).toString());
}

export const near_view_balance = async (account_id) => {
    const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");

    const response = await provider.query({
        request_type: "view_account",
        finality: "final",
        account_id: account_id,
    });
    console.log('near_view_balance', account_id, response);
    if (response) {
        return parseFloat(utils.format.formatNearAmount(response.amount)).toFixed(4);
    }
}