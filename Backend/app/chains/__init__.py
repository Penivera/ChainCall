from enum import Enum


class ChainType(str, Enum):
    SOLANA = "solana"
    ETHEREUM = "ethereum"
    SUI = "sui"
    APTOS = "aptos"
    NEAR = "near"
