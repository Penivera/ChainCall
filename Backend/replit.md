# Multi-Chain Postman Backend

## Overview
A scalable FastAPI backend that serves as the engine for blockchain interaction tools. The architecture is designed to be chain-agnostic, currently supporting Solana with an extensible structure for adding other chains like Ethereum, Sui, Aptos, and NEAR.

## Project Structure
```
backend/
    app/
        main.py                      # FastAPI application entry point
        chains/
            __init__.py              # Chain type enum
            base/                    # Abstract base classes
                rpc_client.py        # BaseRPCClient interface
                idl_loader.py        # BaseIDLLoader interface
                byte_packer.py       # BaseBytePacker interface
                tx_builder.py        # BaseTxBuilder interface
            solana/                  # Solana implementation
                rpc_client.py        # SolanaRPCClient
                idl_loader.py        # SolanaIDLLoader (Anchor)
                byte_packer.py       # SolanaBytePacker
                tx_builder.py        # SolanaTxBuilder
        routers/
            solana/                  # Solana API routes
                idl.py               # IDL endpoints
                instructions.py      # Byte packer endpoints
                transactions.py      # TX build/simulate endpoints
                accounts.py          # Account info endpoints
        models/
            schemas.py               # Pydantic models
        utils/
    requirements.txt
TODO.md
```

## API Endpoints

### General
- `GET /` - API info and supported chains
- `GET /health` - Health check
- `GET /chains` - List supported chains with features

### Solana Chain (`/solana/...`)

#### IDL / Program Introspection
- `GET /solana/idl/{program_id}` - Fetch Anchor IDL for a program
- `GET /solana/idl/{program_id}/methods` - Get instruction methods from IDL

#### Instruction Builder
- `POST /solana/instruction/pack` - Pack instruction data using byte layout
- `GET /solana/instruction/types` - Get supported data types

#### Transaction Builder
- `POST /solana/tx/build` - Build an unsigned transaction
- `POST /solana/tx/simulate` - Simulate a transaction

#### Accounts
- `POST /solana/accounts/info` - Get account information

## Adding a New Chain

To add support for a new blockchain:

1. Create a new directory under `backend/app/chains/{chain_name}/`
2. Implement the base interfaces:
   - `rpc_client.py` - Extend `BaseRPCClient`
   - `idl_loader.py` - Extend `BaseIDLLoader` (if applicable)
   - `byte_packer.py` - Extend `BaseBytePacker`
   - `tx_builder.py` - Extend `BaseTxBuilder`
3. Create routers under `backend/app/routers/{chain_name}/`
4. Register the new router in `backend/app/main.py`
5. Update the `/chains` endpoint with the new chain info

## Running the Server
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

## Recent Changes
- Refactored to multi-chain architecture
- Created abstract base classes for chain implementations
- Grouped API endpoints by chain (/solana/...)
- Added /chains endpoint for chain discovery
- Maintained all Solana functionality

## User Preferences
- Backend only - no frontend, no HTML templates
- Async everywhere for performance
- Modular router structure by chain
- Chain-agnostic base classes for extensibility
- Auto-updating TODO.md tracker
