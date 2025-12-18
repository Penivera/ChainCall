import struct
import base58
import base64
from typing import List, Any, Dict
from ..base.byte_packer import BaseBytePacker


class SolanaBytePacker(BaseBytePacker):
    SUPPORTED_TYPES = [
        "u8",
        "u16",
        "u32",
        "u64",
        "u128",
        "i8",
        "i16",
        "i32",
        "i64",
        "i128",
        "bool",
        "pubkey",
        "string",
        "bytes",
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
        unpack_methods = {
            "u8": self._unpack_u8,
            "u16": self._unpack_u16,
            "u32": self._unpack_u32,
            "u64": self._unpack_u64,
            "u128": self._unpack_u128,
            "i8": self._unpack_i8,
            "i16": self._unpack_i16,
            "i32": self._unpack_i32,
            "i64": self._unpack_i64,
            "i128": self._unpack_i128,
            "bool": self._unpack_bool,
            "pubkey": self._unpack_pubkey,
            "string": self._unpack_string,
            "bytes": self._unpack_bytes,
        }

        unpack_fn = unpack_methods.get(field_type.lower())
        if not unpack_fn:
            raise ValueError(f"Unknown type: {field_type}")

        return unpack_fn(data)

    def unpack_layout(self, layout: List[Dict[str, Any]], data: bytes) -> List[Any]:
        result = []
        offset = 0
        for field in layout:
            field_type = field.get("type")
            unpacked_value = self.unpack_field(field_type, data[offset:])
            result.append(unpacked_value)
            # Calculate the size consumed
            size = self._get_field_size(field_type, data[offset:])
            offset += size
        return result

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
        return value.to_bytes(16, byteorder="little", signed=False)

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
        return value.to_bytes(16, byteorder="little", signed=True)

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
        encoded = value.encode("utf-8")
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

    @staticmethod
    def _unpack_u8(data: bytes) -> int:
        return struct.unpack("<B", data[:1])[0]

    @staticmethod
    def _unpack_u16(data: bytes) -> int:
        return struct.unpack("<H", data[:2])[0]

    @staticmethod
    def _unpack_u32(data: bytes) -> int:
        return struct.unpack("<I", data[:4])[0]

    @staticmethod
    def _unpack_u64(data: bytes) -> int:
        return struct.unpack("<Q", data[:8])[0]

    @staticmethod
    def _unpack_u128(data: bytes) -> int:
        return int.from_bytes(data[:16], byteorder="little", signed=False)

    @staticmethod
    def _unpack_i8(data: bytes) -> int:
        return struct.unpack("<b", data[:1])[0]

    @staticmethod
    def _unpack_i16(data: bytes) -> int:
        return struct.unpack("<h", data[:2])[0]

    @staticmethod
    def _unpack_i32(data: bytes) -> int:
        return struct.unpack("<i", data[:4])[0]

    @staticmethod
    def _unpack_i64(data: bytes) -> int:
        return struct.unpack("<q", data[:8])[0]

    @staticmethod
    def _unpack_i128(data: bytes) -> int:
        return int.from_bytes(data[:16], byteorder="little", signed=True)

    @staticmethod
    def _unpack_bool(data: bytes) -> bool:
        return struct.unpack("<B", data[:1])[0] != 0

    @staticmethod
    def _unpack_pubkey(data: bytes) -> str:
        return base58.b58encode(data[:32]).decode("utf-8")

    @staticmethod
    def _unpack_string(data: bytes) -> str:
        length = struct.unpack("<I", data[:4])[0]
        return data[4 : 4 + length].decode("utf-8")

    @staticmethod
    def _unpack_bytes(data: bytes) -> str:
        # For bytes, we need to know the length, but since it's variable, perhaps return hex
        # This is tricky without length info. For now, assume the data is the entire bytes
        return data.hex()

    def _get_field_size(self, field_type: str, data: bytes) -> int:
        size_map = {
            "u8": 1,
            "u16": 2,
            "u32": 4,
            "u64": 8,
            "u128": 16,
            "i8": 1,
            "i16": 2,
            "i32": 4,
            "i64": 8,
            "i128": 16,
            "bool": 1,
            "pubkey": 32,
        }

        if field_type.lower() in size_map:
            return size_map[field_type.lower()]
        elif field_type.lower() == "string":
            if len(data) < 4:
                raise ValueError("Not enough data for string length")
            length = struct.unpack("<I", data[:4])[0]
            return 4 + length
        elif field_type.lower() == "bytes":
            # For bytes, since we don't know the length, assume the rest of the data
            # This is a limitation; in practice, bytes fields need length info
            return len(data)
        else:
            raise ValueError(f"Unknown type for size calculation: {field_type}")
