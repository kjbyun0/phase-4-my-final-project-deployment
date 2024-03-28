#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app
from models import db, User, Employer, Applicant, JobCategory, JobPosting, JobApplication

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        # Seed code goes here!
        User.query.delete()
        Employer.query.delete()
        Applicant.query.delete()
        JobCategory.query.delete()
        JobPosting.query.delete()
        JobApplication.query.delete()
        db.session.commit()

        users = []
        employers = []
        applicants = []
        for i in range(20):
            if i < 5:
                employers.append(Employer(
                    name = f'company name{i}'
                ))
            else:
                applicants.append(Applicant(
                    first_name = f'first name{i}',
                    last_name = f'last name{i}',
                    mobile = f'{i%10}{i%10}{i%10})000-0000'
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
                employer = employers[-1] if i < 5 else None,
                applicant = applicants[-1] if i >= 5 else None
            ))
        db.session.add_all(employers)
        db.session.add_all(applicants)
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

        status = ['new', 'accepted', 'rejected']
        job_applications = []
        for i in range(15):
            job_applications.append(JobApplication(
                education = f"Bachelor's degree at UT Austin-{i+5}",
                experience = f'10 year experience-{i+5}',
                certificate = f'No Certificate-{i+5}',
                status = status[i % 3],
                job_posting = job_postings[0],
                applicant = applicants[i]
            ))
        for i in range(1, 20):
            job_applications.append(JobApplication(
                education = f"Bachelor's degree at UT Austin-5",
                experience = f'10 year experience-5',
                certificate = f'No Certificate-5',
                status = status[i % 3],
                job_posting = job_postings[i],
                applicant = applicants[0]
            ))
        db.session.add_all(job_applications)
        db.session.commit()
