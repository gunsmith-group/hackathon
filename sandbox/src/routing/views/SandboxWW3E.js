import React, {useEffect, useState} from 'react';
import * as _ from 'lodash';
import useOnClickOutside from 'use-onclickoutside'

import Header from "../../layout/Header";
import BlockChainLogs from "../../components/sandbox/BlockChainLogs";
import ContractState, {refreshContractState} from "../../components/sandbox/ContractState";
import BtnCall from "../../components/sandbox/BtnCall";
import BlockAndFewBtns from "../../components/sandbox/layout/BlockAndFewBtns";
import {randomKeysLibrary} from "../../utils/keysLib";
import BreadCrumbs from "../../components/sandbox/layout/BreadCrumbs";
import LoadingGif from "../../components/LoadingGif";
import {call_near_contract, call_near_readonly, get_near_contract, near_view_balance} from "../../utils/near";
import {addBlockChainLog} from "../../app/appSlice";
import {useDispatch} from "react-redux";
import {exportKeyPair, generateRandomKeyPair, sign_message} from "../../utils/nacl";

const WW3E_SMART_CONTRACT = process.env.REACT_APP_SANDBOX_WW3E_CONTRACT;

const SandboxWW3E = () => {
    const [loadingStep, setLoadingStep] = useState(true);
    const [step, setStep] = useState(1);
    const [randomPublicKeys, setRandomPublicKeys] = useState(_.shuffle(randomKeysLibrary.public));
    const WW3E_SMART_CONTRACT = 'dev1_redacted-near-hackathon.testnet';

    const handleRegenerateRandomKeys = () => setRandomPublicKeys(_.shuffle(randomKeysLibrary.public));
    const handleRefreshStep = () => setLoadingStep(true)

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div className="flex">
                            <BreadCrumbs label1="WW3E" label2="Phase 1 - Register all countries and goverment keys"/>
                            <_Dev1 handleRegenerateRandomKeys={handleRegenerateRandomKeys} handleRefreshStep={handleRefreshStep} moderatorWallet={process.env.REACT_APP_SANDBOX_WW3E_MODERATOR}/>
                        </div>
                        <ul role="list" className="grid grid-cols-2 gap-6">
                            <_Step1Country countryTitle="Canada" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_CA} publicKey={randomPublicKeys[0]} />
                            <_Step1Country countryTitle="China" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_CN} publicKey={randomPublicKeys[1]} />
                            <_Step1Country countryTitle="EU" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_EU} publicKey={randomPublicKeys[2]} />
                            <_Step1Country countryTitle="Ukraine" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_UA} publicKey={randomPublicKeys[3]} />
                            <_Step1Country countryTitle="USA" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_USA} publicKey={randomPublicKeys[4]} />

                        </ul>
                        <h1 className="mt-5">Dark side</h1>
                        <ul role="list" className="grid grid-cols-2 gap-6">
                            <_Step1Country countryTitle="Moskovia (ex. west russian federation)" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_EX_RF} publicKey={randomPublicKeys[5]} />
                            <_Step1Country countryTitle="North Corea" accountWallet={process.env.REACT_APP_SANDBOX_WW3E_NC} publicKey={randomPublicKeys[6]} />
                        </ul>
                    </>
            )
            case 2:
                return (
                    <>
                        <div className="flex">
                            <BreadCrumbs label1="WW3E" label2="Phase 2 - Register weapons"/>
                            <_Dev2 handleRegenerateRandomKeys={handleRegenerateRandomKeys}
                                   handleRefreshStep={handleRefreshStep}
                                   moderatorWallet={process.env.REACT_APP_SANDBOX_WW3E_MODERATOR}/>
                        </div>
                        <ul role="list" className="grid grid-cols-1 gap-6">
                            <_Step2AddWeapon/>
                            <_Step2AddPermit/>
                        </ul>
                    </>
                )
        }
    }

    const loadPhase = async () => {
        const res = await call_near_readonly(WW3E_SMART_CONTRACT, "get_phase");
        setStep(res);
        setLoadingStep(false);
    }

    useEffect(() => {
        loadPhase();
    }, [loadingStep]);

    if (loadingStep) {
        return <LoadingGif/>
    }

    return (
        <>
        <Header selection={1}/>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4">{renderStep()}</div>
                <div>
                    {/*<ContractState contractAddress={WW3E_SMART_CONTRACT}/>*/}
                    <BlockChainLogs/>
                </div>
            </div>
        </>
    );
}

