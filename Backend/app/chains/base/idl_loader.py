from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List


class BaseIDLLoader(ABC):
    def __init__(self, rpc_client: Any):
        self.rpc_client = rpc_client
    
    @abstractmethod
    async def fetch_idl(self, program_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def parse_instructions(self, idl: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def parse_types(self, idl: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def parse_accounts(self, idl: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def parse_events(self, idl: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def parse_errors(self, idl: Dict[str, Any]) -> List[Dict[str, Any]]:
        pass
