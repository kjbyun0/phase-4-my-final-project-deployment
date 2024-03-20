from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
# from sqlalchemy.orm import validates

from config import db, bcrypt

# Models go here!
class User(db.Model, SerializerMixin):
    __table_name__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)     # => Validation needed???
    _password_hash = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)    # => Validation needed
    mobile = db.Column(db.String, nullable=False)       # => Validation needed
    # address = db.Column(db.String)

    def __repr__(self):
        return f'<User {self.id}, {self.user_id}>'
    
    @hybrid_property
    def password_hash(self):
        return self._password_hash
    
    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
    # @validates('email', 'mobile')
