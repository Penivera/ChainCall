from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseTxBuilder(ABC):
    @abstractmethod
    def decode_instruction_data(self, data: str) -> bytes:
        pass
    
    @abstractmethod
    def build_instruction(
        self,
        program_id: str,
        accounts: List[Dict[str, Any]],
        data: bytes
    ) -> Any:
        pass
    
    @abstractmethod
    async def build_transaction(
        self,
        instructions: List[Any],
        fee_payer: str,
        recent_blockhash: str
    ) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    def serialize_transaction(self, transaction: Any) -> str:
        pass
