use std::collections::HashMap;
use near_sdk::{AccountId, NearToken};
use serde_json::json;
use gunsmithguild::constants::{MIN_SECURITY_DEPOSIT};
use gunsmithguild::types::{GGContractJson, GGContractMessageJson, GGKeyhole, GGMemberJson};

const TEST_MODERATOR_PUBLIC_KEY: &str = "MODERATOR_PUBLIC_KEY";
const TEST_ABSTRACT_PUBLIC_KEY: &str = "ABSTRACT_PUBLIC_KEY";
const TEST_ENCODED_FOR_MODERATOR_MESSAGE: &str = "encoded_for_moderator_message";
const TEST_PUBLIC_MESSAGE: &str = "public_message";
const TEST_FIRST_MEMBER_TITLE: &str = "GG";
const TEST_SECOND_MEMBER_TITLE: &str = "!CLASSIFIED!";
const TEST_CONFIRMATION: &str = "Test confirmation";

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project("./").await?;

    let contract = sandbox.dev_deploy(&contract_wasm).await?;

    let moderator = sandbox.dev_create_account().await?;
    let outcome_init = contract
        .call("init")
        .args_json(json!({"moderator": moderator.id(), "moderator_public_key": TEST_MODERATOR_PUBLIC_KEY}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome_init.is_success());

    // ---------------------------------
    //
    // Is GG Near? Lets win together!
    //
    // ---------------------------------
    let account_not_confirmed = sandbox.dev_create_account().await?;
    let outcome = account_not_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": "NEAR foundation", "public_key": TEST_ABSTRACT_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT)
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    let account_confirmed = sandbox.dev_create_account().await?;
    let outcome = account_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": TEST_FIRST_MEMBER_TITLE, "public_key": TEST_MODERATOR_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT.saturating_sub(NearToken::from_yoctonear(1)))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    let outcome = account_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": TEST_FIRST_MEMBER_TITLE, "public_key": TEST_ABSTRACT_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT)
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // ERR: cant confirm not existing account
    let outcome = account_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": TEST_ABSTRACT_PUBLIC_KEY, "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    assert!(outcome.is_failure());

    // ----------------------
    // ERR: cant confirm himself
    let outcome = account_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // err: moderator should not use confirm func
    let outcome = moderator
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // err: account should be confirmed by moderator first
    let outcome = account_confirmed
        .call(contract.id(), "add_contract")
        .args_json(json!({"encoded_for_moderator_message": TEST_ENCODED_FOR_MODERATOR_MESSAGE, "public_message": TEST_PUBLIC_MESSAGE, "encoded_for_owner_message": "TEST"}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // err: moderator should use mod_confirm
    let outcome = moderator
        .call(contract.id(), "mod_confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // OK: confirmed account can add contract
    let outcome = account_confirmed
        .call(contract.id(), "add_contract")
        .args_json(json!({"encoded_for_moderator_message": TEST_ENCODED_FOR_MODERATOR_MESSAGE, "public_message": TEST_PUBLIC_MESSAGE, "encoded_for_owner_message": "TEST"}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // error: internal_get_keyhole should not be available
    let outcome = account_confirmed
        .call(contract.id(), "internal_get_keyhole")
        .args_json(json!({"contract_id": 0, "message_id": 0, "keyhole_id": 0}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // ok: testing get_keyhole
    let keyhole: GGKeyhole = contract
        .view("get_keyhole")
        .args_json(json!({"contract_id": 0, "message_id": 0, "keyhole_id": 0}))
        .await?
        .json()?;

    assert_eq!(keyhole.confirmed, true);
    assert_eq!(keyhole.keyhole_owner.to_string(), moderator.id().to_string());
    assert_eq!(keyhole.keyhole_public_key, TEST_MODERATOR_PUBLIC_KEY);
    assert_eq!(keyhole.encoded_keyhole_message, TEST_ENCODED_FOR_MODERATOR_MESSAGE);
    assert_eq!(keyhole.encoded_for_moderator_message, "");

    // ----------------------
    // ok: testing get_keyhole
    let keyhole: GGKeyhole = contract
        .view("get_keyhole")
        .args_json(json!({"contract_id": 0, "message_id": 0, "keyhole_id": 1}))
        .await?
        .json()?;

    assert_eq!(keyhole.confirmed, true);
    assert_eq!(keyhole.keyhole_owner.to_string(), account_confirmed.id().to_string());
    // assert_eq!(keyhole.keyhole_public_key, TEST_MODERATOR_PUBLIC_KEY);
    // assert_eq!(keyhole.encoded_keyhole_message, TEST_ENCODED_FOR_MODERATOR_MESSAGE);
    // assert_eq!(keyhole.encoded_for_moderator_message, "");

    // ----------------------
    // ok: testing get_message
    let message: GGContractMessageJson = contract
        .view("get_message")
        .args_json(json!({"contract_id": 0, "message_id": 0}))
        .await?
        .json()?;

    assert_eq!(message.confirmed, false);
    assert_eq!(message.public_message, TEST_PUBLIC_MESSAGE);
    assert_eq!(message.sender.to_string(), account_confirmed.id().to_string());
    assert_eq!(message.keyholes.len(), 2);
    assert_eq!(message.keyholes[0].confirmed, true);
    assert_eq!(message.keyholes[0].keyhole_owner.to_string(), moderator.id().to_string());
    assert_eq!(message.keyholes[0].keyhole_public_key, TEST_MODERATOR_PUBLIC_KEY);
    assert_eq!(message.keyholes[0].encoded_keyhole_message, TEST_ENCODED_FOR_MODERATOR_MESSAGE);
    assert_eq!(message.keyholes[0].encoded_for_moderator_message, "");

    // ----------------------
    // ok: testing get_contract
    let contract_json: GGContractJson = contract
        .view("get_contract")
        .args_json(json!({"contract_id": 0}))
        .await?
        .json()?;

    assert_eq!(contract_json.owner.to_string(), account_confirmed.id().to_string());
    assert_eq!(contract_json.messages.len(), 1);
    assert_eq!(contract_json.messages[0].confirmed, false);
    assert_eq!(contract_json.messages[0].public_message, TEST_PUBLIC_MESSAGE);
    assert_eq!(contract_json.messages[0].sender.to_string(), account_confirmed.id().to_string());
    assert_eq!(contract_json.messages[0].keyholes.len(), 2);
    assert_eq!(contract_json.messages[0].keyholes[0].confirmed, true);
    assert_eq!(contract_json.messages[0].keyholes[0].keyhole_owner.to_string(), moderator.id().to_string());
    assert_eq!(contract_json.messages[0].keyholes[0].keyhole_public_key, TEST_MODERATOR_PUBLIC_KEY);
    assert_eq!(contract_json.messages[0].keyholes[0].encoded_keyhole_message, TEST_ENCODED_FOR_MODERATOR_MESSAGE);
    assert_eq!(contract_json.messages[0].keyholes[0].encoded_for_moderator_message, "");

    // ----------------------
    // ok: testing get_contracts
    let contracts_json: Vec<GGContractJson> = contract
        .view("get_contracts")
        .args_json(json!({"contract_id": 0}))
        .await?
        .json()?;

    assert_eq!(contracts_json.len(), 1);
    assert_eq!(contracts_json[0].owner.to_string(), account_confirmed.id().to_string());
    assert_eq!(contracts_json[0].messages.len(), 1);
    assert_eq!(contracts_json[0].owner.to_string(), account_confirmed.id().to_string());
    assert_eq!(contracts_json[0].messages.len(), 1);
    assert_eq!(contracts_json[0].messages[0].confirmed, false);
    assert_eq!(contracts_json[0].messages[0].public_message, TEST_PUBLIC_MESSAGE);
    assert_eq!(contracts_json[0].messages[0].sender.to_string(), account_confirmed.id().to_string());
    assert_eq!(contracts_json[0].messages[0].keyholes.len(), 2);
    assert_eq!(contracts_json[0].messages[0].keyholes[0].confirmed, true);
    assert_eq!(contracts_json[0].messages[0].keyholes[0].keyhole_owner.to_string(), moderator.id().to_string());
    assert_eq!(contracts_json[0].messages[0].keyholes[0].keyhole_public_key, TEST_MODERATOR_PUBLIC_KEY);
    assert_eq!(contracts_json[0].messages[0].keyholes[0].encoded_keyhole_message, TEST_ENCODED_FOR_MODERATOR_MESSAGE);
    assert_eq!(contracts_json[0].messages[0].keyholes[0].encoded_for_moderator_message, "");

    Ok(())
}

#[tokio::test]
async fn test_contract_moderation() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project("./").await?;

    let contract = sandbox.dev_deploy(&contract_wasm).await?;

    let moderator = sandbox.dev_create_account().await?;
    let outcome_init = contract
        .call("init")
        .args_json(json!({"moderator": moderator.id(), "moderator_public_key": TEST_MODERATOR_PUBLIC_KEY}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome_init.is_success());

    let account_confirmed = sandbox.dev_create_account().await?;
    let outcome = account_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": TEST_FIRST_MEMBER_TITLE, "public_key": TEST_ABSTRACT_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT)
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ---------------------------------
    //
    // It worth repeating. So...
    // Is GG Near? Lets win together!
    //
    // ---------------------------------
    let account_not_confirmed = sandbox.dev_create_account().await?;
    let outcome = account_not_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": "NEAR foundation", "public_key": TEST_ABSTRACT_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT)
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // ERR: not confirmed cant confirm
    let outcome = account_not_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // ok: moderator confirm account_confirmed
    let outcome = moderator
        .call(contract.id(), "mod_confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // ERR: not confirmed cant confirm
    let outcome = account_not_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // OK: !CLASSIFIED! confirmed
    let another_account_confirmed = sandbox.dev_create_account().await?;
    let outcome = another_account_confirmed
        .call(contract.id(), "join")
        .args_json(json!({"title": TEST_SECOND_MEMBER_TITLE, "public_key": TEST_ABSTRACT_PUBLIC_KEY}))
        .deposit(MIN_SECURITY_DEPOSIT)
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // ok: moderator confirm another_account_confirmed
    let outcome = moderator
        .call(contract.id(), "mod_confirm")
        .args_json(json!({"account_id": another_account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // ERR: cant send confirmation for not confirmed account
    let outcome = another_account_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_not_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_failure());

    // ----------------------
    // OK: can send confirmation for confirmed account
    let outcome = another_account_confirmed
        .call(contract.id(), "confirm")
        .args_json(json!({"account_id": account_confirmed.id(), "confirmation": TEST_CONFIRMATION}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // OK: test get_members
    let members_json: HashMap<AccountId, GGMemberJson> = contract
        .view("get_members")
        .args_json(json!({"contract_id": 0}))
        .await?
        .json()?;

    assert_eq!(members_json.len(), 3);

    // ----------------------
    // OK: keys_pool.len = 0
    let member_json: GGMemberJson = contract
        .view("get_member")
        .args_json(json!({"account_id": another_account_confirmed.id()}))
        .await?
        .json()?;
    assert_eq!(member_json.keys_pool.len(), 0);

    // ----------------------
    // OK: can send confirmation for confirmed account
    let outcome = another_account_confirmed
        .call(contract.id(), "add_keys")
        .args_json(json!({"public_keys": vec!["key1".to_string(), "key2".to_string()]}))
        .transact()
        .await?;
    // println!("{:?}", outcome);
    assert!(outcome.is_success());

    // ----------------------
    // OK: keys_pool.len = 2
    let member_json: GGMemberJson = contract
        .view("get_member")
        .args_json(json!({"account_id": another_account_confirmed.id(), "keys_count": 10}))
        .await?
        .json()?;
    assert_eq!(member_json.keys_pool.len(), 2); // FAILED
    assert_eq!(member_json.keys_pool[0], "key1".to_string());
    assert_eq!(member_json.keys_pool[1], "key2".to_string());

    Ok(())
}