// use std::collections::HashMap;
use near_sdk::{near, AccountId, BorshStorageKey, NearToken};
use near_sdk::store::{IterableMap, Vector};

#[near(serializers = [borsh])]
pub struct GGContract {
    pub owner: AccountId, // Only GGMember could create contracts
    pub messages: Vector<GGContractMessage>,
}

#[near(serializers = [json])]
pub struct GGContractJson {
    pub owner: AccountId, // Only GGMember could create contracts
    pub messages: Vec<GGContractMessageJson>,
}

#[near(serializers = [borsh])]
#[derive(BorshStorageKey)]
#[allow(unused)]
pub enum GGStorageKey {
    GGContracts,
    GGMembers,
    GGMemberKeysPool { owner_id: AccountId },
    GGUsedMemberKeys { owner_id: AccountId },
    GGConfirmations { member_id: AccountId },
    GGContractMessages {contract_id: u32},
    GGKeyholes {contract_id: u32, message_id: u32},
}

#[near(serializers = [borsh])]
pub struct GGMember {
    pub owner: AccountId,
    pub title: String,
    pub public_key: String,
    pub keys_pool: Vector<String>,
    pub used_keys: IterableMap<String, GGMemberKeyUsageReference>,
    pub confirmed: bool,
    pub confirmations: Vector<GGMemberConfirmation>,
    pub deposit: NearToken,
}

#[near(serializers = [json])]
pub struct GGMemberJson {
    pub owner: AccountId,
    pub title: String,
    pub public_key: String,
    pub keys_pool: Vec<String>,
    // no need to show used_keys for now
    // pub used_keys: HashMap<String, GGMemberKeyUsageReference>,
    pub confirmed: bool,
    pub confirmations: Vec<GGMemberConfirmation>,
    pub deposit: NearToken,
}

#[near(serializers = [borsh])]
pub struct GGMemberKeyUsageReference {
    pub created_by: AccountId,
    pub public_key: String,
    pub owner: AccountId,
    pub contract_id: u32,
    pub message_id: u32,
    pub keyhole_id: u32
}

#[near(serializers = [borsh])]
pub struct GGContractMessage {
    pub confirmed: bool,
    pub sender: AccountId,
    pub public_message: String,
    // pub encoded_message: String,
    pub keyholes: Vector<GGKeyhole>
}

#[near(serializers = [json])]
pub struct GGContractMessageJson {
    pub confirmed: bool,
    pub sender: AccountId,
    pub public_message: String,
    // pub encoded_message: String,
    pub keyholes: Vec<GGKeyhole>
}

#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct GGKeyhole {
    pub confirmed: bool,
    pub keyhole_owner: AccountId,
    pub encoded_keyhole_message: String,
    pub encoded_for_moderator_message: String,
    pub keyhole_public_key: String,
}

#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct GGMemberConfirmation {
    pub validator: AccountId,
    pub confirmation: String,
}