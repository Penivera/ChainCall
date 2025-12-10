# ChainCall Backend TODO Tracker

## Completed
- [x] Initialize FastAPI project structure
- [x] Create directory layout (app, routers, chains, models, utils)
- [x] Write Pydantic models (schemas.py) with chain support
- [x] Create base chain interfaces (BaseRPCClient, BaseIDLLoader, BaseBytePacker, BaseTxBuilder)
- [x] Implement Solana chain module
  - [x] SolanaRPCClient - async RPC client
  - [x] SolanaIDLLoader - Anchor IDL fetching and parsing
  - [x] SolanaBytePacker - instruction data serialization
  - [x] SolanaTxBuilder - transaction building utilities
- [x] Create chain-prefixed routers (/solana/...)
  - [x] IDL endpoints (GET /solana/idl/{program_id}, GET /solana/idl/{program_id}/methods)
  - [x] Instruction endpoints (POST /solana/instruction/pack, GET /solana/instruction/types)
  - [x] Transaction endpoints (POST /solana/tx/build, POST /solana/tx/simulate)
  - [x] Account endpoints (POST /solana/accounts/info)
- [x] Update main app with multi-chain architecture
- [x] Add /chains endpoint for supported chains info
- [x] Error handling layer
- [x] FastAPI main application with CORS

## In Progress
(None)

## Not Started - Future Enhancements
- [ ] Add Ethereum/EVM chain implementation
- [ ] Add Sui chain implementation
- [ ] Add Aptos chain implementation
- [ ] Add NEAR chain implementation
- [ ] Add comprehensive API tests
- [ ] Add more data types support in Byte Packer (vec, struct)
- [ ] Implement batch transaction building
- [ ] Add rate limiting
- [ ] Add response caching for IDL fetches
