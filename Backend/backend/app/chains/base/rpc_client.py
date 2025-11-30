from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
import httpx


class BaseRPCClient(ABC):
    def __init__(self, rpc_url: Optional[str] = None, timeout: float = 30.0):
        self.rpc_url = rpc_url or self.get_default_rpc_url()
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    @classmethod
    @abstractmethod
    def get_default_rpc_url(cls) -> str:
        pass
    
    @abstractmethod
    async def get_account_info(self, address: str, encoding: str = "base64", **kwargs) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_latest_blockhash(self) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def simulate_transaction(self, transaction: str, encoding: str = "base64", **kwargs) -> Dict[str, Any]:
        pass
    
    async def close(self):
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
