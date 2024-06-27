#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response, render_template
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Employer, Applicant, JobCategory, JobPosting, JobApplication, FavoriteJob

app.secret_key = b'>\x87\x1fJ\xb80\xd6v\xb5\x9d\x8e\x80u\xc2\x1bp'

# Views go here!

# @app.route('/')
# def index(id=0):
#     return '<h1>Project Server</h1>'
@app.route('/')
@app.route('/<int:id>')
def index(id=0):
    return render_template("index.html")


class Authenticate(Resource):
    # login
    def post(self):
        req = request.get_json()
        user = User.query.filter_by(username=req.get('username')).first()
        if user and user.authenticate(req.get('password')):
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
        req = request.get_json()
        # print(f'account_req_dict: {account_req_dict}')
        try:
            if req.get('isEmployer'):
                new_employer = Employer(name = req.get('name'))
                db.session.add(new_employer)
            else:
                new_applicant = Applicant(
                    first_name = req.get('firstName'),
                    last_name = req.get('lastName'),
                    mobile = req.get('mobile')
                )
                db.session.add(new_applicant)

            new_user = User(
                username = req.get('username'),
                password_hash = req.get('password'),
                email = req.get('email'),
                phone = req.get('phone'),
                street_1 = req.get('street1'),
                street_2 = req.get('street2'),
                city = req.get('city'),
                state = req.get('state'),
                zip_code = req.get('zipCode'),

                employer = new_employer if req.get('isEmployer') else None,
                applicant = new_applicant if not req.get('isEmployer') else None
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
    
    def post(self):
        # Allow this operation only when user is login
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.employer:
            return make_response({
                'message': 'Need to sign in with your employer account',
            }, 401 if not user else 403)
        
        req = request.get_json()
        try: 
            cat = JobCategory(
                category = req.get('category')
            )
            db.session.add(cat)
            db.session.commit()
        except Exception as exc:
            return make_response({
                'message': f'{exc}',
            }, 400)
        
        return make_response({}, 201)


class JobPostings(Resource):
    def get(self):
        job_postings = [job_posting.to_dict() for job_posting in JobPosting.query.all()]
        return make_response(job_postings, 200)
    
    def post(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.employer:
            return make_response({
                'message': 'Need to sign in with your employer account',
            }, 401 if not user else 403)

        req = request.get_json()
        new_job_category = JobCategory.query.filter_by(category=req.get('category')).first()
        try:
            new_job = JobPosting(
                title = req.get('title'),
                description = req.get('description'),
                pay = req.get('pay'),
                job_type = req.get('job_type'),
                remote = req.get('remote'),
                status = req.get('status'),
                job_category = new_job_category,
                employer = user.employer
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
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.employer:
            return make_response({
                'message': 'Need to sign in with your employer account',
            }, 401 if not user else 403)

        req = request.get_json()
        job_posting = JobPosting.query.filter_by(id=id).first()
        if job_posting:
            try: 
                for key in req:
                    setattr(job_posting, key, req[key])
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
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.employer:
            return make_response({
                'message': 'Need to sign in with your employer account',
            }, 401 if not user else 403)

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
    def get(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user:
            return make_response({
                'message': 'Need to sign in',
            }, 401)

        job_apps = [job_app.to_dict() for job_app in JobApplication.query.all()]
        return make_response(job_apps, 200)

    def post(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.applicant:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401 if not user else 403)

        req = request.get_json()
        try:
            new_job_app = JobApplication(
                education = req.get('education'),
                experience = req.get('experience'),
                certificate = req.get('certificate'),
                status = req.get('status'),
                job_posting_id = req.get('job_posting_id'),
                applicant_id = req.get('applicant_id')
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
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401)

        req = request.get_json()
        app = JobApplication.query.filter_by(id=id).first()
        if app: 
            try: 
                for key in req:
                    setattr(app, key, req[key])
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
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.applicant:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401 if not user else 403)
        
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
    def get(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.applicant:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401 if not user else 403)

        fjobs = [fjob.to_dict() for fjob in FavoriteJob.query.all()]
        return make_response(fjobs, 200)

    def post(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.applicant:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401 if not user else 403)
        
        req = request.get_json()
        try: 
            fj = FavoriteJob(
                applicant_id = req.get('applicant_id'), # <= newly changed.
                job_posting_id = req.get('job_posting_id')
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
        user = User.query.filter_by(id=session.get('user_id')).first()
        if not user or not user.applicant:
            return make_response({
                'message': 'Need to sign in with your applicant account',
            }, 401 if not user else 403)

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

