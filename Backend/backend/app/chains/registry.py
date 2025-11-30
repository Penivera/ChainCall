from typing import Dict, Type, Optional, List
from .base import BaseRPCClient, BaseIDLLoader, BaseBytePacker, BaseTxBuilder
from . import ChainType


class ChainRegistry:
    _rpc_clients: Dict[str, Type[BaseRPCClient]] = {}
    _idl_loaders: Dict[str, Type[BaseIDLLoader]] = {}
    _byte_packers: Dict[str, Type[BaseBytePacker]] = {}
    _tx_builders: Dict[str, Type[BaseTxBuilder]] = {}
    _chain_configs: Dict[str, dict] = {}
    
    @classmethod
    def register_chain(
        cls,
        chain_id: str,
        rpc_client: Type[BaseRPCClient],
        byte_packer: Type[BaseBytePacker],
        tx_builder: Type[BaseTxBuilder],
        idl_loader: Optional[Type[BaseIDLLoader]] = None,
        config: Optional[dict] = None
    ):
        cls._rpc_clients[chain_id] = rpc_client
        cls._byte_packers[chain_id] = byte_packer
        cls._tx_builders[chain_id] = tx_builder
        if idl_loader:
            cls._idl_loaders[chain_id] = idl_loader
        if config:
            cls._chain_configs[chain_id] = config
    
    @classmethod
    def get_rpc_client(cls, chain_id: str, rpc_url: Optional[str] = None) -> BaseRPCClient:
        if chain_id not in cls._rpc_clients:
            raise ValueError(f"Chain not registered: {chain_id}")
        return cls._rpc_clients[chain_id](rpc_url)
    
    @classmethod
    def get_idl_loader(cls, chain_id: str, rpc_client: BaseRPCClient) -> Optional[BaseIDLLoader]:
        if chain_id not in cls._idl_loaders:
            return None
        return cls._idl_loaders[chain_id](rpc_client)
    
    @classmethod
    def get_byte_packer(cls, chain_id: str) -> BaseBytePacker:
        if chain_id not in cls._byte_packers:
            raise ValueError(f"Chain not registered: {chain_id}")
        return cls._byte_packers[chain_id]()
    
    @classmethod
    def get_tx_builder(cls, chain_id: str) -> BaseTxBuilder:
        if chain_id not in cls._tx_builders:
            raise ValueError(f"Chain not registered: {chain_id}")
        return cls._tx_builders[chain_id]()
    
    @classmethod
    def get_chain_config(cls, chain_id: str) -> dict:
        return cls._chain_configs.get(chain_id, {})
    
    @classmethod
    def get_supported_chains(cls) -> List[str]:
        return list(cls._rpc_clients.keys())
    
    @classmethod
    def is_chain_supported(cls, chain_id: str) -> bool:
        return chain_id in cls._rpc_clients
    
    @classmethod
    def get_all_chain_configs(cls) -> Dict[str, dict]:
        return cls._chain_configs.copy()


def register_solana():
    from .solana import SolanaRPCClient, SolanaIDLLoader, SolanaBytePacker, SolanaTxBuilder
    
    ChainRegistry.register_chain(
        chain_id="solana",
        rpc_client=SolanaRPCClient,
        idl_loader=SolanaIDLLoader,
        byte_packer=SolanaBytePacker,
        tx_builder=SolanaTxBuilder,
        config={
            "name": "Solana",
            "default_rpc_url": "https://api.mainnet-beta.solana.com",
            "supported_features": [
                "idl_fetch",
                "idl_parse",
                "instruction_pack",
                "transaction_build",
                "transaction_simulate",
                "account_info"
            ],
            "data_types": [
                "u8", "u16", "u32", "u64", "u128",
                "i8", "i16", "i32", "i64", "i128",
                "bool", "pubkey", "string", "bytes"
            ]
        }
    )


def initialize_registry():
    register_solana()
