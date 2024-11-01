pub mod types;
pub mod constants;
mod helpers;
mod view;
mod moderator;

use near_sdk::{log, near, NearToken, env, require, AccountId, PanicOnDefault};
use near_sdk::store::{IterableMap, Vector};
use crate::constants::{STORAGE_COST, MIN_SECURITY_DEPOSIT};
use crate::types::{GGContract, GGContractMessage, GGKeyhole, GGMember, GGMemberConfirmation, GGStorageKey};

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    contracts: Vector<GGContract>,
    members: IterableMap<AccountId, GGMember>,
    moderator: AccountId,
    moderator_public_key: String,

    // TODO: add voting procedure for changing min_security_deposit, storage_cost
    min_security_deposit: NearToken,
    storage_cost: NearToken,
}

#[near]
impl Contract {
    #[init]
    #[private] // only callable by the contract's account
    pub fn init(moderator: AccountId, moderator_public_key: String) -> Self {
        Self {
            moderator,
            moderator_public_key,
            contracts: Vector::new(GGStorageKey::GGContracts),
            members: IterableMap::new(GGStorageKey::GGMembers),
            min_security_deposit: MIN_SECURITY_DEPOSIT,
            storage_cost: STORAGE_COST,
        }
    }

    #[payable]
    pub fn join(&mut self, title: String, public_key: String) {
        let sender_account_id: AccountId = env::predecessor_account_id();

        require!(!self.members.contains_key(&sender_account_id), "You already joined!");

        require!(env::attached_deposit() >= self.min_security_deposit, format!("You must deposit at least {}", self.min_security_deposit));
        self.members.insert(sender_account_id.clone(), GGMember {
            owner: sender_account_id.clone(),
            title: title.clone(),
            public_key: public_key.clone(),
            keys_pool: Vector::new(GGStorageKey::GGMemberKeysPool { owner_id: sender_account_id.clone() }),
            used_keys: IterableMap::new(GGStorageKey::GGUsedMemberKeys { owner_id: sender_account_id.clone() }),
            confirmed: false,
            confirmations: Vector::new(GGStorageKey::GGConfirmations { member_id: sender_account_id.clone() }),
            deposit: env::attached_deposit().saturating_sub(self.storage_cost),
        });
        log!(
            "{title} joined - owner {}, public_key {}",
            sender_account_id.to_string(),
            public_key.clone()
        )
    }

    pub fn confirm(&mut self, account_id: AccountId, confirmation: String) {
        let sender_account_id: AccountId = env::predecessor_account_id();

        require!(account_id != sender_account_id, "You cant send confirmation for yourself");


        require!(self.members.contains_key(&sender_account_id), "Only moderator and existing members can send confirmations for other members");

        let sender = self.members.get(&sender_account_id);
        require!(sender.unwrap().confirmed, "Only confirmed members can send confirmations for other members");

        if let Some(member) = self.members.get_mut(&account_id) {
            require!(member.confirmed, "Only moderator can confirm new members");

            member.confirmations.push(GGMemberConfirmation {
                validator: sender_account_id.clone(),
                confirmation: confirmation.clone(),
            });

            log!( "{} added confirmation for {} - {}",
                sender_account_id.to_string(),
                account_id.clone(),
                confirmation.clone()
            );
        } else {
            panic!("You can send confirmations only to existing members");
        }
    }

    #[payable]
    pub fn add_deposit(&mut self) {
        let sender_account_id: AccountId = env::predecessor_account_id();

        if let Some(member) = self.members.get_mut(&sender_account_id) {
            member.deposit = member.deposit.saturating_add(env::attached_deposit());
        } else {
            panic!("You need to join first!");
        }
    }

