use near_sdk::near_bindgen;
use crate::*;

#[near_bindgen]
impl Contract {
    pub fn mod_confirm(&mut self, account_id: AccountId, confirmation: String) {
        let sender_account_id: AccountId = env::predecessor_account_id();
        require!(self.moderator == sender_account_id, "Only moderator can use mod_* functions");

        if let Some(member) = self.members.get_mut(&account_id) {
            if !member.confirmed {
                member.confirmed = true;

                // TODO: probably, first confirmation should have more strict requirements
                log!( "moderator confirmed account {} - {}",
                    account_id.clone(),
                    confirmation.clone()
                );
            }

            member.confirmations.push(GGMemberConfirmation {
                validator: sender_account_id,
                confirmation: confirmation.clone()
            });

            log!( "moderator added confirmation for {} - {}",
                account_id.clone(),
                confirmation.clone()
            );
        } else {
            panic!("You can send confirmations only to existing members");
        }
    }
}