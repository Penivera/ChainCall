from fastapi import APIRouter, HTTPException
from ...chains.solana import SolanaBytePacker
from ...models.schemas import (
    PackInstructionRequest,
    PackInstructionResponse,
    UnpackInstructionRequest,
    UnpackInstructionResponse,
    ErrorResponse,
)
import base64

router = APIRouter(prefix="/instruction", tags=["Solana - Instructions"])


@router.post(
    "/pack",
    response_model=PackInstructionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Pack Instruction Data",
    description="Pack instruction data using a byte layout for Solana programs",
)
async def pack_instruction(request: PackInstructionRequest):
    try:
        packer = SolanaBytePacker()
        layout = [{"type": f.type.value, "value": f.value} for f in request.layout]
        packed_bytes = packer.pack_layout(layout)

        return PackInstructionResponse(
            chain="solana",
            buffer_hex=packed_bytes.hex(),
            buffer_base64=base64.b64encode(packed_bytes).decode("utf-8"),
            length=len(packed_bytes),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error packing instruction: {str(e)}"
        )


@router.post(
    "/unpack",
    response_model=UnpackInstructionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Unpack Instruction Data",
    description="Unpack instruction data using a byte layout for Solana programs",
)
async def unpack_instruction(request: UnpackInstructionRequest):
    try:
        packer = SolanaBytePacker()
        data = bytes.fromhex(request.buffer_hex)
        layout = [{"type": f.type.value} for f in request.layout]
        unpacked_values = packer.unpack_layout(layout, data)

        return UnpackInstructionResponse(chain="solana", values=unpacked_values)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error unpacking instruction: {str(e)}"
        )


@router.get(
    "/types",
    summary="Get Supported Data Types",
    description="Get list of supported data types for instruction packing",
)
async def get_supported_types():
    packer = SolanaBytePacker()
    return {"chain": "solana", "types": packer.get_supported_types()}
