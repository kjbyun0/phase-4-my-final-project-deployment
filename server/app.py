#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Employer, JobCategory, JobPosting

app.secret_key = b'>\x87\x1fJ\xb80\xd6v\xb5\x9d\x8e\x80u\xc2\x1bp'

# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


class Authenticate(Resource):
    # login
    def post(self):
        signin_dict = request.get_json()
        user = User.query.filter_by(username=signin_dict.get('username')).first()
        if user and user.authenticate(signin_dict.get('password')):
            session['user_id'] = user.id
            return make_response(user.to_dict(), 200)
        return make_response({
            'message': 'Invalid User'
        }, 401)

    # check_session: when client app loose all user account information after refreshing the app
    def get(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if user:
            return make_response(user.to_dict(), 200)
        return make_response({
            'message': 'User Logged Out'
        }, 401)
    
    # delete
    def delete(self):
        session['user_id'] = None
        return make_response({}, 204)


class Signup(Resource):
    def post(self):
        account_req_dict = request.get_json()
        print(f'account_req_dict: {account_req_dict}')
        try:
            # if this new account is for employer
            # new_employer = None
            # if account_req_dict.get('isEmployer'): # => Must be added to Sigup.js in the client side
            new_employer = Employer(
                name = account_req_dict.get('name')
            )
            db.session.add(new_employer)

            new_user = User(
                username = account_req_dict.get('username'),
                password_hash = account_req_dict.get('password'),
                email = account_req_dict.get('email'),
                phone = account_req_dict.get('phone'),
                street_1 = account_req_dict.get('street1'),
                street_2 = account_req_dict.get('street2'),
                city = account_req_dict.get('city'),
                state = account_req_dict.get('state'),
                zip_code = account_req_dict.get('zipCode'),

                employer = new_employer
            )
            db.session.add(new_user)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}'
            }, 400)

        session['user_id'] = new_user.id
        return make_response(new_user.to_dict(), 201)


class JobPostings(Resource):
    def get(self):
        job_postings = [job_posting.to_dict() for job_posting in JobPosting.query.all()]
        return make_response(job_postings, 200)
    
    def post(self):
        new_job_dict = request.get_json()
        new_job_category = JobCategory.query.filter_by(category=new_job_dict.get('category')).first()
        user = User.query.filter_by(id=session['user_id']).first()
        employer = user.employer
        new_job = JobPosting(
            title = new_job_dict.get('title'),
            description = new_job_dict.get('description'),
            salary = new_job_dict.get('salary'),
            job_type = new_job_dict.get('job_type'),
            remote = new_job_dict.get('remote'),
            is_active = new_job_dict.get('is_active'),
            job_category = new_job_category,
            employer = employer
        )
        db.session.add(new_job)
        db.session.commit()
        return make_response(new_job.to_dict(), 201)


class JobCategories(Resource):
    def get(self):
        job_categories = [job_category.to_dict() for job_category in JobCategory.query.all()]
        return make_response(job_categories, 200)


api.add_resource(Authenticate, '/authenticate')
api.add_resource(Signup, '/signup')
api.add_resource(JobPostings, '/jobpostings')
api.add_resource(JobCategories, '/jobcategories')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

