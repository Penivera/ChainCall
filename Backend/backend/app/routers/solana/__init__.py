from fastapi import APIRouter
from . import idl, instructions, transactions, accounts

router = APIRouter(prefix="/solana", tags=["Solana"])

router.include_router(idl.router)
router.include_router(instructions.router)
router.include_router(transactions.router)
router.include_router(accounts.router)
