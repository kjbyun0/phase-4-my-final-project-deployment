#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
        User.query.delete()
        db.session.commit()

        u1 = User(
            username='ken0',
            password_hash='ken0',
            name='Ken Byun',
            email='kjb0@gmail.com',
            mobile='123-456-7891',
            # address='1234 Whitewood Blvd #100, Austin, TX, 987654'
        )
        db.session.add(u1)
        db.session.commit()
