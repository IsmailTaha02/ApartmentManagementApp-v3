"""your message

Revision ID: 411b30884686
Revises: a8a9c8116e3d
Create Date: 2025-04-21 15:54:03.592922
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql
from sqlalchemy import inspect, text

# revision identifiers, used by Alembic.
revision = '411b30884686'
down_revision = 'a8a9c8116e3d'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    insp = inspect(conn)

    # --- 1) Drop orphan tables if they exist ---
    if 'payments' in insp.get_table_names():
        op.drop_table('payments')
    if 'notifications' in insp.get_table_names():
        op.drop_table('notifications')

    # --- 2) Fix apartments.owner_id FK & nullability ---
    # Find & drop the existing FK on apartments.owner_id
    for fk in insp.get_foreign_keys('apartments'):
        if fk['referred_table'] == 'users' and fk['constrained_columns'] == ['owner_id']:
            op.drop_constraint(fk['name'], 'apartments', type_='foreignkey')
    # Now make owner_id NOT NULL
    op.alter_column('apartments', 'owner_id',
                    existing_type=sa.BigInteger(),
                    nullable=False)
    # Recreate a simple FK back to users.id
    op.create_foreign_key(
        'fk_apartments_owner',      # new constraint name
        'apartments',               # source table
        'users',                    # referent table
        ['owner_id'], ['id'],       # columns
    )

    # --- 3) Batch‐alter the other apartments columns ---
    with op.batch_alter_table('apartments') as batch_op:
        batch_op.alter_column('video',
            existing_type=mysql.TEXT(),
            type_=sa.String(length=500),
            existing_nullable=True,
        )
        batch_op.alter_column('map_location',
            existing_type=mysql.TEXT(),
            type_=sa.String(length=500),
            existing_nullable=True,
        )
        batch_op.alter_column('created_at',
            existing_type=mysql.TIMESTAMP(),
            type_=sa.DateTime(),
            existing_nullable=True,
            existing_server_default=sa.text('CURRENT_TIMESTAMP'),
        )

    # --- 4) Batch‐alter the users table columns ---
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('full_name',
            existing_type=mysql.VARCHAR(length=255),
            type_=sa.Text(),
            existing_nullable=False,
        )
        batch_op.alter_column('phone_number',
            existing_type=mysql.VARCHAR(length=20),
            type_=sa.Text(),
            existing_nullable=False,
        )
        batch_op.alter_column('role',
            existing_type=mysql.ENUM('Owner','Administrator','Buyer/Tenant','Technician'),
            type_=sa.Enum('Administrator','Buyer/Tenant','Owner','Technician', name='user_roles'),
            existing_nullable=False,
        )
        batch_op.alter_column('job',
            existing_type=mysql.VARCHAR(length=255),
            type_=sa.Text(),
            existing_nullable=True,
        )
        batch_op.alter_column('facebook_link',
            existing_type=mysql.VARCHAR(length=255),
            type_=sa.Text(),
            existing_nullable=True,
        )
        batch_op.alter_column('password',
            existing_type=mysql.VARCHAR(length=255),
            type_=sa.Text(),
            existing_nullable=False,
        )
        batch_op.alter_column('created_at',
            existing_type=mysql.TIMESTAMP(),
            type_=sa.DateTime(),
            existing_nullable=True,
            existing_server_default=sa.text('CURRENT_TIMESTAMP'),
        )


def downgrade():
    conn = op.get_bind()
    insp = inspect(conn)

    # Revert users table alterations
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('created_at',
            existing_type=sa.DateTime(),
            type_=mysql.TIMESTAMP(),
            existing_server_default=sa.text('CURRENT_TIMESTAMP'),
        )
        batch_op.alter_column('password',
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(length=255),
        )
        batch_op.alter_column('facebook_link',
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(length=255),
        )
        batch_op.alter_column('job',
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(length=255),
        )
        batch_op.alter_column('role',
            existing_type=sa.Enum('Administrator','Buyer/Tenant','Owner','Technician', name='user_roles'),
            type_=mysql.ENUM('Owner','Administrator','Buyer/Tenant','Technician'),
        )
        batch_op.alter_column('phone_number',
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(length=20),
        )
        batch_op.alter_column('full_name',
            existing_type=sa.Text(),
            type_=mysql.VARCHAR(length=255),
        )

    # Revert apartments.owner_id FK & nullability
    # drop our new FK
    op.drop_constraint('fk_apartments_owner', 'apartments', type_='foreignkey')
    # make owner_id nullable again
    op.alter_column('apartments', 'owner_id',
                    existing_type=sa.BigInteger(),
                    nullable=True)
    # restore original ON DELETE SET NULL behavior
    op.create_foreign_key(
        'apartments_ibfk_1',
        'apartments',
        'users',
        ['owner_id'], ['id'],
        ondelete='SET NULL'
    )

    # Revert the other apartments column types
    with op.batch_alter_table('apartments') as batch_op:
        batch_op.alter_column('created_at',
            existing_type=sa.DateTime(),
            type_=mysql.TIMESTAMP(),
            existing_server_default=sa.text('CURRENT_TIMESTAMP'),
        )
        batch_op.alter_column('map_location',
            existing_type=sa.String(length=500),
            type_=mysql.TEXT(),
        )
        batch_op.alter_column('video',
            existing_type=sa.String(length=500),
            type_=mysql.TEXT(),
        )

    # Re‐create payments & notifications if they were present
    if 'payments' not in insp.get_table_names():
        op.create_table(
            'payments',
            sa.Column('id', sa.BigInteger(), primary_key=True),
            sa.Column('transaction_id', sa.BigInteger(), sa.ForeignKey('transactions.id')),
            sa.Column('amount', sa.Numeric(12,2), nullable=False),
            sa.Column('due_date', sa.TIMESTAMP(), nullable=False),
            sa.Column('paid_date', sa.TIMESTAMP(), nullable=True),
            sa.Column('status', sa.Enum('Pending','Completed','Overdue', name='payment_status'), nullable=False),
        )
    if 'notifications' not in insp.get_table_names():
        op.create_table(
            'notifications',
            sa.Column('id', sa.BigInteger(), primary_key=True),
            sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='CASCADE')),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('is_read', sa.Boolean(), server_default=sa.text('0')),
            sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP')),
        )
