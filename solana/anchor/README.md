# Solana Gateway Anchor

An [anchor](https://www.anchor-lang.com/) macro for evaluating the status of Civic Passes.

## Usage

```rust
use solana_gateway_anchor::Pass;

/// Instruction to be gated by Civic Pass
#[derive(Accounts)]
pub struct MyInstruction<'info> {
    /// An account struct containing the pass type
    pub my_account: Account<'info, MyAccount>,

    #[account(constraint = pass.valid(&recipient.key, &my_account.pass_type))]
    pub pass: Account<'info, Pass>,
}
```

See a more complete example [here](https://github.com/civicteam/civic-pass-demos/tree/main/packages/solana).