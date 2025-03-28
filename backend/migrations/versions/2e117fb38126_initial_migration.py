"""Initial Migration

Revision ID: 2e117fb38126
Revises: 
Create Date: 2025-03-26 11:48:49.881751

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2e117fb38126'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('exercises',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('muscle_group', sa.String(length=50), nullable=True),
    sa.Column('equipment', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('routines',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('day_of_week', sa.String(length=10), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('routine_exercises',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('routine_id', sa.Integer(), nullable=False),
    sa.Column('exercise_id', sa.Integer(), nullable=False),
    sa.Column('sets', sa.Integer(), nullable=True),
    sa.Column('reps', sa.Integer(), nullable=True),
    sa.Column('weight', sa.Float(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], name=op.f('fk_routine_exercises_exercise_id_exercises')),
    sa.ForeignKeyConstraint(['routine_id'], ['routines.id'], name=op.f('fk_routine_exercises_routine_id_routines')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('routine_exercises')
    op.drop_table('routines')
    op.drop_table('exercises')
    # ### end Alembic commands ###
