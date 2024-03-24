#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, JobCategory, JobOpening

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
        User.query.delete()
        JobCategory.query.delete()
        JobOpening.query.delete()
        db.session.commit()

        u1 = User(
            username = 'test0',
            password_hash = 'test0',
            first_name = 'FirstName0',
            last_name = 'LastName0',
            email = 'test0@gmail.com',
            mobile = '000)000-0000',
            phone = '000)000-0000',
            street_1 = '00000 Westwood Blvd',
            street_2 = 'Apt# 000',
            city = 'Huston',
            state = 'TX',
            zip_code = '00000'
        )
        u2 = User(
            username = 'test1',
            password_hash = 'test1',
            first_name = 'FirstName1',
            last_name = 'LastName1',
            email = 'test1@gmail.com',
            mobile = '111)111-1111',
            phone = '111)111-1111',
            street_1 = '11111 Westwood Blvd',
            street_2 = 'Apt# 111',
            city = 'Huston',
            state = 'TX',
            zip_code = '11111'
        )
        u3 = User(
            username = 'test2',
            password_hash = 'test2',
            first_name = 'FirstName2',
            last_name = 'LastName2',
            email = 'test2@gmail.com',
            mobile = '222)222-2222',
            phone = '222)222-2222',
            street_1 = '22222 Westwood Blvd',
            street_2 = 'Apt# 222',
            city = 'Huston',
            state = 'TX',
            zip_code = '22222'
        )
        db.session.add_all([u1, u2, u3,])

        jc1 = JobCategory(
            category = 'Cleaner'
        )

        jc2 = JobCategory(
            category = 'Server'
        )
        db.session.add_all([jc1, jc2,])

        jo1 = JobOpening(
            title = 'HouseKeeper',
            description = 'cleaning a residential house',
            salary = 20.00,
            job_type = 'Part time', # => full,partime,contract
            location = 'an address',
            remote = 'On Site',
            isActive = True,
            job_category = jc1,
            employer = u2
        )

        jo2 = JobOpening(
            title = 'Server',
            description = 'a waiter',
            salary = 14.00,
            job_type = 'Part time', # => full,partime,contract
            location = 'an address',
            remote = 'On Site',
            isActive = True,
            job_category = jc2,
            employer = u3
        )
        db.session.add_all([jo1, jo2,])

        db.session.commit()
