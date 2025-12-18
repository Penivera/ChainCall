from fastapi import APIRouter, HTTPException
from ...chains.solana import SolanaRPCClient
from ...models.schemas import AccountInfoRequest, AccountInfoResponse, ErrorResponse
import base64

router = APIRouter(prefix="/accounts", tags=["Solana - Accounts"])


@router.post(
    "/info",
    response_model=AccountInfoResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get Account Info",
    description="Fetch account information for a Solana public key"
)
async def get_account_info(request: AccountInfoRequest):
    rpc_client = SolanaRPCClient(request.rpc_url)
    
    try:
        account_info = await rpc_client.get_account_info(
            request.pubkey,
            request.encoding
        )
        
        if not account_info:
            raise HTTPException(
                status_code=404,
                detail=f"Account not found: {request.pubkey}"
            )
        
        data = account_info.get("data")
        data_str = None
        data_len = 0
        
        if data:
            if isinstance(data, list) and len(data) > 0:
                data_str = data[0]
                if isinstance(data_str, str):
                    data_len = len(base64.b64decode(data_str))
            elif isinstance(data, str):
                data_str = data
        
        return AccountInfoResponse(
            chain="solana",
            pubkey=request.pubkey,
            lamports=account_info.get("lamports", 0),
            owner=account_info.get("owner", ""),
            executable=account_info.get("executable", False),
            rent_epoch=account_info.get("rentEpoch", 0),
            data=data_str,
            data_len=data_len
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching account info: {str(e)}"
        )
    finally:
        await rpc_client.close()
