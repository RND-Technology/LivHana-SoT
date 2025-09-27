"""LightSpeed X-Series OAuth2 and API client utilities."""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)


class LightSpeedError(Exception):
    """Base exception for LightSpeed integration issues."""


class LightSpeedAuthError(LightSpeedError):
    """Raised when OAuth2 authentication steps fail."""


class LightSpeedAPIError(LightSpeedError):
    """Raised when LightSpeed API responses indicate an error."""


@dataclass
class LightSpeedOAuthConfig:
    """Configuration for the LightSpeed OAuth2 flow."""

    client_id: str
    client_secret: str
    redirect_uri: str
    scope: str = (
        "offline_access products.read products.write inventory.read inventory.write"
    )
    domain_prefix: Optional[str] = None
    authorization_url: str = "https://secure.vendhq.com/connect"
    token_url_template: str = "https://{domain_prefix}.vendhq.com/api/1.0/token"
    api_base_url_template: str = "https://{domain_prefix}.vendhq.com/api/2.0"
    token_storage_path: str = "logs/lightspeed_tokens.json"
    verify_ssl: bool = True
    request_timeout: int = 30


class LightSpeedOAuthClient:
    """Manage LightSpeed OAuth2 token lifecycle."""

    def __init__(self, config: LightSpeedOAuthConfig):
        self.config = config
        self._token_lock = asyncio.Lock()
        self._token_data: Optional[Dict[str, Any]] = None
        self._token_expiry: Optional[datetime] = None
        self._domain_prefix: Optional[str] = config.domain_prefix
        self._token_path = Path(config.token_storage_path)
        self._load_token_from_disk()

    @property
    def domain_prefix(self) -> Optional[str]:
        """Return the effective domain prefix."""

        if self._domain_prefix:
            return self._domain_prefix
        if self._token_data:
            return self._token_data.get("domain_prefix")
        return None

    def get_authorization_url(self, state: str) -> str:
        """Build the LightSpeed authorization URL for user consent."""

        params = {
            "response_type": "code",
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "scope": self.config.scope,
            "state": state,
        }
        query = "&".join(f"{key}={aiohttp.helpers.quote(str(value), safe='')}" for key, value in params.items())
        return f"{self.config.authorization_url}?{query}"

    def get_api_base_url(self) -> str:
        """Return the API base URL for the active domain."""

        prefix = self.domain_prefix
        if not prefix:
            raise LightSpeedAuthError("LightSpeed domain prefix is not configured.")
        return self.config.api_base_url_template.format(domain_prefix=prefix.rstrip("/"))

    async def exchange_code_for_tokens(
        self, authorization_code: str, domain_prefix: Optional[str] = None
    ) -> Dict[str, Any]:
        """Exchange an authorization code for access and refresh tokens."""

        token_url = self._build_token_url(domain_prefix)
        payload = {
            "grant_type": "authorization_code",
            "code": authorization_code,
            "client_id": self.config.client_id,
            "client_secret": self.config.client_secret,
            "redirect_uri": self.config.redirect_uri,
        }
        token_response = await self._post_form(token_url, payload)
        await self._store_token_response(token_response, domain_prefix)
        return token_response

    async def refresh_access_token(self) -> Dict[str, Any]:
        """Refresh the access token using the stored refresh token."""

        async with self._token_lock:
            if not self._token_data or not self._token_data.get("refresh_token"):
                raise LightSpeedAuthError("No refresh token available for LightSpeed.")

            token_url = self._build_token_url()
            payload = {
                "grant_type": "refresh_token",
                "refresh_token": self._token_data["refresh_token"],
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret,
            }
            token_response = await self._post_form(token_url, payload)
            await self._store_token_response(token_response, None)
            return token_response

    async def get_access_token(self) -> str:
        """Return a valid access token, refreshing if required."""

        async with self._token_lock:
            if not self._token_data:
                raise LightSpeedAuthError(
                    "LightSpeed access token not found. Complete the OAuth2 flow first."
                )

            if self._token_expiry and datetime.now(timezone.utc) >= self._token_expiry:
                await self.refresh_access_token()

            return self._token_data["access_token"]

    def get_cached_token_info(self) -> Optional[Dict[str, Any]]:
        """Return metadata about the cached token without exposing secrets."""

        if not self._token_data:
            return None

        return {
            "domain_prefix": self.domain_prefix,
            "scope": self._token_data.get("scope"),
            "expires_at": self._token_expiry.isoformat() if self._token_expiry else None,
            "has_refresh_token": bool(self._token_data.get("refresh_token")),
        }

    async def _post_form(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """POST form data to LightSpeed and return the parsed JSON response."""

        timeout = aiohttp.ClientTimeout(total=self.config.request_timeout)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(
                url,
                data=payload,
                ssl=self.config.verify_ssl,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            ) as response:
                text = await response.text()
                if response.status >= 400:
                    logger.error(
                        "LightSpeed OAuth request failed %s: %s", response.status, text
                    )
                    raise LightSpeedAuthError(
                        f"LightSpeed OAuth request failed ({response.status}): {text}"
                    )

                try:
                    data = await response.json()
                except aiohttp.ContentTypeError as exc:
                    raise LightSpeedAuthError(
                        "LightSpeed OAuth response was not JSON-formatted."
                    ) from exc

                return data

    def _build_token_url(self, domain_prefix: Optional[str] = None) -> str:
        prefix = domain_prefix or self.domain_prefix or self.config.domain_prefix
        if not prefix:
            raise LightSpeedAuthError(
                "LightSpeed domain prefix required to contact the token endpoint."
            )
        prefix = prefix.rstrip("/")
        return self.config.token_url_template.format(domain_prefix=prefix)

    async def _store_token_response(
        self, token_response: Dict[str, Any], domain_prefix: Optional[str]
    ) -> None:
        access_token = token_response.get("access_token")
        if not access_token:
            raise LightSpeedAuthError("LightSpeed token response missing access_token.")

        expires_key = "expires_in" if "expires_in" in token_response else "expires"
        expires_in = int(token_response.get(expires_key, 0) or 0)
        expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in or 3600)

        stored_data = {
            "access_token": access_token,
            "token_type": token_response.get("token_type", "Bearer"),
            "refresh_token": token_response.get(
                "refresh_token", self._token_data.get("refresh_token") if self._token_data else None
            ),
            "domain_prefix": domain_prefix
            or token_response.get("domain_prefix")
            or self.domain_prefix,
            "scope": token_response.get("scope", self.config.scope),
            "expires_at": expiry.isoformat(),
        }

        self._token_data = stored_data
        self._token_expiry = expiry
        self._domain_prefix = stored_data.get("domain_prefix")
        self._persist_token_to_disk(stored_data)

    def _load_token_from_disk(self) -> None:
        if not self._token_path.exists():
            return
        try:
            data = json.loads(self._token_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            logger.warning("Existing LightSpeed token file was not valid JSON. Ignoring.")
            return

        expires_at_raw = data.get("expires_at")
        expiry = None
        if expires_at_raw:
            try:
                expiry = datetime.fromisoformat(expires_at_raw)
                if expiry.tzinfo is None:
                    expiry = expiry.replace(tzinfo=timezone.utc)
            except ValueError:
                logger.warning("Invalid expires_at in LightSpeed token file. Ignoring expiry.")

        self._token_data = data
        self._token_expiry = expiry
        self._domain_prefix = data.get("domain_prefix", self._domain_prefix)

    def _persist_token_to_disk(self, token_data: Dict[str, Any]) -> None:
        try:
            self._token_path.parent.mkdir(parents=True, exist_ok=True)
            self._token_path.write_text(json.dumps(token_data, indent=2), encoding="utf-8")
        except OSError as exc:
            logger.error("Failed to write LightSpeed token cache: %s", exc)


class LightSpeedClient:
    """Async client for interacting with the LightSpeed API."""

    def __init__(self, oauth_client: LightSpeedOAuthClient, request_timeout: int = 30):
        self.oauth_client = oauth_client
        self.request_timeout = request_timeout

    async def test_connection(self) -> bool:
        """Verify the API connection by requesting outlet data."""

        try:
            await self._request("GET", "/outlets")
            return True
        except LightSpeedError as exc:
            logger.error("LightSpeed connection test failed: %s", exc)
            return False

    async def get_inventory(self, page: int = 1, page_size: int = 200) -> List[Dict[str, Any]]:
        """Retrieve inventory records from LightSpeed."""

        params = {"page": page, "page_size": page_size}
        response = await self._request("GET", "/inventory", params=params)
        if isinstance(response, dict):
            if "data" in response and isinstance(response["data"], list):
                return response["data"]
            if "inventory" in response and isinstance(response["inventory"], list):
                return response["inventory"]
            if "Inventory" in response and isinstance(response["Inventory"], list):
                return response["Inventory"]
        return []

    async def create_sale(self, sale_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Create a sale/order inside LightSpeed."""

        return await self._request("POST", "/sales", json_body=sale_payload)

    async def create_order(self, sale_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Compat wrapper for legacy order creation calls."""

        return await self.create_sale(sale_payload)

    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        access_token = await self.oauth_client.get_access_token()
        base_url = self.oauth_client.get_api_base_url()
        url = f"{base_url}{path}"

        timeout = aiohttp.ClientTimeout(total=self.request_timeout)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        if json_body is not None:
            headers["Content-Type"] = "application/json"

        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(
                method,
                url,
                headers=headers,
                params=params,
                json=json_body,
                ssl=self.oauth_client.config.verify_ssl,
            ) as response:
                payload = await response.text()
                if response.status >= 400:
                    logger.error(
                        "LightSpeed API call %s %s failed %s: %s",
                        method,
                        path,
                        response.status,
                        payload,
                    )
                    raise LightSpeedAPIError(
                        f"LightSpeed API request failed ({response.status}): {payload}"
                    )

                if not payload:
                    return {}

                try:
                    return json.loads(payload)
                except json.JSONDecodeError as exc:
                    raise LightSpeedAPIError(
                        "LightSpeed API response was not valid JSON."
                    ) from exc
