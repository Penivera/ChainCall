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
    def unpack_field(self, field_type: str, data: bytes) -> Any:
        pass

    @abstractmethod
    def unpack_layout(self, layout: List[Dict[str, Any]], data: bytes) -> List[Any]:
        pass

    @abstractmethod
    def get_supported_types(self) -> List[str]:
        pass
