#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, session, make_response
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User

app.secret_key = b'>\x87\x1fJ\xb80\xd6v\xb5\x9d\x8e\x80u\xc2\x1bp'

# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

class Authenticate(Resource):
    # login
    def post(self):
        login_dict = request.get_json()
        user = User.query.filter_by(username=login_dict.get('username')).first()
        if user:
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
        new_user = User(
            username=account_req_dict.get('username'),
            password_hash=account_req_dict.get('password'),
            name=account_req_dict.get('name'),
            email=account_req_dict.get('email'),
            mobile=account_req_dict.get('mobile')
        )
        db.session.add(new_user)
        db.session.commit()

        session['user_id'] = new_user.id
        return make_response(new_user.to_dict(), 201)

api.add_resource(Authenticate, '/authenticate')
api.add_resource(Signup, '/signup')


if __name__ == '__main__':
    app.run(port=5555, debug=True)

