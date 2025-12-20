from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers.solana import router as solana_router
from .models.schemas import SupportedChainsResponse, ChainInfoResponse
from .chains.registry import ChainRegistry, initialize_registry

initialize_registry()

app = FastAPI(
    title="Multi-Chain Postman Backend",
    description="""
A scalable FastAPI backend for blockchain program introspection, IDL parsing, 
transaction building, and simulation. Currently supports Solana with an 
extensible architecture for adding other chains.

## Supported Chains
- **Solana** - Full support for Anchor IDL, transaction building, simulation

## Future Chains (Architecture Ready)
- Ethereum / EVM chains
- Sui
- Aptos
- NEAR
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(solana_router)


import logging

logger = logging.getLogger(__name__)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    chain = None
    if hasattr(request, "url") and request.url.path:
        parts = request.url.path.strip("/").split("/")
        if parts and ChainRegistry.is_chain_supported(parts[0]):
            chain = parts[0]

    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc), "chain": chain},
    )


@app.get("/", tags=["Info"])
async def root():
    supported_chains = ChainRegistry.get_supported_chains()
    chain_configs = ChainRegistry.get_all_chain_configs()

    endpoints = {}
    for chain in supported_chains:
        endpoints[chain] = {
            "idl": {
                f"GET /{chain}/idl/{{program_id}}": "Fetch IDL for a program",
                f"GET /{chain}/idl/{{program_id}}/methods": "Get instruction methods from IDL",
            },
            "instructions": {
                f"POST /{chain}/instruction/pack": "Pack instruction data using byte layout",
                f"POST /{chain}/instruction/unpack": "Unpack instruction data using byte layout",
                f"GET /{chain}/instruction/types": "Get supported data types",
            },
            "transactions": {
                f"POST /{chain}/tx/build": "Build an unsigned transaction",
                f"POST /{chain}/tx/simulate": "Simulate a transaction",
                f"POST /{chain}/tx/send": "Send a signed transaction",
            },
            "accounts": {f"POST /{chain}/accounts/info": "Get account information"},
        }

    return {
        "name": "Multi-Chain Postman Backend",
        "version": "2.0.0",
        "status": "running",
        "supported_chains": supported_chains,
        "architecture": "multi-chain-ready",
        "endpoints": endpoints,
    }


@app.get("/health", tags=["Info"])
async def health_check():
    return {"status": "healthy"}


@app.get("/chains", response_model=SupportedChainsResponse, tags=["Info"])
async def get_supported_chains():
    chains = []
    for chain_id in ChainRegistry.get_supported_chains():
        config = ChainRegistry.get_chain_config(chain_id)
        chains.append(
            ChainInfoResponse(
                chain=chain_id,
                name=config.get("name", chain_id.title()),
                default_rpc_url=config.get("default_rpc_url", ""),
                supported_features=config.get("supported_features", []),
                data_types=config.get("data_types", []),
            )
        )
    return SupportedChainsResponse(chains=chains)