    pub fn add_contract(&mut self, encoded_for_moderator_message: String, public_message: String, encoded_for_owner_message: String) {
        let sender_account_id: AccountId = env::predecessor_account_id();

        if let Some(member) = self.members.get_mut(&sender_account_id) {
            require!(member.deposit > self.storage_cost, "You do not have enough deposit to cover storage cost");
            require!(member.confirmed, "You need to be confirmed in order to add contract");

            // TODO: it may have sense to add some kind of limits for open contracts count. Depends on closed contracts count?

            member.deposit = member.deposit.saturating_sub(self.storage_cost);

            let contract_id = self.contracts.len();

            self.contracts.push(GGContract {
                owner: sender_account_id.clone(),
                messages: Vector::new(GGStorageKey::GGContractMessages { contract_id }),
            });

            if let Some(contract) = self.contracts.get_mut(contract_id) {
                let message_id = 0;
                contract.messages.push(GGContractMessage {
                    confirmed: false,
                    sender: sender_account_id.clone(),
                    public_message: public_message.clone(),
                    // encoded_message: encoded_message.clone(),
                    keyholes: Vector::new(GGStorageKey::GGKeyholes { contract_id, message_id })
                });

                if let Some(message) = contract.messages.get_mut(message_id) {
                    message.keyholes.push(GGKeyhole {
                        confirmed: true,
                        keyhole_owner: self.moderator.clone(),
                        encoded_keyhole_message: encoded_for_moderator_message.clone(),
                        encoded_for_moderator_message: String::new(),
                        keyhole_public_key: self.moderator_public_key.clone(),
                    });

                    log!(
                        "{} added contract with public message {} and keyhole for moderator",
                        sender_account_id.clone().to_string(),
                        public_message.clone()
                    );

                    message.keyholes.push(GGKeyhole {
                        confirmed: true,
                        keyhole_owner: sender_account_id.clone(),
                        encoded_keyhole_message: encoded_for_owner_message.clone(),
                        encoded_for_moderator_message: String::new(),
                        keyhole_public_key: member.public_key.clone(),
                    });
                } else {
                    panic!("this shold never happen");
                }
            } else {
                panic!("this shold never happen");
            }
        } else {
            panic!("Only members can add contracts");
        }
    }

    pub fn add_keyhole(&mut self, contract_id: u32, message_id: u32, keyhole_owner: AccountId, encoded_for_moderator_message: String) {
        // TODO: refactor
        let sender_account_id: AccountId = env::predecessor_account_id();

        if let Some(member) = self.members.get_mut(&sender_account_id) {
            require!(member.deposit > self.storage_cost, "You do not have enough deposit to cover storage cost");

            if let Some(contract) = self.contracts.get_mut(contract_id) {
                require!(message_id < contract.messages.len() , "Cant find message");

                if let Some(mesage) = contract.messages.get_mut(message_id) {
                    mesage.keyholes.push(GGKeyhole {
                        confirmed: false,
                        keyhole_owner: keyhole_owner.clone(),
                        encoded_for_moderator_message: encoded_for_moderator_message.clone(),

                        // this will be filled by moderate_keyhole
                        encoded_keyhole_message: String::new(),
                        keyhole_public_key: String::new(),
                    });

                    log!(
                        "{} added keyhole to {}_{} for {}",
                        sender_account_id.clone().to_string(),
                        contract_id,
                        message_id,
                        keyhole_owner.clone()
                    );
                } else {
                    panic!("Cant find messag");
                }
            } else {
                panic!("Cant find contract");
            }
        } else {
            panic!("Only members can add keyholes");
        }
    }

    pub fn add_keys(&mut self, public_keys: Vec<String>) {
        let sender_account_id: AccountId = env::predecessor_account_id();

        if let Some(member) = self.members.get_mut(&sender_account_id) {
            require!(member.deposit > self.storage_cost, "You do not have enough deposit to cover storage cost");
            require!(member.confirmed, "You need to be confirmed in order to add public keys");

            member.deposit = member.deposit.saturating_sub(self.storage_cost);

            member.keys_pool.extend(public_keys)
        } else {
            panic!("Only members can add keys");
        }
    }
}