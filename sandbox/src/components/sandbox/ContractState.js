import React, {useEffect, useState} from 'react';
import ReactJsonView from "@microlink/react-json-view";
import {providers} from "near-api-js";
import PubSub from 'pubsub-js';

import LoadingGif from "../LoadingGif";
import {call_near_readonly, near_get_state} from "../../utils/near";

const REFRESH_CONTRACT_STATE = 'REFRESH_CONTRACT_STATE';
export const refreshContractState = (contractAddress) => {
    PubSub.publish(REFRESH_CONTRACT_STATE, contractAddress);
}

const ContractState = ({contractAddress}) => {
    const [contractState, setContractState] = useState(null)

    const getState = async () => {
        // const res = await near_get_state(contractAddress);
        // setContractState(res)
    }

    let pubSubSubscription = null;
    const pubSubSubscriber = (msg, data) => {
        console.log('[ContractState] pubSubSubscriber got msg', msg, data);
        if ((msg === REFRESH_CONTRACT_STATE) && (data = contractAddress)) {
            setContractState(null);
        }
    }

    useEffect(() => {
        getState();
        pubSubSubscription = PubSub.subscribe(REFRESH_CONTRACT_STATE, pubSubSubscriber);
    }, [() => {
        if (pubSubSubscription) {
            console.log("pubSubSubscription unsubscribe");
            PubSub.unsubscribe(pubSubSubscription);
        } else {
            console.error("pubSubSubscription is not set")
        }

    }]);

    if (!contractState) {
        return <LoadingGif />
    }

    return <div className="contract-state rounded-lg shadow m-2">
        <a className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50" href={`https://testnet.nearblocks.io/address/${contractAddress}`} target="_blank">open Near Blocks</a>
        <ReactJsonView src={contractState}/>
    </div>
}

export default ContractState;