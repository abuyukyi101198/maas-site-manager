from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Token(BaseModel):
    """A registration token for a site."""

    id: int
    value: UUID
    site_id: int | None
    expired: datetime
    created: datetime
