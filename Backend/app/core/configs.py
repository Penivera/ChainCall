from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App Config
    PROJECT_NAME: str = "ChainCall"
    API_V1_STR: str = Field(default="/api/v1")

    # Solana
    # Optional because it might not be set in all environments
    BACKEND_SOLANA_KEYPAIR: Optional[str] = None

    # This config tells pydantic to read from a .env file if present
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
