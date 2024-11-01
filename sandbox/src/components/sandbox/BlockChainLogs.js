import React, {useState} from "react";
import ShowData from "../dev/ShowData";
import {useSelector} from "react-redux";
import ReactTimeAgo from 'react-time-ago';

const BlockChainLogs = () => {
    const blockChainLogs = useSelector(state => state.appSlice.blockChainLogs);

    return (
        <ul role="list" className="space-y-6">
            {blockChainLogs.map(item => <_Item item={item}/>)}
        </ul>
    )
}

const _Item = ({item}) => {
    const [rawVisible, setRawVisible] = useState(false);

    const toggleRawVisible = () => setRawVisible(!rawVisible);

    switch (item.type) {
        case "error":
            return (
                <>
                    <li className="relative flex gap-x-4 cursor-pointer" onClick={toggleRawVisible}>
                        <div className="absolute -bottom-6 left-0 top-0 flex w-6 justify-center">
                            <div className="w-px bg-gray-200"></div>
                        </div>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                            <svg className="svg-icon"
                                 viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M512 853.333333a341.333333 341.333333 0 1 1 341.333333-341.333333 341.333333 341.333333 0 0 1-341.333333 341.333333z m0-768a426.666667 426.666667 0 1 0 426.666667 426.666667A426.666667 426.666667 0 0 0 512 85.333333z m110.506667 256L512 451.84 401.493333 341.333333 341.333333 401.493333 451.84 512 341.333333 622.506667 401.493333 682.666667 512 572.16 622.506667 682.666667 682.666667 622.506667 572.16 512 682.666667 401.493333z"
                                    fill="#B00020"/>
                            </svg>
                        </div>
                        <p className="flex-auto py-0.5 text-xs/5 text-gray-500"><span className="font-medium text-gray-900">{item.method} (@{item.accountId})</span> {item.msg} <ShowData data={item.args}/></p>
                        <time dateTime="2023-01-24T09:12" className="flex-none py-0.5 text-xs/5 text-gray-500">{item.date} </time>
                    </li>
                    <li>{rawVisible && <ShowData data={item} />}</li>
                </>
            );
        case "call":
            return (
                <>
                    <li className="relative flex gap-x-4" onClick={toggleRawVisible}>
                        <div className="absolute left-0 top-0 flex h-6 w-6 justify-center">
                            <div className="w-px bg-gray-200"></div>
                        </div>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                            <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"
                                 aria-hidden="true"
                                 data-slot="icon">
                                <path fillRule="evenodd"
                                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                        <p className="flex-auto py-0.5 text-xs/5 text-gray-500"><span
                            className="font-medium text-gray-900">{item.method} (@{item.accountId})</span> <ShowData data={item.args}/> </p>
                        <time dateTime="2023-01-24T09:20" className="flex-none py-0.5 text-xs/5 text-gray-500">{item.date}
                        </time>
                    </li>
                    <li>{rawVisible && <ShowData data={item}/>}</li>
                </>
            )
    }
}

export default BlockChainLogs;