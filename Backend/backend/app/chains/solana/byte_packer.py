import struct
import base58
import base64
from typing import List, Any, Dict
from ..base.byte_packer import BaseBytePacker


class SolanaBytePacker(BaseBytePacker):
    SUPPORTED_TYPES = [
        "u8", "u16", "u32", "u64", "u128",
        "i8", "i16", "i32", "i64", "i128",
        "bool", "pubkey", "string", "bytes"
    ]
    
    def pack_field(self, field_type: str, value: Any) -> bytes:
        pack_methods = {
            "u8": self._pack_u8,
            "u16": self._pack_u16,
            "u32": self._pack_u32,
            "u64": self._pack_u64,
            "u128": self._pack_u128,
            "i8": self._pack_i8,
            "i16": self._pack_i16,
            "i32": self._pack_i32,
            "i64": self._pack_i64,
            "i128": self._pack_i128,
            "bool": self._pack_bool,
            "pubkey": self._pack_pubkey,
            "string": self._pack_string,
            "bytes": self._pack_bytes,
        }
        
        pack_fn = pack_methods.get(field_type.lower())
        if not pack_fn:
            raise ValueError(f"Unknown type: {field_type}")
        
        return pack_fn(value)
    
    def pack_layout(self, layout: List[Dict[str, Any]]) -> bytes:
        result = b""
        for field in layout:
            field_type = field.get("type")
            value = field.get("value")
            result += self.pack_field(field_type, value)
        return result
    
    def unpack_field(self, field_type: str, data: bytes) -> Any:
        raise NotImplementedError("Unpack not yet implemented")
    
    def get_supported_types(self) -> List[str]:
        return self.SUPPORTED_TYPES.copy()
    
    @staticmethod
    def _pack_u8(value: int) -> bytes:
        return struct.pack("<B", value & 0xFF)
    
    @staticmethod
    def _pack_u16(value: int) -> bytes:
        return struct.pack("<H", value & 0xFFFF)
    
    @staticmethod
    def _pack_u32(value: int) -> bytes:
        return struct.pack("<I", value & 0xFFFFFFFF)
    
    @staticmethod
    def _pack_u64(value: int) -> bytes:
        return struct.pack("<Q", value & 0xFFFFFFFFFFFFFFFF)
    
    @staticmethod
    def _pack_u128(value: int) -> bytes:
        return value.to_bytes(16, byteorder='little', signed=False)
    
    @staticmethod
    def _pack_i8(value: int) -> bytes:
        return struct.pack("<b", value)
    
    @staticmethod
    def _pack_i16(value: int) -> bytes:
        return struct.pack("<h", value)
    
    @staticmethod
    def _pack_i32(value: int) -> bytes:
        return struct.pack("<i", value)
    
    @staticmethod
    def _pack_i64(value: int) -> bytes:
        return struct.pack("<q", value)
    
    @staticmethod
    def _pack_i128(value: int) -> bytes:
        return value.to_bytes(16, byteorder='little', signed=True)
    
    @staticmethod
    def _pack_bool(value: bool) -> bytes:
        return struct.pack("<B", 1 if value else 0)
    
    @staticmethod
    def _pack_pubkey(value: str) -> bytes:
        try:
            return base58.b58decode(value)
        except Exception:
            raise ValueError(f"Invalid pubkey: {value}")
    
    @staticmethod
    def _pack_string(value: str) -> bytes:
        encoded = value.encode('utf-8')
        length = struct.pack("<I", len(encoded))
        return length + encoded
    
    @staticmethod
    def _pack_bytes(value: str) -> bytes:
        if value.startswith("0x"):
            return bytes.fromhex(value[2:])
        try:
            return bytes.fromhex(value)
        except ValueError:
            return base64.b64decode(value)
