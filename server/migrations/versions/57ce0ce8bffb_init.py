"""init

Revision ID: 57ce0ce8bffb
Revises: 
Create Date: 2024-06-26 16:04:48.672739

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '57ce0ce8bffb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('applicants',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(), nullable=False),
    sa.Column('last_name', sa.String(), nullable=False),
    sa.Column('mobile', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('employers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('job_categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('job_postings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('pay', sa.Float(), nullable=False),
    sa.Column('job_type', sa.String(), nullable=True),
    sa.Column('remote', sa.String(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('job_category_id', sa.Integer(), nullable=True),
    sa.Column('employer_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], name=op.f('fk_job_postings_employer_id_employers')),
    sa.ForeignKeyConstraint(['job_category_id'], ['job_categories.id'], name=op.f('fk_job_postings_job_category_id_job_categories')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('_password_hash', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('street_1', sa.String(), nullable=True),
    sa.Column('street_2', sa.String(), nullable=True),
    sa.Column('city', sa.String(), nullable=True),
    sa.Column('state', sa.String(), nullable=True),
    sa.Column('zip_code', sa.String(), nullable=True),
    sa.Column('employer_id', sa.Integer(), nullable=True),
    sa.Column('applicant_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['applicant_id'], ['applicants.id'], name=op.f('fk_users_applicant_id_applicants')),
    sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], name=op.f('fk_users_employer_id_employers')),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('favorite_jobs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('applicant_id', sa.Integer(), nullable=True),
    sa.Column('job_posting_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['applicant_id'], ['applicants.id'], name=op.f('fk_favorite_jobs_applicant_id_applicants')),
    sa.ForeignKeyConstraint(['job_posting_id'], ['job_postings.id'], name=op.f('fk_favorite_jobs_job_posting_id_job_postings')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('job_applications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('education', sa.String(), nullable=True),
    sa.Column('experience', sa.String(), nullable=True),
    sa.Column('certificate', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('job_posting_id', sa.Integer(), nullable=True),
    sa.Column('applicant_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['applicant_id'], ['applicants.id'], name=op.f('fk_job_applications_applicant_id_applicants')),
    sa.ForeignKeyConstraint(['job_posting_id'], ['job_postings.id'], name=op.f('fk_job_applications_job_posting_id_job_postings')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('job_applications')
    op.drop_table('favorite_jobs')
    op.drop_table('users')
    op.drop_table('job_postings')
    op.drop_table('job_categories')
    op.drop_table('employers')
    op.drop_table('applicants')
    # ### end Alembic commands ###