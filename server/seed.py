#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Employer, JobCategory, JobPosting

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
        User.query.delete()
        Employer.query.delete()
        JobCategory.query.delete()
        JobPosting.query.delete()
        db.session.commit()

        users = []
        employers = []
        for i in range(20):
            if i < 5:
                employers.append(Employer(
                    name = f'company name{i}'
                ))
            
            users.append(User(
                username = f'test{i}',
                password_hash = f'test{i}',
                email = f'test{i}@gmail.com',
                phone = f'{i%10}{i%10}{i%10})000-0000',
                street_1 = f'{i%10}{i%10}{i%10}{i%10}{i%10} Westwood Blvd',
                street_2 = f'Apt# {i%10}{i%10}{i%10}',
                city = 'Huston',
                state = 'TX',
                zip_code = f'{i%10}{i%10}{i%10}{i%10}{i%10}',

                employer = employers[-1] if i < 5 else None
            ))
        db.session.add_all(employers)
        db.session.add_all(users)

        job_category_list = ['Cleaner', 'Server', 'Tutor', 'Babysitter', 'Brand ambassador', 
                          'Sales associate', 'dog walker', 'personal trainer', 'Administrative assistant', 
                          'Bank teller', 'Barista', 'Delivery Driver', 'Bartender', 'Bookkeeper', 
                          'Graphic Designer', 'Real estate agent', 'Receptionist', 'Tour guide', 
                          'Dental hygienist', 'Phlebotomist', 'Speech and language therapist']
        job_categories = []
        for i in range(20):
            job_categories.append(JobCategory(
                category = job_category_list[i]
            ))
        db.session.add_all(job_categories)

        job_types = ['Part time', 'Contract', 'Full time']
        remotes = ['On-Site', 'Remote', 'Hybrid']
        job_postings = []
        for i in range(20):
            job_postings.append(JobPosting(
                title = f'{job_categories[i].category}-{i}',
                description = 'describing sentence',
                salary = 1.00 * i,
                job_type = job_types[i % len(job_types)], # => full,part time,contract
                remote = remotes[i % len(remotes)],
                is_active = True,
                job_category = job_categories[i],
                employer = employers[i % 5]
            ))
        db.session.add_all(job_postings)
        db.session.commit()



        # u1 = User(
        #     username = 'test0',
        #     password_hash = 'test0',
        #     name = 'name0',
        #     email = 'test0@gmail.com',
        #     mobile = '000)000-0000',
        #     phone = '000)000-0000',
        #     street_1 = '00000 Westwood Blvd',
        #     street_2 = 'Apt# 000',
        #     city = 'Huston',
        #     state = 'TX',
        #     zip_code = '00000'
        # )
        # u2 = User(
        #     username = 'test1',
        #     password_hash = 'test1',
        #     name = 'name1',
        #     email = 'test1@gmail.com',
        #     mobile = '111)111-1111',
        #     phone = '111)111-1111',
        #     street_1 = '11111 Westwood Blvd',
        #     street_2 = 'Apt# 111',
        #     city = 'Huston',
        #     state = 'TX',
        #     zip_code = '11111'
        # )
        # u3 = User(
        #     username = 'test2',
        #     password_hash = 'test2',
        #     name = 'name2',
        #     email = 'test2@gmail.com',
        #     mobile = '222)222-2222',
        #     phone = '222)222-2222',
        #     street_1 = '22222 Westwood Blvd',
        #     street_2 = 'Apt# 222',
        #     city = 'Huston',
        #     state = 'TX',
        #     zip_code = '22222'
        # )
        # db.session.add_all([u1, u2, u3,])


        # jc1 = JobCategory(
        #     category = 'Cleaner'
        # )

        # jc2 = JobCategory(
        #     category = 'Server'
        # )

        # jc3 = JobCategory(
        #     category = 'tutor'
        # )
        # db.session.add_all([jc1, jc2,])


        # jo1 = JobOpening(
        #     title = 'HouseKeeper',
        #     description = 'cleaning a residential house',
        #     salary = 20.00,
        #     job_type = 'Part time',
        #     location = 'an address',
        #     remote = 'On Site',
        #     isActive = True,
        #     job_category = jc1,
        #     employer = u2
        # )

        # jo2 = JobOpening(
        #     title = 'Server',
        #     description = 'a waiter',
        #     salary = 14.00,
        #     job_type = 'Part time',
        #     location = 'an address',
        #     remote = 'On Site',
        #     isActive = True,
        #     job_category = jc2,
        #     employer = u3
        # )
        # db.session.add_all([jo1, jo2,])
    