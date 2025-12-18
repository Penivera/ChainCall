from fastapi import APIRouter, HTTPException
from ...chains.solana import SolanaRPCClient, SolanaTxBuilder
from ...models.schemas import (
    BuildTransactionRequest,
    BuildTransactionResponse,
    SimulateTransactionRequest,
    SimulateTransactionResponse,
    SendTransactionRequest,
    SendTransactionResponse,
    ErrorResponse,
)
import os
import base64
from solders.keypair import Keypair

router = APIRouter(prefix="/tx", tags=["Solana - Transactions"])


@router.post(
    "/build",
    response_model=BuildTransactionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Build Transaction",
    description="Build an unsigned Solana transaction",
)
async def build_transaction(request: BuildTransactionRequest):
    rpc_client = SolanaRPCClient(request.rpc_url)
    tx_builder = SolanaTxBuilder()

    try:
        blockhash_response = await rpc_client.get_latest_blockhash()
        blockhash = blockhash_response["blockhash"]

        instruction_bytes = tx_builder.decode_instruction_data(request.instruction_data)

        accounts = [
            {
                "pubkey": acc.pubkey,
                "is_signer": acc.is_signer,
                "is_writable": acc.is_writable,
            }
            for acc in request.accounts
        ]

        instruction = tx_builder.build_instruction(
            request.program_id, accounts, instruction_bytes
        )

        fee_payer = request.fee_payer
        if not fee_payer and request.accounts:
            fee_payer = request.accounts[0].pubkey

        if not fee_payer:
            raise ValueError("No fee payer specified and no accounts provided")

        result = await tx_builder.build_transaction([instruction], fee_payer, blockhash)

        return BuildTransactionResponse(
            chain="solana",
            transaction_base64=result["transaction_base64"],
            message_base64=result["message_base64"],
            blockhash=result["blockhash"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error building transaction: {str(e)}"
        )
    finally:
        await rpc_client.close()


@router.post(
    "/simulate",
    response_model=SimulateTransactionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Simulate Transaction",
    description="Simulate a Solana transaction and get execution logs",
)
async def simulate_transaction(request: SimulateTransactionRequest):
    rpc_client = SolanaRPCClient(request.rpc_url)

    try:
        result = await rpc_client.simulate_transaction(
            request.transaction_base64, request.encoding
        )

        error = result.get("err")
        logs = result.get("logs", [])
        units_consumed = result.get("unitsConsumed")
        return_data = result.get("returnData")

        error_str = None
        if error:
            error_str = str(error) if isinstance(error, dict) else str(error)

        return SimulateTransactionResponse(
            chain="solana",
            success=error is None,
            logs=logs or [],
            error=error_str,
            units_consumed=units_consumed,
            return_data=return_data,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error simulating transaction: {str(e)}"
        )
    finally:
        await rpc_client.close()


@router.post(
    "/send",
    response_model=SendTransactionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Send Transaction",
    description="Send a signed transaction to the Solana network",
)
async def send_transaction(request: SendTransactionRequest):
    if request.sign_with_backend:
        # Only allow on testnet
        testnet_urls = [
            "https://api.testnet.solana.com",
            "https://api.devnet.solana.com",
        ]
        if request.rpc_url not in testnet_urls:
            raise HTTPException(
                status_code=400,
                detail="Backend signing is only allowed on testnet/devnet",
            )

        # Check required fields for building
        if not all([request.program_id, request.accounts, request.instruction_data]):
            raise HTTPException(
                status_code=400,
                detail="program_id, accounts, and instruction_data required for backend signing",
            )

        # Load backend keypair
        backend_keypair_env = os.getenv("BACKEND_SOLANA_KEYPAIR")
        if not backend_keypair_env:
            raise HTTPException(
                status_code=500, detail="Backend keypair not configured"
            )

        try:
            backend_keypair = Keypair.from_base58_secret(backend_keypair_env)
        except Exception:
            raise HTTPException(status_code=500, detail="Invalid backend keypair")

        rpc_client = SolanaRPCClient(request.rpc_url)
        tx_builder = SolanaTxBuilder()

        try:
            # Build transaction
            blockhash_response = await rpc_client.get_latest_blockhash()
            blockhash = blockhash_response["blockhash"]

            instruction_bytes = tx_builder.decode_instruction_data(
                request.instruction_data
            )

            accounts = [
                {
                    "pubkey": acc.pubkey,
                    "is_signer": acc.is_signer,
                    "is_writable": acc.is_writable,
                }
                for acc in request.accounts
            ]

            instruction = tx_builder.build_instruction(
                request.program_id, accounts, instruction_bytes
            )

            fee_payer = request.fee_payer or str(backend_keypair.pubkey())

            # Build unsigned
            unsigned_result = await tx_builder.build_transaction(
                [instruction], fee_payer, blockhash
            )

            # Sign with backend keypair
            unsigned_tx = unsigned_result["transaction"]
            unsigned_tx.sign([backend_keypair], unsigned_tx.message.recent_blockhash)

            signed_transaction_base64 = base64.b64encode(bytes(unsigned_tx)).decode(
                "utf-8"
            )

        finally:
            await rpc_client.close()

    else:
        # Expect signed transaction
        if not request.transaction_base64:
            raise HTTPException(
                status_code=400, detail="transaction_base64 required for sending"
            )

        signed_transaction_base64 = request.transaction_base64
        rpc_client = SolanaRPCClient(request.rpc_url)

    try:
        result = await rpc_client.send_transaction(signed_transaction_base64)

        return SendTransactionResponse(chain="solana", signature=result, success=True)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error sending transaction: {str(e)}"
        )
    finally:
        await rpc_client.close()
