from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

from config import db, bcrypt

# Models go here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-_password_hash', 
                       '-employer.user', '-employer.job_postings', 
                       '-applicant.user', '-applicant.job_applications', '-applicant.favorite_jobs',)

    # serialize_rules = (
    #     "-_password_hash",
    #     "-employer.user",
    #     "-employer.job_postings.job_category",
    #     "-employer.job_postings.employer",
    #     "-employer.job_postings.job_applications",
    #     "-employer.job_postings.favorite_jobs",
    #     "-employer.job_postings.applicants",
    #     "-employer.job_postings.favorite_applicants",
    #     "-applicant.user",
    #     "-applicant.job_applications",
    #     "-applicant.favorite_jobs.applicant",
    #     "-applicant.favorite_jobs.job_posting",
    #     "-applicant.job_postings.job_category",
    #     "-applicant.job_postings.employer",
    #     "-applicant.job_postings.job_applications",
    #     "-applicant.job_postings.favorite_jobs",
    #     "-applicant.job_postings.applicants",
    #     "-applicant.job_postings.favorite_applicants",
    #     "-applicant.favorite_job_postings",
    # )

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
    
class Applicant(db.Model, SerializerMixin): 
    __tablename__ = 'applicants'
    
    serialize_rules = ('-user.applicant', '-job_applications.applicant', '-favorite_jobs.applicant',)

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
    
    @validates('mobile')
    def validate(self, key, value):
        if key == 'mobile':
            if len(value) != 0 and (len(value) != 12 or value.find(')') != 3 or \
                value.find('-') != 7 or not value[:3].isdecimal() or 
                not value[4:7].isdecimal() or not value[-4:].isdecimal()):
                raise ValueError(f'Server validation error: Invalid {key} number')
        
        return value

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

    serialize_rules = ('-job_category.job_postings', 
                       '-employer.job_postings', 
                       '-job_appliacations.job_posting', '-job_applications.applicant', 
                       '-favorite_jobs.job_posting', '-favorite_jobs.applicant',)

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    pay = db.Column(db.Float, nullable=False)
    job_type = db.Column(db.String) # => full,partime,contract
    remote = db.Column(db.String, nullable=False)   # => On-Site, Remote, Hybrid
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
    
class JobApplication(db.Model, SerializerMixin): 
    __tablename__ = 'job_applications'

    # serialize_rules = ('-job_posting.job_applications', '-job_posting.favorite_jobs'
    #                    '-applicant.job_applications', '-applicant.favorite_jobs',)
    serialize_rules = ('-job_posting.job_applications', '-applicant.job_applications', )

    id = db.Column(db.Integer, primary_key=True)
    education = db.Column(db.String)
    experience = db.Column(db.String)
    certificate = db.Column(db.String)
    # => consider adding a column for more things to talk abut...
    status = db.Column(db.String, nullable=False)   # => new, hired, declined

    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'))
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'))

    job_posting = db.relationship('JobPosting', back_populates='job_applications')
    applicant = db.relationship('Applicant', back_populates='job_applications')

    def __repr__(self):
        return f'<JobApplication {self.id}>'
    
class FavoriteJob(db.Model, SerializerMixin): 
    __tablename__ = 'favorite_jobs'

    serialize_rules = ('-applicant.favorite_jobs', '-job_posting.favorite_jobs',)

    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicants.id'))
    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'))

    applicant = db.relationship('Applicant', back_populates='favorite_jobs')
    job_posting = db.relationship('JobPosting', back_populates='favorite_jobs')

    def __repr__(self):
        return f'<FavoriteJob {self.id}>'
