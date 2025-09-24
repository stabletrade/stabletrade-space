## OTC Marketplace Contract (Aptos Move)

On-chain OTC marketplace enabling trustless buy/sell orders between APT and any fungible token on Aptos. Orders are created and accepted by users; settlement is fully on-chain with escrow guarantees.

### Tech stack
- **Language**: Aptos Move
- **Frameworks**: `AptosFramework` (coins, events, tables, accounts), `aptos_std::type_info`
- **Package**: `otc_trade` defined in `Move.toml`
- **On-chain address alias**: `otc_trade` (see `Move.toml`)

### Project layout
- `Move.toml`: package metadata, dependency, and address configuration
- `sources/otc_marketplace.move`: main module `otc_trade::otc_trade`

### Design overview
- **OrderStore** (global): Tracks `next_order_id`, per-token order tables, event handles, and a `SignerCapability` used to manage a centralized resource account for token escrows.
- **TokenEscrowStore<TokenType>**: One resource per token type, stored at the resource account; holds escrowed tokens for open sell orders.
- **Escrow model**:
  - Buy orders: escrow APT inside the `Order` itself.
  - Sell orders: escrow `TokenType` into `TokenEscrowStore<TokenType>` at the resource account.
- **Pricing/decimals**: Prices are quoted as APT per unit of `TokenType`. Decimal handling uses on-chain metadata (`coin::decimals<TokenType>`) to scale correctly and includes overflow checks.

### Errors
`E_INVALID_ORDER`, `E_NOT_MAKER`, `E_ORDER_COMPLETED`, `E_INSUFFICIENT_AMOUNT`, `E_PARTIAL_NOT_ALLOWED`, `E_INVALID_ACCEPT_AMOUNT`, `E_TOKEN_NOT_INITIALIZED`, `E_NOT_INITIALIZED`, `E_ALREADY_INITIALIZED`, `E_COIN_NOT_INITIALIZED`, `E_OVERFLOW`.

### Events
- `CreateEvent`: emitted on order creation
- `AcceptEvent`: emitted on acceptance (partial or full)
- `CancelEvent`: emitted on cancellation with escrow return

### Public entry functions
- `initialize(admin: &signer)`: one-time setup; creates `OrderStore` under `@otc_trade` and derives a resource account for token escrows.
- `create_buy_order<TokenType>(maker, price_per_unit, amount, partial_allowed)`: escrows APT based on decimal-aware price calculation.
- `create_sell_order<TokenType>(maker, price_per_unit, amount, partial_allowed)`: escrows `TokenType` into centralized per-token escrow at the resource account.
- `accept_order<TokenType>(taker, order_id, accept_amount)`: exchanges assets between maker and taker; supports partial fills if allowed; cleans up completed orders and escrow buckets.
- `cancel_order<TokenType>(maker, order_id)`: maker-only; returns remaining escrow to maker.

### Public view functions
- `is_initialized(): bool`: whether `OrderStore` exists at `@otc_trade`.
- `get_resource_address(): address`: resource account address used for token escrows.
- `get_order<TokenType>(order_id): (address, bool, u64, u64, u64, bool)`: maker, side, price, original/remaining amounts, partial flag.
- `get_next_order_id(): u64`: next order id that will be assigned.
- `order_exists<TokenType>(order_id): bool`: existence check.
- `get_escrowed_amount<TokenType>(order_id): u64`: remaining escrowed tokens for a sell order.
- `get_decimals_token<TokenType>(): (bool, u8)`: whether the coin type is initialized and its decimals.
- `calculate_apt_for_token<TokenType>(price_per_unit, token_amount): u64`: helper to compute APT required for a token amount.

### Internal utilities
- `power_of_10(decimals: u8): u64`: scale factor computation.
- `calculate_apt_amount<TokenType>(price_per_unit, token_amount): u64`: decimal-aware price calculation with overflow checks.
- `ensure_token_escrow_store<TokenType>(cap)`: lazily deploys per-token escrow resource at the resource account.
- `ensure_token_orders_table<TokenType>(store)`: lazily initializes per-token orders table in `OrderStore`.

### Build, publish, and interact
Prerequisites: Aptos CLI installed and a configured profile with sufficient funds.

- Build
```
aptos move compile
```

- Publish (uses active profile/account; update `Move.toml` addresses as needed)
```
aptos move publish
```

- Check bytecode version/deps
```
aptos move compile --bytecode-version 6
```

### Quick usage flow
1. Call `initialize` from the admin account to create `OrderStore` and the escrow resource account.
2. Makers create orders:
   - Buy: `create_buy_order<TokenType>` — APT is escrowed in the order.
   - Sell: `create_sell_order<TokenType>` — tokens are escrowed under the resource account.
3. Takers accept with `accept_order<TokenType>` for full or partial amounts (if enabled).
4. Makers may `cancel_order<TokenType>` to reclaim remaining escrow when open.


### Notes
- Price calculations use on-chain decimals and include overflow checks.
- Sell-order tokens are held under a resource account for simpler custody and cleanup.
- Events enable off-chain indexers to reconstruct order lifecycle.