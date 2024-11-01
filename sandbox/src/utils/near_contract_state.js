// WIP - its not so easy to parse Near contract state. :(

import {providers} from "near-api-js";
import {borshDeserialize, BorshSchema} from "borsher";
import util from "tweetnacl-util";

export const near_get_state = async (contract_id) => {
    const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");

    const response = await provider.query({
        request_type: 'view_state',
        finality: 'final',
        account_id: contract_id,
        prefix_base64: '',
    })
    console.log('GET STATE', response);

    return response;
}

export class Assignable {
    constructor(properties) {
        Object.keys(properties).map((key) => {
            return (this[key] = properties[key]);
        });
    }
}

const WW3E_SCHEMA = BorshSchema.Struct({
    phase: BorshSchema.u8,
    moderator: BorshSchema.String,
    min_security_deposit: BorshSchema.String,
    storage_cost: BorshSchema.String,
    cmd_activate_weapon: BorshSchema.String,
});

export const near_get_parsed_state = async (contract_id) => {
    const data = await near_get_state(contract_id);
    // find STATE key
    // const findState = item => item. === "U1RBVEU=";
    // const stateStorageValue = data.values.find(findState)
    // return data;
    return borshDeserialize(BorshSchema.String, util.decodeBase64("ARAAAABtb2Rfd3czZS50ZXN0bmV0AADgm1EJXaGiAAAAAAAAAAAAoN7Frck1NgAAAAAAAAATAAAAQ01EX0FDVElWQVRFX1dFQVBPTg=="));
}