const _Step1Country = ({countryTitle, accountWallet, publicKey}) => {
    const [balance, setBalance] = useState(null);
    const fetchBalance = async () => setBalance(await near_view_balance(accountWallet));
    useEffect(() => {
        fetchBalance();
    }, []);
    return <BlockAndFewBtns title={countryTitle}
                            subtitle={balance}
                            accountTitle={accountWallet}
                            publicKey={publicKey}
                            btns={[
                                <BtnCall
                                    label="add_responsible_weapon_holder()"
                                    accountId={accountWallet}
                                    contractAddress={WW3E_SMART_CONTRACT}
                                    args={{title: countryTitle, public_key: publicKey}}
                                    method="add_responsible_weapon_holder"
                                    attachedDeposit='11000000000000000000000'
                                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold gg-color-1 cursor-pointer"
                                />
                            ]}
    />
}

const _Step2AddWeapon = ({countryTitle, accountWallet, publicKey}) => {
    const [selectedWeaponHolder, setSelectedWeaponHolder] = useState(process.env.REACT_APP_SANDBOX_WW3E_CA);
    const randKey = exportKeyPair(generateRandomKeyPair());

    const selectWeaponHolder = event => setSelectedWeaponHolder(event.target.value);
    return <BlockAndFewBtns title="Add Weapon"
                            accountTitle={accountWallet}
                            publicKey={publicKey}
                            btns={[
                                <BtnCall
                                    label="add_weapon()"
                                    accountId={selectedWeaponHolder}
                                    contractAddress={WW3E_SMART_CONTRACT}
                                    args={{public_key: randKey.publicKeyString}}
                                    method="add_weapon"
                                    attachedDeposit='11000000000000000000000'
                                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold gg-color-1 cursor-pointer"
                                />
                            ]}
                            customBody={
                                <>
                                    <div>
                                        <label htmlFor="location"
                                               className="block text-sm/6 font-medium text-gray-900">Weapon holder</label>
                                        <select id="location" name="location" onChange={selectWeaponHolder}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6">
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_CA}>Canada</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_CN}>China</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_EU}>Europe</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_UA}>Ukraine</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_USA}>USA</option>
                                        </select>
                                    </div>
                                </>
                            }
    />
}
const _Step2AddPermit = ({countryTitle, accountWallet, publicKey}) => {
    const [selectedWeaponHolder, setSelectedWeaponHolder] = useState(process.env.REACT_APP_SANDBOX_WW3E_CA);
    const randKey = exportKeyPair(generateRandomKeyPair());
    const signature = sign_message("CMD_ACTIVATE_WEAPON", randKey.privateKeyString);

    const selectWeaponHolder = event => setSelectedWeaponHolder(event.target.value);
    return <BlockAndFewBtns title="Add Weapon Activation Permit"
                            accountTitle={accountWallet}
                            publicKey={publicKey}
                            btns={[
                                <BtnCall
                                    label="add_weapon_activation_permit()"
                                    accountId={selectedWeaponHolder}
                                    contractAddress={WW3E_SMART_CONTRACT}
                                    args={{weapon_id: 0, signature: signature}}
                                    method="add_weapon_activation_permit"
                                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold gg-color-1 cursor-pointer"
                                />
                            ]}
                            customBody={
                                <>
                                    <div>
                                        <label htmlFor="location"
                                               className="block text-sm/6 font-medium text-gray-900">Signer</label>
                                        <select id="location" name="location" onChange={selectWeaponHolder}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6">
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_CA}>Canada</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_CN}>China</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_EU}>Europe</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_UA}>Ukraine</option>
                                            <option value={process.env.REACT_APP_SANDBOX_WW3E_USA}>USA</option>
                                        </select>
                                    </div>
                                </>
                            }
    />
}

