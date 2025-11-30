from fastapi import APIRouter, HTTPException
from ...chains.solana import SolanaRPCClient, SolanaTxBuilder
from ...models.schemas import (
    BuildTransactionRequest,
    BuildTransactionResponse,
    SimulateTransactionRequest,
    SimulateTransactionResponse,
    ErrorResponse
)

router = APIRouter(prefix="/tx", tags=["Solana - Transactions"])


@router.post(
    "/build",
    response_model=BuildTransactionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Build Transaction",
    description="Build an unsigned Solana transaction"
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
                "is_writable": acc.is_writable
            }
            for acc in request.accounts
        ]
        
        instruction = tx_builder.build_instruction(
            request.program_id,
            accounts,
            instruction_bytes
        )
        
        fee_payer = request.fee_payer
        if not fee_payer and request.accounts:
            fee_payer = request.accounts[0].pubkey
        
        if not fee_payer:
            raise ValueError("No fee payer specified and no accounts provided")
        
        result = await tx_builder.build_transaction(
            [instruction],
            fee_payer,
            blockhash
        )
        
        return BuildTransactionResponse(
            chain="solana",
            transaction_base64=result["transaction_base64"],
            message_base64=result["message_base64"],
            blockhash=result["blockhash"]
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error building transaction: {str(e)}"
        )
    finally:
        await rpc_client.close()


@router.post(
    "/simulate",
    response_model=SimulateTransactionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Simulate Transaction",
    description="Simulate a Solana transaction and get execution logs"
)
async def simulate_transaction(request: SimulateTransactionRequest):
    rpc_client = SolanaRPCClient(request.rpc_url)
    
    try:
        result = await rpc_client.simulate_transaction(
            request.transaction_base64,
            request.encoding
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
            return_data=return_data
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error simulating transaction: {str(e)}"
        )
    finally:
        await rpc_client.close()
