from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
import re

from config import db, bcrypt

# Models go here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = (
        '-_password_hash', 
        '-employer.user', 
        '-employer.job_postings.job_category.job_postings',
        '-employer.job_postings.employer',
        '-employer.job_postings.job_applications.job_posting',

        '-employer.job_postings.job_applications.applicant',
        # '-employer.job_postings.job_applications.applicant.user',
        # '-employer.job_postings.job_applications.applicant.job_applications',
        # '-employer.job_postings.job_applications.applicant.favorite_jobs.applicant',
        # '-employer.job_postings.job_applications.applicant.favorite_jobs.job_posting',
        # '-employer.job_postings.job_applications.applicant.job_postings',
        # '-employer.job_postings.job_applications.applicant.favorite_job_postings',

        '-employer.job_postings.favorite_jobs',
        # '-employer.job_postings.favorite_jobs.applicant.user',
        # '-employer.job_postings.favorite_jobs.applicant.job_applications.job_posting',
        # '-employer.job_postings.favorite_jobs.applicant.job_applications.applicant',
        # '-employer.job_postings.favorite_jobs.applicant.favorite_jobs',
        # '-employer.job_postings.favorite_jobs.applicant.job_postings',
        # '-employer.job_postings.favorite_jobs.applicant.favorite_job_postings',
        # '-employer.job_postings.favorite_jobs.job_posting',

        '-employer.job_postings.applicants',
        '-employer.job_postings.favorite_applicants',
        '-applicant.user',
        '-applicant.job_applications.job_posting.job_category.job_postings',
        '-applicant.job_applications.job_posting.employer.user',

        '-applicant.job_applications.job_posting.employer.job_postings',
        # '-applicant.job_applications.job_posting.employer.job_postings.job_category.job_postings',
        # '-applicant.job_applications.job_posting.employer.job_postings.employer',
        # '-applicant.job_applications.job_posting.employer.job_postings.job_applications',
        # '-applicant.job_applications.job_posting.employer.job_postings.favorite_jobs.applicant',
        # '-applicant.job_applications.job_posting.employer.job_postings.favorite_jobs.job_posting',
        # '-applicant.job_applications.job_posting.employer.job_postings.applicants',
        # '-applicant.job_applications.job_posting.employer.job_postings.favorite_applicants',

        '-applicant.job_applications.job_posting.job_applications',
        # '-applicant.job_applications.job_posting.job_applications.job_posting',
        # '-applicant.job_applications.job_posting.job_applications.applicant',

        '-applicant.job_applications.job_posting.favorite_jobs',
        # '-applicant.job_applications.job_posting.favorite_jobs.applicant',
        # '-applicant.job_applications.job_posting.favorite_jobs.job_posting',
        
        '-applicant.job_applications.job_posting.applicants',   # <= The number of applicants can be good to include.
        '-applicant.job_applications.job_posting.favorite_applicants',

        '-applicant.job_applications.applicant',
        '-applicant.favorite_jobs.applicant',
        '-applicant.favorite_jobs.job_posting.job_category.job_postings',

        '-applicant.favorite_jobs.job_posting.employer.user',
        '-applicant.favorite_jobs.job_posting.employer.job_postings',

        '-applicant.favorite_jobs.job_posting.job_applications',
        # '-applicant.favorite_jobs.job_posting.job_applications.job_posting',
        # '-applicant.favorite_jobs.job_posting.job_applications.applicant',

        '-applicant.favorite_jobs.job_posting.favorite_jobs',
        '-applicant.favorite_jobs.job_posting.applicants',
        '-applicant.favorite_jobs.job_posting.favorite_applicants',

        '-applicant.job_postings',
        '-applicant.favorite_job_postings',
    )
    
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
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'))

    employer = db.relationship('Employer', back_populates='user')
    applicant = db.relationship('Applicant', back_populates='user')

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
    
    @validates('username', 'email', 'phone', 'zip_code')
    def validate(self, key, value):
        if key == 'username':
            if len(value) < 5 or len(value) > 20:
                raise ValueError('Server validation Error: Invalid username')
        if key == 'email':
            email = r"[A-Za-z]+[A-Za-z0-9]*\.?[A-Za-z0-9]+@[A-Za-z_\-]+\.[A-Za-z]{2,3}"
            email_regex = re.compile(email)
            if not email_regex.fullmatch(value):
                raise ValueError('Server validation Error: Invalid email address')
        elif key == 'phone':
            phone_number = r"((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})"
            phone_regex = re.compile(phone_number)
            if len(value) and not phone_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid phone number')
        elif key == 'zip_code':
            zip = r'[0-9]{5}'
            zip_regex = re.compile(zip)
            if len(value) and not zip_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid zip code')
        return value