const _Dev1 = ({handleRegenerateRandomKeys, handleRefreshStep, moderatorWallet}) => {
    return <_DevBtn
    >
        <div
            className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu" aria-orientation="vertical" aria-labelledby="option-menu-button" tabIndex="-1">
            <div className="py-1" role="none">
                <a onClick={handleRegenerateRandomKeys} className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                   role="menuitem" tabIndex="-1"
                   id="option-menu-item-0">Regenerate random keys</a>
            </div>
            <div className="py-1" role="none">
                <_ChangePhaseLink handleRefreshStep={handleRefreshStep} moderatorWallet={moderatorWallet}/>
                <_ResetLink handleRefreshStep={handleRefreshStep} moderatorWallet={moderatorWallet}/>
            </div>
        </div>
    </_DevBtn>
}
const _Dev2 = ({handleRefreshStep, moderatorWallet}) => {
    return <_DevBtn
    >
        <div
            className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu" aria-orientation="vertical" aria-labelledby="option-menu-button" tabIndex="-1">
            <div className="py-1" role="none">
                {/*<_ChangePhaseLink handleRefreshStep={handleRefreshStep} moderatorWallet={moderatorWallet}/>*/}
                <_ResetLink handleRefreshStep={handleRefreshStep} moderatorWallet={moderatorWallet}/>
            </div>
        </div>
    </_DevBtn>
}
const _DevBtn = ({children}) => {
        const [popupVisible, setPopupVisible] = useState(false);

        const togglePopup = () => setPopupVisible(!popupVisible);
        const ref = React.useRef(null)
        const closePopup = () => setPopupVisible(false);
        useOnClickOutside(ref, closePopup)

        return (

        <div className="ml-auto">
        <div className="inline-flex rounded-md shadow-sm" ref={ref}>
        <button type="button"
                className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                onClick={togglePopup}>DEV
        </button>
        <div className="relative -ml-px block">
            <button type="button" onClick={togglePopup}
                    className="relative inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                    id="option-menu-button" aria-expanded="true" aria-haspopup="true">
                <span className="sr-only">Open options</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                     data-slot="icon">
                    <path fillRule="evenodd"
                          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"/>
                </svg>
            </button>
            {popupVisible && children}
        </div>
    </div>
</div>
)
}

const _ChangePhaseLink = ({
    handleRefreshStep, moderatorWallet
}) => {
    return <_DevLink loadingJsx={<><LoadingGif/> moderate_phase()...</>}
                     btnTitle="Move to phase 2"
                     handleRefreshStep={handleRefreshStep}
                     moderatorWallet={moderatorWallet}
                     method="moderate_phase"
                     args={{phase: 2}}
    />
}
const _ResetLink = ({
    handleRefreshStep, moderatorWallet
}) => {
    return <_DevLink loadingJsx={<><LoadingGif/> moderate_phase()...</>}
                     btnTitle="RESET state"
                     handleRefreshStep={handleRefreshStep}
                     moderatorWallet={moderatorWallet}
                     method="dev_reset_sandbox"
    />
}

const _DevLink = ({
    handleRefreshStep, moderatorWallet, loadingJsx, btnTitle, method, args = {}
}) => {
    const [changingPhase, setChangingPhase] = useState(false);
    const dispatch = useDispatch();
    const changePhase = async () => {
        setChangingPhase(true);
        const contract = await get_near_contract(moderatorWallet, WW3E_SMART_CONTRACT, method);
        await call_near_contract(
            moderatorWallet,
            contract,
            method,
            args,
            0,
            0,
            (data) => {
                dispatch(addBlockChainLog(data));
                refreshContractState(WW3E_SMART_CONTRACT);
            },
        );
        handleRefreshStep();
    }

    if (changingPhase) {
        return <a className="block px-4 py-2 text-sm text-gray-300" role="menuitem"
                  tabIndex="-1"
                  id="option-menu-item-0">{loadingJsx}</a>
    }
    return <a onClick={changePhase} className="block px-4 py-2 text-sm text-gray-700 cursor-pointer" role="menuitem"
              tabIndex="-1"
              id="option-menu-item-0">{btnTitle}</a>
}

export default SandboxWW3E;