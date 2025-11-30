import base64
import base58
from typing import List, Dict, Any, Optional
from solders.pubkey import Pubkey
from solders.hash import Hash
from solders.message import Message
from solders.transaction import Transaction
from solders.instruction import Instruction, AccountMeta as SoldersAccountMeta
from ..base.tx_builder import BaseTxBuilder


class SolanaTxBuilder(BaseTxBuilder):
    def decode_instruction_data(self, data: str) -> bytes:
        if data.startswith("0x"):
            return bytes.fromhex(data[2:])
        
        try:
            return bytes.fromhex(data)
        except ValueError:
            pass
        
        try:
            return base64.b64decode(data)
        except Exception:
            pass
        
        raise ValueError(f"Could not decode instruction data: {data}")
    
    def build_instruction(
        self,
        program_id: str,
        accounts: List[Dict[str, Any]],
        data: bytes
    ) -> Instruction:
        program_pubkey = Pubkey.from_string(program_id)
        
        account_metas = []
        for acc in accounts:
            pubkey = Pubkey.from_string(acc["pubkey"])
            account_metas.append(
                SoldersAccountMeta(
                    pubkey=pubkey,
                    is_signer=acc.get("is_signer", False),
                    is_writable=acc.get("is_writable", False)
                )
            )
        
        return Instruction(
            program_id=program_pubkey,
            accounts=account_metas,
            data=data
        )
    
    async def build_transaction(
        self,
        instructions: List[Instruction],
        fee_payer: str,
        recent_block: str
    ) -> Dict[str, Any]:
        fee_payer_pubkey = Pubkey.from_string(fee_payer)
        blockhash = Hash.from_string(recent_block)
        
        message = Message.new_with_blockhash(
            instructions,
            fee_payer_pubkey,
            blockhash
        )
        
        tx = Transaction.new_unsigned(message)
        
        return {
            "transaction": tx,
            "message": message,
            "transaction_base64": base64.b64encode(bytes(tx)).decode('utf-8'),
            "message_base64": base64.b64encode(bytes(message)).decode('utf-8'),
            "blockhash": recent_block
        }
    
    def serialize_transaction(self, transaction: Transaction) -> str:
        return base64.b64encode(bytes(transaction)).decode('utf-8')
