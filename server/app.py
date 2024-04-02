#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Employer, Applicant, JobCategory, JobPosting, JobApplication

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


class JobCategories(Resource):
    def get(self):
        job_categories = [job_category.to_dict() for job_category in JobCategory.query.all()]
        return make_response(job_categories, 200)


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


class JobPosting_by_id(Resource):
    def get(self, id):
        job_posting = JobPosting.query.filter_by(id=id).first()

        if job_posting:
            return make_response(job_posting.to_dict(), 200)
        return make_response({
            'message': f'Job Post {id} not found'
        }, 404)


class JobApplications(Resource):
    #It is to get all the job applications submitted by an application signed in.
    def get(self): 
        user = User.query.filter_by(id=session.get('user_id')).first()
        if user:
            if user.applicant_id:
                job_apps_list_dict = [app.to_dict() for app in JobApplication.query.filter_by(applicant_id=user.applicant_id).all()]
                return make_response(job_apps_list_dict, 200)
            else: 
                print("In JobApplications, User isn't an applicant but an employer")
                return make_response({
                    'message': "User isn't an applicant but an employer",
                }, 403)
        else:
            # => need to deal with this case on the client side.!!!!!
            print('In JobApplications, User needs to sign in first')
            return make_response({
                'message': "User needs to sign in first",
            }, 401)

    # It is to post a job application
    def post(self):
        new_job_app_dict = request.get_json()
        new_job_app = JobApplication(
            education = new_job_app_dict.get('education'),
            experience = new_job_app_dict.get('experience'),
            certificate = new_job_app_dict.get('certificate'),
            status = new_job_app_dict.get('status'),
            job_posting_id = new_job_app_dict.get('job_posting_id'),
            applicant_id = User.query.filter_by(id=session.get('user_id')).first().applicant_id
            # => It needs to be requested only by an ampplicant, not by an employer.
            # => Is it possible not to have job_posting_id and application_id???? need error handling if it happens???
        )
        db.session.add(new_job_app)
        db.session.commit()
        return make_response(new_job_app.to_dict(), 201)
    

class JobApplication_by_jpid(Resource):
    #It is to get a job applications of job_posting_id submitted by an application signed in.
    def get(self, jpid):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if user: 
            if user.applicant_id: 
                job_app = JobApplication.query.filter_by(job_posting_id=jpid, applicant_id=user.applicant_id).first()
                if job_app:
                    print("In JobApplication_by_jpid, User has apply to this job before, job_app: ", job_app)
                    return make_response(job_app.to_dict(), 200)
                else:
                    print("In JobApplication_by_jpid, User hasn't apply to this job yet")
                    return make_response({
                        'message': f'Job application {jpid} by the user not available',
                    }, 404)
            else: 
                print("In JobApplication_by_jpid, User isn't an applicant but an employer")
                return make_response({
                    'message': "User isn't an applicant but an employer",
                }, 403)
        else:
            # => need to deal with this case on the client side.!!!!!
            print('In JobApplication_by_jpid, User needs to sign in first')
            return make_response({
                'message': "User needs to sign in first",
            }, 401)
        
    def patch(self, jpid): 
        user = User.query.filter_by(id=session['user_id']).first()
        if user:
            if user.applicant_id:
                job_app = JobApplication.query.filter_by(job_posting_id=jpid, applicant_id=user.applicant_id).first()
                if job_app:
                    request_dict = request.get_json()
                    for key in request_dict:
                        setattr(job_app, key, request_dict[key])
                    db.session.add(job_app)
                    db.session.commit()
                    return make_response(job_app.to_dict(), 200)
                else: 
                    print("In JobApplication_by_jpid patch, User hasn't apply to this job yet")
                    return make_response({
                        'message': f'Job application {jpid} by the user not available',
                    }, 404)
            else:
                print("In JobApplication_by_jpid patch , User isn't an applicant but an employer")
                return make_response({
                    'message': "User isn't an applicant but an employer",
                }, 403)
        else: 
            # => need to deal with this case on the client side.!!!!!
            print('In JobApplication_by_jpid patch, User needs to sign in first')
            return make_response({
                'message': "User needs to sign in first",
            }, 401)


api.add_resource(Authenticate, '/authenticate')
api.add_resource(Signup, '/signup')
api.add_resource(JobCategories, '/jobcategories')
api.add_resource(JobPostings, '/jobpostings')
api.add_resource(JobPosting_by_id, '/jobpostings/<int:id>')
api.add_resource(JobApplications, '/jobapplications')
api.add_resource(JobApplication_by_jpid, '/jobapplication/<int:jpid>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

