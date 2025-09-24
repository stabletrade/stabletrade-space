module otc_trade::otc_trade {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_std::type_info::{Self, TypeInfo};

    // Errors
    const E_INVALID_ORDER: u64 = 1;
    const E_NOT_MAKER: u64 = 2;
    const E_ORDER_COMPLETED: u64 = 3; 
    const E_INSUFFICIENT_AMOUNT: u64 = 4;
    const E_PARTIAL_NOT_ALLOWED: u64 = 5;
    const E_INVALID_ACCEPT_AMOUNT: u64 = 6;
    const E_TOKEN_NOT_INITIALIZED: u64 = 7;
    const E_NOT_INITIALIZED: u64 = 8;
    const E_ALREADY_INITIALIZED: u64 = 9;
    const E_COIN_NOT_INITIALIZED: u64 = 10;
    const E_OVERFLOW: u64 = 11;

    // Order struct
    struct Order has store {
        maker: address,
        is_buy: bool, // true: maker buys TokenType with APT; false: maker sells TokenType for APT
        token_type: TypeInfo, // Store token type info
        price_per_unit: u64, // Price in APT per unit of TokenType (scaled by token decimals)
        original_amount: u64, // Original amount of TokenType
        remaining_amount: u64, // Remaining amount of TokenType
        partial_allowed: bool,
        escrowed_apt: Coin<AptosCoin>, // Escrowed APT for buy orders
    }

    // Global storage for all orders
    struct OrderStore has key {
        next_order_id: u64, // Global order ID counter
        orders_by_token: Table<TypeInfo, Table<u64, Order>>, // Orders grouped by token type
        resource_signer_cap: account::SignerCapability, // For creating TokenEscrowStore
        create_events: EventHandle<CreateEvent>,
        accept_events: EventHandle<AcceptEvent>,
        cancel_events: EventHandle<CancelEvent>,
    }

    // Centralized token escrow storage for each token type - stored at resource account
    struct TokenEscrowStore<phantom TokenType> has key {
        escrow_by_order: Table<u64, Coin<TokenType>>, // order_id -> escrowed tokens
    }

    // Events
    struct CreateEvent has drop, store {
        order_id: u64,
        maker: address,
        token_type: TypeInfo,
        is_buy: bool,
        price_per_unit: u64,
        amount: u64,
        partial_allowed: bool,
    }

    struct AcceptEvent has drop, store {
        order_id: u64,
        taker: address,
        token_type: TypeInfo,
        amount: u64,
        remaining_amount: u64, // Amount remaining after this trade
        apt_amount: u64, // APT amount traded
        is_partial: bool,
        is_completed: bool, // Whether order is fully completed
    }

    struct CancelEvent has drop, store {
        order_id: u64,
        maker: address,
        token_type: TypeInfo,
        remaining_amount: u64, // Amount that was cancelled
    }

    // Helper function to calculate 10^decimals
    fun power_of_10(decimals: u8): u64 {
        let result = 1u64;
        let i = 0u8;
        while (i < decimals) {
            result = result * 10;
            i = i + 1;
        };
        result
    }

    // Helper function to calculate APT amount with proper decimal handling
    fun calculate_apt_amount<TokenType>(price_per_unit: u64, token_amount: u64): u64 {
        let (is_initialized, decimals) = get_decimals_token<TokenType>();
        assert!(is_initialized, E_COIN_NOT_INITIALIZED);
        
        let decimal_scale = power_of_10(decimals);
        
        // Check for overflow before multiplication
        let max_price = 18446744073709551615u64 / token_amount; // u64::MAX / token_amount
        assert!(price_per_unit <= max_price, E_OVERFLOW);
        
        (price_per_unit * token_amount) / decimal_scale
    }

    // Initialize the global OrderStore at contract address, TokenEscrowStore at resource account
    public entry fun initialize(admin: &signer) {
        // Create resource account for TokenEscrowStore only
        assert!(!exists<OrderStore>(@otc_trade), E_ALREADY_INITIALIZED);

        let (resource_signer, resource_signer_cap) = account::create_resource_account(admin, b"otc_trade");
        
        // Store OrderStore at contract address (@otc_trade)
        move_to(admin, OrderStore {
            next_order_id: 0,
            orders_by_token: table::new(),
            resource_signer_cap,
            create_events: account::new_event_handle<CreateEvent>(admin),
            accept_events: account::new_event_handle<AcceptEvent>(admin),
            cancel_events: account::new_event_handle<CancelEvent>(admin),
        });
    }

    #[view]
    public fun is_initialized(): bool {
        exists<OrderStore>(@otc_trade)
    }

    // Get resource account address
    #[view]
    public fun get_resource_address(): address acquires OrderStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        let store = borrow_global<OrderStore>(@otc_trade);
        account::get_signer_capability_address(&store.resource_signer_cap)
    }

    // Helper to ensure TokenEscrowStore exists for a token type
    fun ensure_token_escrow_store<TokenType>(resource_signer_cap: &account::SignerCapability) {
        let resource_signer = account::create_signer_with_capability(resource_signer_cap);
        let resource_addr = signer::address_of(&resource_signer);
        
        if (!exists<TokenEscrowStore<TokenType>>(resource_addr)) {
            let escrow_store = TokenEscrowStore<TokenType> {
                escrow_by_order: table::new(),
            };
            move_to(&resource_signer, escrow_store);
        }
    }

    // Helper to initialize orders table for a new token type if not exists
    fun ensure_token_orders_table<TokenType>(store: &mut OrderStore) {
        let token_type = type_info::type_of<TokenType>();
        if (!table::contains(&store.orders_by_token, token_type)) {
            table::add(&mut store.orders_by_token, token_type, table::new());
        }
    }

    public entry fun create_buy_order<TokenType>(
        maker: &signer,
        price_per_unit: u64,
        amount: u64,
        partial_allowed: bool,
    ) acquires OrderStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        
        let maker_addr = signer::address_of(maker);
        let store = borrow_global_mut<OrderStore>(@otc_trade);
        
        ensure_token_orders_table<TokenType>(store);

        let order_id = store.next_order_id;
        store.next_order_id = order_id + 1;

        // Use dynamic decimal calculation
        let total_apt = calculate_apt_amount<TokenType>(price_per_unit, amount);
        let escrowed_apt = coin::withdraw<AptosCoin>(maker, total_apt);

        let order = Order {
            maker: maker_addr,
            is_buy: true,
            token_type: type_info::type_of<TokenType>(),
            price_per_unit,
            original_amount: amount,
            remaining_amount: amount,
            partial_allowed,
            escrowed_apt,
        };

        let orders = table::borrow_mut(&mut store.orders_by_token, type_info::type_of<TokenType>());
        table::add(orders, order_id, order);

        event::emit_event(&mut store.create_events, CreateEvent {
            order_id,
            maker: maker_addr,
            token_type: type_info::type_of<TokenType>(),
            is_buy: true,
            price_per_unit,
            amount,
            partial_allowed,
        });
    }

    public entry fun create_sell_order<TokenType>(
        maker: &signer,
        price_per_unit: u64,
        amount: u64,
        partial_allowed: bool,
    ) acquires OrderStore, TokenEscrowStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        
        let maker_addr = signer::address_of(maker);
        
        // First, get resource account info without holding mutable borrow
        let resource_addr = {
            let store = borrow_global<OrderStore>(@otc_trade);
            account::get_signer_capability_address(&store.resource_signer_cap)
        };
        
        // Ensure TokenEscrowStore exists
        {
            let store = borrow_global<OrderStore>(@otc_trade);
            ensure_token_escrow_store<TokenType>(&store.resource_signer_cap);
        };
        
        // Now we can safely work with mutable borrows
        let store = borrow_global_mut<OrderStore>(@otc_trade);
        ensure_token_orders_table<TokenType>(store);

        let order_id = store.next_order_id;
        store.next_order_id = order_id + 1;

        let escrowed_token = coin::withdraw<TokenType>(maker, amount);

        // Store tokens in centralized escrow at resource account
        let escrow_store = borrow_global_mut<TokenEscrowStore<TokenType>>(resource_addr);
        table::add(&mut escrow_store.escrow_by_order, order_id, escrowed_token);

        let order = Order {
            maker: maker_addr,
            is_buy: false,
            token_type: type_info::type_of<TokenType>(),
            price_per_unit,
            original_amount: amount,
            remaining_amount: amount,
            partial_allowed,
            escrowed_apt: coin::zero<AptosCoin>(),
        };

        let orders = table::borrow_mut(&mut store.orders_by_token, type_info::type_of<TokenType>());
        table::add(orders, order_id, order);

        event::emit_event(&mut store.create_events, CreateEvent {
            order_id,
            maker: maker_addr,
            token_type: type_info::type_of<TokenType>(),
            is_buy: false,
            price_per_unit,
            amount,
            partial_allowed,
        });
    }

    public entry fun accept_order<TokenType>(
        taker: &signer,
        order_id: u64,
        accept_amount: u64,
    ) acquires OrderStore, TokenEscrowStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        
        let taker_addr = signer::address_of(taker);
        let store = borrow_global_mut<OrderStore>(@otc_trade);

        let token_type = type_info::type_of<TokenType>();
        assert!(table::contains(&store.orders_by_token, token_type), E_TOKEN_NOT_INITIALIZED);

        let orders = table::borrow_mut(&mut store.orders_by_token, token_type);
        assert!(table::contains(orders, order_id), E_INVALID_ORDER);
        let order = table::borrow_mut(orders, order_id);

        assert!(order.remaining_amount > 0, E_ORDER_COMPLETED);
        assert!(accept_amount > 0 && accept_amount <= order.remaining_amount, E_INVALID_ACCEPT_AMOUNT);
        if (accept_amount < order.remaining_amount) {
            assert!(order.partial_allowed, E_PARTIAL_NOT_ALLOWED);
        };

        let is_partial = accept_amount < order.remaining_amount;
        // Use dynamic decimal calculation
        let apt_amount = calculate_apt_amount<TokenType>(order.price_per_unit, accept_amount);

        // Store maker address and other info before any mutations
        let maker_addr = order.maker;
        let order_is_buy = order.is_buy;

        if (order_is_buy) {
            // Maker buys TokenType, taker sells TokenType
            let token_to_send = coin::withdraw<TokenType>(taker, accept_amount);
            coin::deposit(maker_addr, token_to_send);
            let apt_from_escrow = coin::extract(&mut order.escrowed_apt, apt_amount);
            coin::deposit(taker_addr, apt_from_escrow);
        } else {
            // Maker sells TokenType, taker buys TokenType
            let apt_to_send = coin::withdraw<AptosCoin>(taker, apt_amount);
            coin::deposit(maker_addr, apt_to_send);

            // Extract from centralized escrow
            let resource_addr = account::get_signer_capability_address(&store.resource_signer_cap);
            let escrow_store = borrow_global_mut<TokenEscrowStore<TokenType>>(resource_addr);
            let escrowed_tokens = table::borrow_mut(&mut escrow_store.escrow_by_order, order_id);
            let token_from_escrow = coin::extract(escrowed_tokens, accept_amount);
            coin::deposit(taker_addr, token_from_escrow);
        };

        order.remaining_amount = order.remaining_amount - accept_amount;
        let remaining_amount = order.remaining_amount;
        let is_completed = remaining_amount == 0;

        // Handle order completion properly
        if (is_completed) {
            let completed_order = table::remove(orders, order_id);
            let Order {
                maker: _,
                is_buy,
                token_type: _,
                price_per_unit: _,
                original_amount: _,
                remaining_amount: final_remaining,
                partial_allowed: _,
                escrowed_apt,
            } = completed_order;
            
            assert!(final_remaining == 0, E_INVALID_ORDER);
            
            if (is_buy) {
                // For buy orders, any remaining APT should be zero after full fill
                coin::destroy_zero(escrowed_apt);
            } else {
                // For sell orders, escrowed_apt should already be zero
                coin::destroy_zero(escrowed_apt);
                // Clean up empty token escrow
                let resource_addr = account::get_signer_capability_address(&store.resource_signer_cap);
                let escrow_store = borrow_global_mut<TokenEscrowStore<TokenType>>(resource_addr);
                let remaining_tokens = table::remove(&mut escrow_store.escrow_by_order, order_id);
                coin::destroy_zero(remaining_tokens);
            };
        };

        event::emit_event(&mut store.accept_events, AcceptEvent {
            order_id,
            taker: taker_addr,
            token_type,
            amount: accept_amount,
            remaining_amount,
            apt_amount,
            is_partial,
            is_completed,
        });
    }

    public entry fun cancel_order<TokenType>(
        maker: &signer,
        order_id: u64,
    ) acquires OrderStore, TokenEscrowStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        
        let maker_addr = signer::address_of(maker);
        let store = borrow_global_mut<OrderStore>(@otc_trade);

        let token_type = type_info::type_of<TokenType>();
        assert!(table::contains(&store.orders_by_token, token_type), E_TOKEN_NOT_INITIALIZED);

        let orders = table::borrow_mut(&mut store.orders_by_token, token_type);
        assert!(table::contains(orders, order_id), E_INVALID_ORDER);
        
        // Remove order first, then destructure it
        let order = table::remove(orders, order_id);
        assert!(order.maker == maker_addr, E_NOT_MAKER);

        // Destructure order to access its fields properly
        let Order {
            maker: _,
            is_buy,
            token_type: _,
            price_per_unit: _,
            original_amount: _,
            remaining_amount,
            partial_allowed: _,
            escrowed_apt,
        } = order;

        // Return escrowed assets
        if (is_buy) {
            coin::deposit(maker_addr, escrowed_apt);
        } else {
            // Destroy zero APT from sell orders
            coin::destroy_zero(escrowed_apt);
            
            // Return escrowed tokens from centralized escrow
            let resource_addr = account::get_signer_capability_address(&store.resource_signer_cap);
            let escrow_store = borrow_global_mut<TokenEscrowStore<TokenType>>(resource_addr);
            let escrowed_tokens = table::remove(&mut escrow_store.escrow_by_order, order_id);
            coin::deposit(maker_addr, escrowed_tokens);
        };

        event::emit_event(&mut store.cancel_events, CancelEvent {
            order_id,
            maker: maker_addr,
            token_type,
            remaining_amount,
        });
    }

    // View functions
    #[view]
    public fun get_order<TokenType>(order_id: u64): (address, bool, u64, u64, u64, bool) acquires OrderStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        let store = borrow_global<OrderStore>(@otc_trade);
        let token_type = type_info::type_of<TokenType>();
        assert!(table::contains(&store.orders_by_token, token_type), E_TOKEN_NOT_INITIALIZED);
        
        let orders = table::borrow(&store.orders_by_token, token_type);
        assert!(table::contains(orders, order_id), E_INVALID_ORDER);
        let order = table::borrow(orders, order_id);
        
        (
            order.maker,
            order.is_buy,
            order.price_per_unit,
            order.original_amount,
            order.remaining_amount,
            order.partial_allowed
        )
    }

    #[view]
    public fun get_next_order_id(): u64 acquires OrderStore {
        assert!(exists<OrderStore>(@otc_trade), E_NOT_INITIALIZED);
        let store = borrow_global<OrderStore>(@otc_trade);
        store.next_order_id
    }

    #[view]
    public fun order_exists<TokenType>(order_id: u64): bool acquires OrderStore {
        if (!exists<OrderStore>(@otc_trade)) {
            return false
        };
        
        let store = borrow_global<OrderStore>(@otc_trade);
        let token_type = type_info::type_of<TokenType>();
        
        if (!table::contains(&store.orders_by_token, token_type)) {
            return false
        };
        
        let orders = table::borrow(&store.orders_by_token, token_type);
        table::contains(orders, order_id)
    }

    #[view]
    public fun get_escrowed_amount<TokenType>(order_id: u64): u64 acquires OrderStore, TokenEscrowStore {
        if (!exists<OrderStore>(@otc_trade)) {
            return 0
        };
        
        let store = borrow_global<OrderStore>(@otc_trade);
        let resource_addr = account::get_signer_capability_address(&store.resource_signer_cap);
        
        if (!exists<TokenEscrowStore<TokenType>>(resource_addr)) {
            return 0
        };
        
        let escrow_store = borrow_global<TokenEscrowStore<TokenType>>(resource_addr);
        if (!table::contains(&escrow_store.escrow_by_order, order_id)) {
            return 0
        };
        
        let escrowed_tokens = table::borrow(&escrow_store.escrow_by_order, order_id);
        coin::value(escrowed_tokens)
    }

    #[view]
    public fun get_decimals_token<TokenType>(): (bool, u8) {
        if (coin::is_coin_initialized<TokenType>()) {
            (true, coin::decimals<TokenType>())
        } else {
            (false, 0)
        }
    }

    // New helper view function to calculate APT amount for given token amount
    #[view]
    public fun calculate_apt_for_token<TokenType>(price_per_unit: u64, token_amount: u64): u64 {
        calculate_apt_amount<TokenType>(price_per_unit, token_amount)
    }
}