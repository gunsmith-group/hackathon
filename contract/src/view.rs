use std::collections::HashMap;
use near_sdk::near_bindgen;
use crate::*;
use crate::constants::{ITERATOR_DEFAULT_CONTRACTS_COUNT, ITERATOR_DEFAULT_KEYHOLES_COUNT, ITERATOR_DEFAULT_MEMBER_CONFIRMATIONS_COUNT, ITERATOR_DEFAULT_MEMBER_KEYS_COUNT, ITERATOR_DEFAULT_MESSAGES_COUNT};
use crate::Contract;
use crate::types::{GGContractJson, GGContractMessageJson, GGKeyhole, GGMemberJson};

#[near_bindgen]
impl Contract {
    pub fn get_keyhole(&self, contract_id: u32, message_id: u32, keyhole_id: u32) -> &GGKeyhole {
        self.internal_get_keyhole(contract_id, message_id, keyhole_id)
    }

    pub fn get_message(&self, contract_id: u32, message_id: u32, keyholes_index_start: Option<usize>, keyholes_count: Option<usize>) -> GGContractMessageJson {
        let message = self.internal_get_message(contract_id, message_id);
        let keyholes: Vec<GGKeyhole> = message.keyholes
            .iter()
            .skip(keyholes_index_start.unwrap_or(0))
            .take(keyholes_count.unwrap_or(ITERATOR_DEFAULT_KEYHOLES_COUNT))
            .cloned()
            .collect();

        GGContractMessageJson {
            confirmed: message.confirmed,
            keyholes,
            public_message: message.public_message.clone(),
            sender: message.sender.clone(),
        }
    }

    pub fn get_contract(&self, contract_id: u32, messages_index_start: Option<usize>, messages_count: Option<usize>) -> GGContractJson {
        let contract = self.internal_get_contract(contract_id);

        let mut messages: Vec<GGContractMessageJson> = Vec::new();

        for (id, _message) in contract.messages
            .iter()
            .skip(messages_index_start.unwrap_or(0))
            .take(messages_count.unwrap_or(ITERATOR_DEFAULT_MESSAGES_COUNT))
            .enumerate()
        {
            let message_id: u32 = id.try_into().expect("Value out of range for u32");
            let message = self.get_message(contract_id, message_id, None, None);
            messages.push(message);
        }


        GGContractJson {
            owner: contract.owner.clone(),
            messages
        }
    }

    pub fn get_contracts(&self, contracts_index_start: Option<usize>, contracts_count: Option<usize>) -> Vec<GGContractJson> {
        let mut contracts: Vec<GGContractJson> = Vec::new();
        for (id, _contract) in self.contracts
            .iter()
            .skip(contracts_index_start.unwrap_or(0))
            .take(contracts_count.unwrap_or(ITERATOR_DEFAULT_CONTRACTS_COUNT))
            .enumerate()
        {
            let contract_id: u32 = id.try_into().expect("Value out of range for u32");
            let contract = self.get_contract(contract_id, None, None);
            contracts.push(contract);
        }

        contracts
    }

    pub fn get_member(&self, account_id: AccountId, keys_index_start: Option<usize>, keys_count: Option<usize>, confirmations_index_start: Option<usize>, confirmations_count: Option<usize>) -> GGMemberJson {
        let member = self.internal_get_member(account_id);

        let mut keys_pool: Vec<String> = Vec::new();

        for public_key in member.keys_pool
            .iter()
            .skip(keys_index_start.unwrap_or(0))
            .take(keys_count.unwrap_or(ITERATOR_DEFAULT_MEMBER_KEYS_COUNT))
        {
            keys_pool.push(public_key.clone());
        }

        // no need to show used_keys for now

        let confirmations = member.confirmations
            .iter()
            .skip(confirmations_index_start.unwrap_or(0))
            .take(confirmations_count.unwrap_or(ITERATOR_DEFAULT_MEMBER_CONFIRMATIONS_COUNT))
            .cloned()
            .collect();

        GGMemberJson {
            owner: member.owner.clone(),
            public_key: member.public_key.clone(),
            confirmed: member.confirmed,
            title: member.title.clone(),
            confirmations,
            keys_pool,
            deposit: member.deposit.clone(),
        }
    }

    pub fn get_members(&self, members_index_start: Option<usize>, members_count: Option<usize>) -> HashMap<AccountId, GGMemberJson> {
        let mut members: HashMap<AccountId, GGMemberJson> = HashMap::new();
        for (id, _member) in self.members
            .iter()
            .skip(members_index_start.unwrap_or(0))
            .take(members_count.unwrap_or(ITERATOR_DEFAULT_CONTRACTS_COUNT))
        {
            let member = self.get_member(id.clone(), None, None, None, None);
            members.insert(id.clone(), member);
        }

        members
    }

    pub fn get_mod_public_key(&self) -> String {
        self.moderator_public_key.clone()
    }
    pub fn get_member_public_key(&self, account_id: AccountId) -> String {
        let member = self.internal_get_member(account_id);
        member.public_key.clone()
    }
}