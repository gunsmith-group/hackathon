import React, {useState} from "react";
import {useDispatch} from "react-redux";

import {addBlockChainLog} from "../../app/appSlice";
import LoadingGif from "../LoadingGif";
import {refreshContractState} from "./ContractState";
import {call_near_contract, get_near_contract} from "../../utils/near";

const BtnCall = ({
                     label,
                     accountId,
                     method,
                     args = {},
                     contractAddress,
                     gas = '30000000000000',
                     attachedDeposit = 0,
                     className = "no-wrap px-6 py-2 text-gray-300 bg-indigo-600 rounded-md md:ml-5 cursor-pointer",
                 }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const doCall = async () => {
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
        return <><a className={`${className} gg-color-3`}>{label} <LoadingGif/></a></>
            }

            return <a
                // className={className}
                className={`${className}`}
                onClick={doCall}>{label}</a>
}

export default BtnCall;