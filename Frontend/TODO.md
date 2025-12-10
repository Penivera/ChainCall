# ChainCall TODO Tracker

## Completed
- [x] Initialize Vite React frontend
- [x] Create mock RPC client
- [x] Create mock IDL fetch
- [x] Implement mock Anchor IDL parser
- [x] Auto-generate method schemas UI
- [x] Build Instruction Builder UI
- [x] Create Byte Packer utility (frontend)
- [x] Build Simulation UI
- [x] Connect wallet button (UI)
- [x] Transaction sender UI
- [x] UI polishing
- [x] Fix React hydration warnings

## Features
### Anchor Auto-Magician Mode
- Enter Program ID to fetch IDL (mocked)
- Auto-generated input forms for each method
- Simulate and Send transaction buttons

### Instruction Builder Mode
- Visual byte packer with type selection
- Real-time hex buffer preview
- Support for u8, u16, u32, u64, string, pubkey types

### Transaction Simulator Mode
- Parse and display program logs
- Show compute units consumed
- Display balance changes
