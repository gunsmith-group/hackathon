use near_sdk::NearToken;

// Used to prevent spam
pub const MIN_SECURITY_DEPOSIT:NearToken = NearToken::from_millinear(300);

// Used for simplified "Storage price" model
// every add_contract and add_message require 0.01 Near which is around 1kb of storage
pub const STORAGE_COST: NearToken = NearToken::from_millinear(10);

pub const ITERATOR_DEFAULT_KEYHOLES_COUNT: usize = 100;
pub const ITERATOR_DEFAULT_MESSAGES_COUNT: usize = 100;
pub const ITERATOR_DEFAULT_CONTRACTS_COUNT: usize = 100;
pub const ITERATOR_DEFAULT_MEMBER_KEYS_COUNT: usize = 1;
pub const ITERATOR_DEFAULT_MEMBER_CONFIRMATIONS_COUNT: usize = 5;