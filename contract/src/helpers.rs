use near_sdk::AccountId;
use crate::Contract;
use crate::types::{GGContract, GGContractMessage, GGKeyhole, GGMember};

impl Contract {
    pub fn internal_get_mut_keyhole(&mut self, contract_id: u32, message_id: u32, keyhole_id: u32) -> &mut GGKeyhole {
        let message = self.internal_get_mut_message(contract_id, message_id);
        if let Some(keyhole) = message.keyholes.get_mut(keyhole_id) {
            keyhole
        } else {
            panic!("Cant find keyhole {} in message {} from contract {}", keyhole_id, message_id, contract_id);
        }
    }
    pub fn internal_get_keyhole(&self, contract_id: u32, message_id: u32, keyhole_id: u32) -> &GGKeyhole {
        let message = self.internal_get_message(contract_id, message_id);
        if let Some(keyhole) = message.keyholes.get(keyhole_id) {
            keyhole
        } else {
            panic!("Cant find keyhole {} in message {} from contract {}", keyhole_id, message_id, contract_id);
        }
    }

    pub fn internal_get_mut_message(&mut self, contract_id: u32, message_id: u32) -> &mut GGContractMessage {
        let contract = self.internal_get_mut_contract(contract_id);
        if let Some(message) = contract.messages.get_mut(message_id) {
            message
        } else {
            panic!("Cant find message {} from contract {}", message_id, contract_id);
        }
    }

    pub fn internal_get_message(&self, contract_id: u32, message_id: u32) -> &GGContractMessage {
        let contract = self.internal_get_contract(contract_id);
        if let Some(message) = contract.messages.get(message_id) {
            message
        } else {
            panic!("Cant find message {} from contract {}", message_id, contract_id);
        }
    }

    pub fn internal_get_mut_contract(&mut self, contract_id: u32) -> &mut GGContract {
        if let Some(contract) = self.contracts.get_mut(contract_id) {
            contract
        } else {
            panic!("Cant find contract {}", contract_id);
        }
    }
    pub fn internal_get_contract(&self, contract_id: u32) -> &GGContract {
        if let Some(contract) = self.contracts.get(contract_id) {
            contract
        } else {
            panic!("Cant find contract {}", contract_id);
        }
    }

    pub fn internal_get_mut_member(&mut self, member_account_id: AccountId) -> &mut GGMember {
        if let Some(member) = self.members.get_mut(&member_account_id) {
            member
        } else {
            panic!("Cant find member {}", member_account_id);
        }
    }

    pub fn internal_get_member(&self, member_account_id: AccountId) -> &GGMember {
        if let Some(member) = self.members.get(&member_account_id) {
            member
        } else {
            panic!("Cant find member {}", member_account_id);
        }
    }
}