#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Employer, Applicant, JobCategory, JobPosting, JobApplication, FavoriteJob

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
        # print(f'account_req_dict: {account_req_dict}')
        try:
            if account_req_dict.get('isEmployer'):
                new_employer = Employer(name = account_req_dict.get('name'))
                db.session.add(new_employer)
            else:
                new_applicant = Applicant(
                    first_name = account_req_dict.get('firstName'),
                    last_name = account_req_dict.get('lastName'),
                    mobile = account_req_dict.get('mobile')
                )
                db.session.add(new_applicant)

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

                employer = new_employer if account_req_dict.get('isEmployer') else None,
                applicant = new_applicant if not account_req_dict.get('isEmployer') else None
            )
            db.session.add(new_user)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}',
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
        try:
            new_job = JobPosting(
                title = new_job_dict.get('title'),
                description = new_job_dict.get('description'),
                pay = new_job_dict.get('pay'),
                job_type = new_job_dict.get('job_type'),
                remote = new_job_dict.get('remote'),
                status = new_job_dict.get('status'),
                job_category = new_job_category,
                employer = employer
            )
            db.session.add(new_job)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}',
            }, 400)
        
        return make_response(new_job.to_dict(), 201)


class JobPosting_by_id(Resource):
    def get(self, id):
        job_posting = JobPosting.query.filter_by(id=id).first()
        if job_posting:
            return make_response(job_posting.to_dict(), 200)
        
        return make_response({
            'message': f'Job Post {id} not found'
        }, 404)
    
    def patch(self, id):
        request_dict = request.get_json()
        job_posting = JobPosting.query.filter_by(id=id).first()
        if job_posting:
            try: 
                for key in request_dict:
                    setattr(job_posting, key, request_dict[key])
                db.session.add(job_posting)
                db.session.commit()
            except Exception as exc:
                return make_response({
                    'message': f'{exc}',
                }, 400)
            return make_response(job_posting.to_dict(), 200)

        return make_response({
            'message': f'Job Post {id} not found'
        }, 404)
    
    def delete(self, id):
        job_posting = JobPosting.query.filter_by(id=id).first()
        if job_posting:
            try: 
                db.session.delete(job_posting)
                db.session.commit()
            except Exception as exc:
                return make_response({
                    'message': f'{exc}',
                }, 400)
            return make_response({}, 204)
        
        return make_response({
            'message': f'Job Post {id} not found',
        }, 404)


class JobApplications(Resource):
    def post(self):
        new_job_app_dict = request.get_json()
        try:
            new_job_app = JobApplication(
                education = new_job_app_dict.get('education'),
                experience = new_job_app_dict.get('experience'),
                certificate = new_job_app_dict.get('certificate'),
                status = new_job_app_dict.get('status'),
                job_posting_id = new_job_app_dict.get('job_posting_id'),
                applicant_id = new_job_app_dict.get('applicant_id')
                # => It needs to be requested only by an applicant, not by an employer.
                # => Is it possible not to have job_posting_id and application_id???? need error handling if it happens???
            )
            db.session.add(new_job_app)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}',
            }, 400)
        
        return make_response(new_job_app.to_dict(), 201)


class JobApplication_by_id(Resource):
    def patch(self, id):
        request_dict = request.get_json()
        app = JobApplication.query.filter_by(id=id).first()
        if app: 
            try: 
                for key in request_dict:
                    setattr(app, key, request_dict[key])
                db.session.add(app)
                db.session.commit()
            except Exception as exc:
                return make_response({
                    'message': f'{exc}'
                }, 400)
            return make_response(app.to_dict(), 200)

        return make_response({
            'message': f'Application {id} not found'
        }, 404)
        
    def delete(self, id): 
        app = JobApplication.query.filter_by(id=id).first()
        if app:
            try:
                db.session.delete(app)
                db.session.commit()
            except Exception as exc:
                return make_response({
                    'message': f'{exc}'
                }, 400)
            return make_response({}, 204)
        
        return make_response({
            'message': f'Application {id} not found'
        }, 404)


class FavoriteJobs(Resource):       
    def post(self):
        request_dict = request.get_json()
        try: 
            fj = FavoriteJob(
                applicant_id = request_dict.get('applicant_id'), # <= newly changed.
                job_posting_id = request_dict.get('job_posting_id')
            )
            db.session.add(fj)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}',
            }, 400)
        return make_response(fj.to_dict(), 201)


class FavoriteJob_by_id(Resource):
    def delete(self, id):
        fj = FavoriteJob.query.filter_by(id=id).first()
        if fj: 
            try: 
                db.session.delete(fj)
                db.session.commit()
            except Exception as exc:
                return make_response({
                    'message': f'{exc}',
                }, 400)
            return make_response({}, 204)

        return make_response({
            'message': f'Favorite Job {id} not found'
        }, 404)


api.add_resource(Authenticate, '/authenticate')
api.add_resource(Signup, '/signup')
api.add_resource(JobCategories, '/jobcategories')
api.add_resource(JobPostings, '/jobpostings')
api.add_resource(JobPosting_by_id, '/jobpostings/<int:id>')
api.add_resource(JobApplications, '/jobapplications')
api.add_resource(JobApplication_by_id, '/jobapplications/<int:id>')
api.add_resource(FavoriteJobs, '/favoritejobs')
api.add_resource(FavoriteJob_by_id, '/favoritejobs/<int:id>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

