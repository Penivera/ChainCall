from abc import ABC, abstractmethod
from typing import List, Any, Dict


class BaseBytePacker(ABC):
    @abstractmethod
    def pack_field(self, field_type: str, value: Any) -> bytes:
        pass
    
    @abstractmethod
    def pack_layout(self, layout: List[Dict[str, Any]]) -> bytes:
        pass
    
    @abstractmethod
    def get_supported_types(self) -> List[str]:
        pass
