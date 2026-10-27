"""rescale shot ratings to 1-5 scale

Revision ID: 5978e560494b
Revises: 8191f7b2a8cf
Create Date: 2026-10-27 17:54:54.442894

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '5978e560494b'
down_revision: str | Sequence[str] | None = '8191f7b2a8cf'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Rescale existing 1-10 ratings down to 1-5 (1-2->1, 3-4->2, ..., 9-10->5)."""
    op.execute(
        "UPDATE shots SET rating = CEIL(rating / 2.0)::integer WHERE rating > 5"
    )


def downgrade() -> None:
    """Not reversible: the 1-10 -> 1-5 rescale is lossy (two old values map to one)."""
