from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '498a1604032c'
down_revision = '411b30884686'
branch_labels = None
depends_on = None

def upgrade():
    # Ensure `status` is non-null and has its default
    with op.batch_alter_table('maintenance_requests', schema=None) as batch_op:
        batch_op.alter_column(
            'status',
            existing_type=mysql.ENUM('Pending', 'In Progress', 'Resolved', 'Cancelled', name='request_status'),
            nullable=False,
            existing_server_default=sa.text("'Pending'")  # Ensures default 'Pending'
        )

        # Make request_date non-null with CURRENT_TIMESTAMP default
        batch_op.alter_column(
            'request_date',
            existing_type=mysql.DATETIME(),
            nullable=False,
            server_default=sa.text('CURRENT_TIMESTAMP')  # Ensure CURRENT_TIMESTAMP is used by default
        )

        # Add scheduled_date column (nullable by default)
        batch_op.add_column(
            sa.Column('scheduled_date', sa.DateTime(), nullable=True)
        )

def downgrade():
    # Revert request_date back to nullable without default, and status to nullable
    with op.batch_alter_table('maintenance_requests', schema=None) as batch_op:
        batch_op.alter_column(
            'request_date',
            existing_type=mysql.DATETIME(),
            nullable=True,
            server_default=None
        )
        batch_op.alter_column(
            'status',
            existing_type=mysql.ENUM('Pending', 'In Progress', 'Resolved', 'Cancelled', name='request_status'),
            nullable=True,
            existing_server_default=None
        )

        # Remove scheduled_date column
        batch_op.drop_column('scheduled_date')
