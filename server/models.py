from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

from config import db, bcrypt

# Models go here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-_password_hash', '-employer.user',)

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    phone = db.Column(db.String)
    street_1 = db.Column(db.String)
    street_2 = db.Column(db.String)
    city = db.Column(db.String)
    state = db.Column(db.String)
    zip_code = db.Column(db.String)

    employer_id = db.Column(db.Integer, db.ForeignKey('employers.id'))

    employer = db.relationship('Employer', back_populates='user')

    def __repr__(self):
        return f'<User {self.id}, {self.username}>'
    
    @hybrid_property
    def password_hash(self):
        return self._password_hash
    
    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
    @validates('email', 'phone', 'zip_code')
    def validate(self, key, value):
        if key == 'email':
            if '@' not in value:
                raise ValueError('Server validation Error: Invalid email address')
        elif key == 'phone':
            if len(value) != 0 and (len(value) != 12 or value.find(')') != 3 or \
                value.find('-') != 7 or not value[:3].isdecimal() or 
                not value[4:7].isdecimal() or not value[-4:].isdecimal()):
                raise ValueError(f'Server validation error: Invalid {key} number')
        elif key == 'zip_code':
            if len(value) != 5 or not value.isdecimal():
                raise ValueError('Server validation error: Invalid zip code')
        return value
    
class Employer(db.Model, SerializerMixin):
    __tablename__ = 'employers'

    serialize_rules = ('-user.employer', '-job_postings.employer',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    user = db.relationship('User', uselist=False, back_populates='employer', )
    job_postings = db.relationship('JobPosting', back_populates='employer', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Employer {self.id}, {self.name}>'


class JobCategory(db.Model, SerializerMixin):
    __tablename__ = 'job_categories'

    serialze_rules = ('-job_postings.job_category',)

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String, nullable=False)
    
    job_postings = db.relationship('JobPosting', back_populates='job_category', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<JobCategory {self.id}, {self.category}>'
    
class JobPosting(db.Model, SerializerMixin):
    __tablename__ = 'job_postings'

    serialize_rules = ('-job_category.job_postings', '-employer.job_postings')

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    salary = db.Column(db.Float, nullable=False)
    job_type = db.Column(db.String) # => full,partime,contract
    remote = db.Column(db.String, nullable=False)   # => On-Site, Remote, Hybrid
    is_active = db.Column(db.Boolean, nullable=False)
    # requited skills,

    job_category_id = db.Column(db.Integer, db.ForeignKey('job_categories.id'))
    employer_id = db.Column(db.Integer, db.ForeignKey('employers.id'))

    job_category = db.relationship('JobCategory', back_populates='job_postings')
    employer = db.relationship('Employer', back_populates='job_postings')
    
    def __repr__(self):
        return f'<JobPosting {self.id} {self.title}>'