class Employer(db.Model, SerializerMixin):
    __tablename__ = 'employers'

    serialize_rules = (
        '-user.employer',

        '-user.applicant',
        # '-user.applicant.user',
        # '-user.applicant.job_applications.job_posting.job_category.job_postings',
        # '-user.applicant.job_applications.job_posting.employer',
        # '-user.applicant.job_applications.job_posting.job_applications',
        # '-user.applicant.job_applications.job_posting.favorite_jobs.applicant',
        # '-user.applicant.job_applications.job_posting.favorite_jobs.job_posting',
        # '-user.applicant.job_applications.job_posting.applicants',
        # '-user.applicant.job_applications.job_posting.favorite_applicants',
        # '-user.applicant.job_applications.applicant',
        # '-user.applicant.favorite_jobs.applicant',
        # '-user.applicant.favorite_jobs.job_posting.job_category.job_postings',
        # '-user.applicant.favorite_jobs.job_posting.employer',
        # '-user.applicant.favorite_jobs.job_posting.job_applications.job_posting',
        # '-user.applicant.favorite_jobs.job_posting.job_applications.applicant',
        # '-user.applicant.favorite_jobs.job_posting.favorite_jobs',
        # '-user.applicant.favorite_jobs.job_posting.applicants',
        # '-user.applicant.favorite_jobs.job_posting.favorite_applicants',
        # '-user.applicant.job_postings',
        # '-user.applicant.favorite_job_postings',

        '-job_postings.job_category.job_postings',
        '-job_postings.employer',
        '-job_postings.job_applications.job_posting',

        '-job_postings.job_applications.applicant',
        # '-job_postings.job_applications.applicant.user.employer',
        # '-job_postings.job_applications.applicant.user.applicant',
        # '-job_postings.job_applications.applicant.job_applications',
        # '-job_postings.job_applications.applicant.favorite_jobs.applicant',
        # '-job_postings.job_applications.applicant.favorite_jobs.job_posting',
        # '-job_postings.job_applications.applicant.job_postings',
        # '-job_postings.job_applications.applicant.favorite_job_postings',

        '-job_postings.favorite_jobs',
        # '-job_postings.favorite_jobs.applicant.user.employer',
        # '-job_postings.favorite_jobs.applicant.user.applicant',
        # '-job_postings.favorite_jobs.applicant.job_applications.job_posting',
        # '-job_postings.favorite_jobs.applicant.job_applications.applicant',
        # '-job_postings.favorite_jobs.applicant.favorite_jobs',
        # '-job_postings.favorite_jobs.applicant.job_postings',
        # '-job_postings.favorite_jobs.applicant.favorite_job_postings',
        # '-job_postings.favorite_jobs.job_posting',
        '-job_postings.applicants',
        '-job_postings.favorite_applicants',
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)

    user = db.relationship('User', uselist=False, back_populates='employer', )
    job_postings = db.relationship('JobPosting', back_populates='employer', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Employer {self.id}, {self.name}>'
    
    @validates('name')
    def validate(self, key, value):
        if key == 'name':
            if len(value) == 0:
                raise ValueError('Server validation error: No name')
        
        return value

 
class Applicant(db.Model, SerializerMixin): 
    __tablename__ = 'applicants'

    seriaize_rules = (
        '-user.employer',
        # '-user.employer.user',
        # '-user.employer.job_postings.job_category.job_postings',
        # '-user.employer.job_postings.employer',
        # '-user.employer.job_postings.job_applications.job_posting',
        # '-user.employer.job_postings.job_applications.applicant',
        # '-user.employer.job_postings.favorite_jobs.applicant',
        # '-user.employer.job_postings.favorite_jobs.job_posting',
        # '-user.employer.job_postings.applicants',
        # '-user.employer.job_postings.favorite_applicants',

        '-user.applicant',
        '-job_applications.job_posting.job_category.job_postings',

        '-job_applications.job_posting.employer',
        # '-job_applications.job_posting.employer.user.employer',
        # '-job_applications.job_posting.employer.user.applicant',
        # '-job_applications.job_posting.employer.job_postings',

        '-job_applications.job_posting.job_applications',

        '-job_applications.job_posting.favorite_jobs',
        # '-job_applications.job_posting.favorite_jobs.applicant',
        # '-job_applications.job_posting.favorite_jobs.job_posting',

        '-job_applications.job_posting.applicants',
        '-job_applications.job_posting.favorite_applicants',
        '-job_applications.applicant',
        '-favorite_jobs.applicant',
        '-favorite_jobs.job_posting.job_category.job_postings',

        '-favorite_jobs.job_posting.employer',
        # '-favorite_jobs.job_posting.employer.user.employer',
        # '-favorite_jobs.job_posting.employer.user.applicant',
        # '-favorite_jobs.job_posting.employer.job_postings',

        '-favorite_jobs.job_posting.job_applications',
        # '-favorite_jobs.job_posting.job_applications.job_posting',
        # '-favorite_jobs.job_posting.job_applications.applicant',

        '-favorite_jobs.job_posting.favorite_jobs',
        '-favorite_jobs.job_posting.applicants',
        '-favorite_jobs.job_posting.favorite_applicants',
        '-job_postings',
        '-favorite_job_postings',
    )

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    mobile = db.Column(db.String)

    user = db.relationship('User', uselist=False, back_populates='applicant')
    job_applications = db.relationship('JobApplication', back_populates='applicant', cascade='all, delete-orphan')
    favorite_jobs = db.relationship('FavoriteJob', back_populates='applicant', cascade='all, delete-orphan')

    job_postings = association_proxy('job_applications', 'job_posting',
                                     creator = lambda job_posting_obj: JobApplication(job_posting = job_posting_obj))
    favorite_job_postings = association_proxy('favorite_jobs', 'job_posting',
                                     creator = lambda job_posting_obj: FavoriteJob(job_posting=job_posting_obj))

    def __repr__(self):
        return f'<Applicant {self.id}, {self.first_name}, {self.last_name}>'
    
    @validates('first_name', 'last_name', 'mobile')
    def validate(self, key, value):
        if key == 'first_name' or key == 'last_name':
            if len(value) == 0:
                raise ValueError(f'Server validation error: No {"first name" if key == "first_name" else "last name"}')
        elif key == 'mobile':
            phone_number = r"((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})"
            phone_regex = re.compile(phone_number)
            if len(value) and not phone_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid mobile number')
        
        return value


class JobCategory(db.Model, SerializerMixin):
    __tablename__ = 'job_categories'

    # serialize_rules = ('-job_postings.job_category',)

    serialize_rules = (
        '-job_postings',
        # '-job_postings.job_category',
        # '-job_postings.employer',
        # '-job_postings.employer.user.employer',
        # '-job_postings.employer.user.applicant.user',
        # '-job_postings.employer.user.applicant.job_applications.job_posting',
        # '-job_postings.employer.user.applicant.job_applications.applicant',
        # '-job_postings.employer.user.applicant.favorite_jobs.applicant',
        # '-job_postings.employer.user.applicant.favorite_jobs.job_posting',
        # '-job_postings.employer.user.applicant.job_postings',
        # '-job_postings.employer.user.applicant.favorite_job_postings',
        # '-job_postings.employer.job_postings',
        # '-job_postings.job_applications.job_posting',
        # '-job_postings.job_applications.applicant.user.employer.user',
        # '-job_postings.job_applications.applicant.user.employer.job_postings',
        # '-job_postings.job_applications.applicant.user.applicant',
        # '-job_postings.job_applications.applicant.job_applications',
        # '-job_postings.job_applications.applicant.favorite_jobs.applicant',
        # '-job_postings.job_applications.applicant.favorite_jobs.job_posting',
        # '-job_postings.job_applications.applicant.job_postings',
        # '-job_postings.job_applications.applicant.favorite_job_postings',
        # '-job_postings.favorite_jobs.applicant.user.employer.user',
        # '-job_postings.favorite_jobs.applicant.user.employer.job_postings',
        # '-job_postings.favorite_jobs.applicant.user.applicant',
        # '-job_postings.favorite_jobs.applicant.job_applications.job_posting',
        # '-job_postings.favorite_jobs.applicant.job_applications.applicant',
        # '-job_postings.favorite_jobs.applicant.favorite_jobs.applicant',
        # '-job_postings.favorite_jobs.applicant.favorite_jobs.job_posting',
        # '-job_postings.favorite_jobs.applicant.job_postings',
        # '-job_postings.favorite_jobs.applicant.favorite_job_postings',
        # '-job_postings.favorite_jobs.job_posting',
        # '-job_postings.applicants',
        # '-job_postings.favorite_applicants',
    )

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String, nullable=False)
    
    job_postings = db.relationship('JobPosting', back_populates='job_category', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<JobCategory {self.id}, {self.category}>'



class JobPosting(db.Model, SerializerMixin):
    __tablename__ = 'job_postings'

    serialize_rules = (
        '-job_category.job_postings',
        '-employer.user.employer',

        '-employer.user.applicant',
        # '-employer.user.applicant.user',
        # '-employer.user.applicant.job_applications.job_posting',
        # '-employer.user.applicant.job_applications.applicant',
        # '-employer.user.applicant.favorite_jobs.applicant',
        # '-employer.user.applicant.favorite_jobs.job_posting',
        # '-employer.user.applicant.job_postings',
        # '-employer.user.applicant.favorite_job_postings',

        '-employer.job_postings',
        '-job_applications.job_posting',

        '-job_applications.applicant.user.employer',
        # '-job_applications.applicant.user.employer.user',
        # '-job_applications.applicant.user.employer.job_postings',

        '-job_applications.applicant.user.applicant',
        '-job_applications.applicant.job_applications',

        '-job_applications.applicant.favorite_jobs',
        # '-job_applications.applicant.favorite_jobs.applicant',
        # '-job_applications.applicant.favorite_jobs.job_posting',

        '-job_applications.applicant.job_postings',
        '-job_applications.applicant.favorite_job_postings',

        '-favorite_jobs',
        # '-favorite_jobs.applicant.user.employer.user',
        # '-favorite_jobs.applicant.user.employer.job_postings',
        # '-favorite_jobs.applicant.user.applicant',
        # '-favorite_jobs.applicant.job_applications.job_posting',
        # '-favorite_jobs.applicant.job_applications.applicant',
        # '-favorite_jobs.applicant.favorite_jobs',
        # '-favorite_jobs.applicant.job_postings',
        # '-favorite_jobs.applicant.favorite_job_postings',
        # '-favorite_jobs.job_posting',

        '-applicants',
        '-favorite_applicants',
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    pay = db.Column(db.Float, nullable=False)
    job_type = db.Column(db.String) # => 'Part time', 'Contract', 'Full time'
    remote = db.Column(db.String, nullable=False)   # => 'On-Site', 'Remote', 'Hybrid'
    status = db.Column(db.String, nullable=False)  # => open, review, close
    # requited skills,

    job_category_id = db.Column(db.Integer, db.ForeignKey('job_categories.id'))
    employer_id = db.Column(db.Integer, db.ForeignKey('employers.id'))

    job_category = db.relationship('JobCategory', back_populates='job_postings')
    employer = db.relationship('Employer', back_populates='job_postings')
    job_applications = db.relationship('JobApplication', back_populates='job_posting', cascade='all, delete-orphan')
    favorite_jobs = db.relationship('FavoriteJob', back_populates='job_posting', cascade='all, delete-orphan')

    applicants = association_proxy('job_applications', 'applicant', 
                                   creator = lambda applicant_obj: JobApplication(applicant=applicant_obj))
    favorite_applicants = association_proxy('favorite_jobs', 'applicant',
                                            creator = lambda applicant_obj: FavoriteJob(applicant=applicant_obj))
    
    def __repr__(self):
        return f'<JobPosting {self.id} {self.title}>'
    
    @validates('title', 'description', 'pay', 'job_type', 'remote', 'status')
    def validate(self, key, value):
        if key == 'title':
            if len(value) == 0:
                raise ValueError('Server validation error: No title')
        elif key == 'description':
            if len(value) == 0: 
                raise ValueError('Server validation error: No description')
        elif key == 'pay':
            if value <= 0:
                raise ValueError('Server validation error: Invalid pay')
        elif key == 'job_type':
            if value not in ['Part time', 'Contract', 'Full time']:
                raise ValueError('Server validation error: Invalid job type')
        elif key == 'remote':
            if value not in ['On-Site', 'Remote', 'Hybrid']:
                raise ValueError('Server validation error: Invalid remote')
        elif key == 'status':
            if value not in ['open', 'review', 'close']:
                raise ValueError('Server validation error: Invalid status')

        return value

    
class JobApplication(db.Model, SerializerMixin): 
    __tablename__ = 'job_applications'

    serialize_rules = (
        '-job_posting.job_category.job_postings',
        '-job_posting.employer.user.employer',

        '-job_posting.employer.user.applicant',
        # '-job_posting.employer.user.applicant.user',
        # '-job_posting.employer.user.applicant.job_applications',
        # '-job_posting.employer.user.applicant.favorite_jobs.applicant',
        # '-job_posting.employer.user.applicant.favorite_jobs.job_posting',
        # '-job_posting.employer.user.applicant.job_postings',
        # '-job_posting.employer.user.applicant.favorite_job_postings',

        '-job_posting.employer.job_postings',
        '-job_posting.job_applications',

        '-job_posting.favorite_jobs',
        # '-job_posting.favorite_jobs.applicant.user.employer.user',
        # '-job_posting.favorite_jobs.applicant.user.employer.job_postings',
        # '-job_posting.favorite_jobs.applicant.user.applicant',
        # '-job_posting.favorite_jobs.applicant.job_applications',
        # '-job_posting.favorite_jobs.applicant.favorite_jobs',
        # '-job_posting.favorite_jobs.applicant.job_postings',
        # '-job_posting.favorite_jobs.applicant.favorite_job_postings',
        # '-job_posting.favorite_jobs.job_posting',

        '-job_posting.applicants',
        '-job_posting.favorite_applicants',

        '-applicant.user.employer',
        # '-applicant.user.employer.user',
        # '-applicant.user.employer.job_postings.job_category.job_postings',
        # '-applicant.user.employer.job_postings.employer',
        # '-applicant.user.employer.job_postings.job_applications',
        # '-applicant.user.employer.job_postings.favorite_jobs.applicant',
        # '-applicant.user.employer.job_postings.favorite_jobs.job_posting',
        # '-applicant.user.employer.job_postings.applicants',
        # '-applicant.user.employer.job_postings.favorite_applicants',

        '-applicant.user.applicant',
        '-applicant.job_applications',

        '-applicant.favorite_jobs',
        # '-applicant.favorite_jobs.applicant',
        # '-applicant.favorite_jobs.job_posting.job_category.job_postings',
        # '-applicant.favorite_jobs.job_posting.employer.user.employer',
        # '-applicant.favorite_jobs.job_posting.employer.user.applicant',
        # '-applicant.favorite_jobs.job_posting.employer.job_postings',
        # '-applicant.favorite_jobs.job_posting.job_applications',
        # '-applicant.favorite_jobs.job_posting.favorite_jobs',
        # '-applicant.favorite_jobs.job_posting.applicants',
        # '-applicant.favorite_jobs.job_posting.favorite_applicants',
        '-applicant.job_postings',
        '-applicant.favorite_job_postings',
    )

    id = db.Column(db.Integer, primary_key=True)
    education = db.Column(db.String)
    experience = db.Column(db.String)
    certificate = db.Column(db.String)
    status = db.Column(db.String, nullable=False)   # => new, hired, declined

    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'))
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'))

    job_posting = db.relationship('JobPosting', back_populates='job_applications')
    applicant = db.relationship('Applicant', back_populates='job_applications')

    def __repr__(self):
        return f'<JobApplication {self.id}>'
    
    @validates('status')
    def validate(self, key, value):
        if key == 'status':
            if value not in ['new', 'hired', 'declined']:
                raise ValueError('Server validation error: Invalid status')
        return value
    
class FavoriteJob(db.Model, SerializerMixin): 
    __tablename__ = 'favorite_jobs'

    serialize_rules = (
        '-applicant.user.employer',
        # '-applicant.user.employer.user',
        # '-applicant.user.employer.job_postings.job_category.job_postings',
        # '-applicant.user.employer.job_postings.employer',
        # '-applicant.user.employer.job_postings.job_applications.job_posting',
        # '-applicant.user.employer.job_postings.job_applications.applicant',
        # '-applicant.user.employer.job_postings.favorite_jobs',
        # '-applicant.user.employer.job_postings.applicants',
        # '-applicant.user.employer.job_postings.favorite_applicants',

        '-applicant.user.applicant',

        '-applicant.job_applications',
        # '-applicant.job_applications.job_posting.job_category.job_postings',
        # '-applicant.job_applications.job_posting.employer.employer.',
        # '-applicant.job_applications.job_posting.employer.user.applicant',
        # '-applicant.job_applications.job_posting.employer.job_postings',
        # '-applicant.job_applications.job_posting.job_applications',
        # '-applicant.job_applications.job_posting.favorite_jobs',
        # '-applicant.job_applications.job_posting.applicants',
        # '-applicant.job_applications.job_posting.favorite_applicants',
        # '-applicant.job_applications.applicant',
        '-applicant.favorite_jobs',
        '-applicant.job_postings',
        '-applicant.favorite_job_postings',
        '-job_posting.job_category.job_postings',
        '-job_posting.employer.user.employer',

        '-job_posting.employer.user.applicant',
        # '-job_posting.employer.user.applicant.user',
        # '-job_posting.employer.user.applicant.job_applications.job_posting',
        # '-job_posting.employer.user.applicant.job_applications.applicant',
        # '-job_posting.employer.user.applicant.favorite_jobs',
        # '-job_posting.employer.user.applicant.job_postings',
        # '-job_posting.employer.user.applicant.favorite_job_postings',

        '-job_posting.employer.job_postings',

        '-job_posting.job_applications',
        # '-job_posting.job_applications.job_posting',
        # '-job_posting.job_applications.applicant.user.employer.user',
        # '-job_posting.job_applications.applicant.user.employer.job_postings',
        # '-job_posting.job_applications.applicant.user.applicant',
        # '-job_posting.job_applications.applicant.job_applications',

        '-job_posting.favorite_jobs',
        '-job_posting.applicants',
        '-job_posting.favorite_applicants',
    )

    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'))
    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'))

    applicant = db.relationship('Applicant', back_populates='favorite_jobs')
    job_posting = db.relationship('JobPosting', back_populates='favorite_jobs')

    def __repr__(self):
        return f'<FavoriteJob {self.id}>'
