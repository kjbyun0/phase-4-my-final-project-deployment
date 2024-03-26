import { Formik } from 'formik';
import { useOutletContext } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Form, FormField, Input } from 'semantic-ui-react';

function JobCreation() {
    const { signInAccount, onSetSignInAccount } = useOutletContext();


    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            salary: 0.0,
            job_type: '',
            remote: '',
            isActive: '',
        },
        validationSchema: formSchema,
        onSubmit: (values) => {
            fetch('/jobopenings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify()
            })
            .then()
        },
    });

    return (
        <Form>
            <FormField inline>
                <label>Job Title:</label>
                <Input id='title' name='title' type='text' value={Formik.values.title}
                    onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
        </Form>

    );
}

// id = db.Column(db.Integer, primary_key=True)
// title = db.Column(db.String, nullable=False)
// description = db.Column(db.String)
// salary = db.Column(db.Float, nullable=False)
// job_type = db.Column(db.String) # => full,partime,contract
// location = db.Column(db.String, nullable=False) 
// remote = db.Column(db.String, nullable=False)   # => On Site, Remote, Hybrid
// isActive = db.Column(db.Boolean, nullable=False)

// # skills,

// job_category_id = db.Column(db.Integer, db.ForeignKey('job_categories.id'))
// employer_id = db.Column(db.Integer, db.ForeignKey('users.id'))

// job_category = db.relationship('JobCategory', back_populates='job_openings')
// employer = db.relationship('User', back_populates='job_openings')