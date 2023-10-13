from datetime import datetime

from pydantic import BaseModel


class Token(BaseModel):
    """A registration token for a site."""

    id: int
    value: str
    expired: datetime
    created: datetime
