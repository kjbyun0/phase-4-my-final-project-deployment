import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Grid, GridColumn, Form, FormField, TextArea, Button } from 'semantic-ui-react';
import { useFormik } from 'formik';

function JobApplicationForm() {
    const {id} = useParams();
    const {userAccount} = useOutletContext();
    const [jobPost, setJobPost] = useState(null);
    const [jobApplication, setJobApplication] = useState(null); //=> Should this be a state???

    const navigate = useNavigate();

    // RBAC
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/');
    } else 
        navigate('/signin')

    useEffect(() => {
        fetch(`/jobpostings/${id}`)
        .then(r => {
            if (r.ok)
                r.json().then(data => setJobPost(data));
            else {
                console.log(`Error: Can't find the job posting id: ${id}, r:`, r);
                navigate('/');
            }
        });

        fetch(`/jobapplication/${id}`)
        .then(r => {
            if (r.ok)
                r.json().then(data => {
                    setJobApplication(data);
                    formik.setFieldValue('education', data.education);
                    formik.setFieldValue('experience', data.experience);
                    formik.setFieldValue('certificate', data.certificate);
                })
            else {
                console.log("in JobApplicationForm, First time applying for this job.");
                // => Error Handling needed....
                switch(r.status) {
                    case 404:
                        console.log('in JobApplicationForm, New Application.');
                        break;
                    case 403:
                        console.log("in JobApplicationForm, the user is an employer, Can't apply for a job.");
                        break;
                    case 401:
                        console.log("in JobApplicationForm, the user hasn't loged in yet. Please, sign in first.");
                        break;
                }
            }
        })
    }, []);

    const formik = useFormik({
        initialValues: {
            education: '',
            experience: '',
            certificate: '',
        },
        onSubmit: (values) => {
            let jobAppPromise;
            if (jobApplication) {
                jobAppPromise = fetch(`/jobapplication/${jobApplication.job_posting_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...values,
                        job_posting_id: jobApplication.job_posting_id,
                    }),
                });
            } else {
                jobAppPromise = fetch('/jobapplications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...values,
                        status: 'new',
                        job_posting_id: jobPost.id,
                        // applicant_id: userAccount.applicant_id, // => the user must be an applicant, not an employer... RBAC's role.
                    }),
                });
            }
            jobAppPromise.then(r => {
                if (r.ok) {
                    navigate('/')
                } else {
                    // => Error Handling needed....
                    switch(r.status) {
                        case 404:
                            console.log('in JobApplicationForm, New Application.');
                            break;
                        case 403:
                            console.log("in JobApplicationForm, the user is an employer, Can't apply for a job.");
                            break;
                        case 401:
                            console.log("in JobApplicationForm, the user hasn't loged in yet. Please, sign in first.");
                            break;
                    }
                }
            })
        },
    });


    function dispJobPost() {
        if (!jobPost) 
            return null;

        return (
            <>
                <h3>{jobPost.title}</h3>
                <ul>
                    <li>Company: {jobPost.employer.name}</li>
                    <li>Job Type: {jobPost.job_type}</li>
                    <li>Pay: {jobPost.salary}/hr</li>
                    <li>Remote: {jobPost.remote}</li>
                    <li>Description: <br/>
                        {jobPost.description}
                    </li>
                    <li>Address: 
                        <p>{jobPost.employer.user.street_1},<br/>
                            {jobPost.employer.user.street_2},<br/>
                            {jobPost.employer.user.city}, {jobPost.employer.state}<br/>
                            {jobPost.employer.user.zipCode}</p>
                    </li>
                    <li>Tel: {jobPost.employer.user.phone}</li>
                    <li>Email: {jobPost.employer.user.email}</li>
                </ul>
            </>
        );
    }

    return (
        <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '100%' }}>
            <div style={{ flex: '1 1 40%', height: '100%', overflow: 'auto' }}>
                {dispJobPost()}
            </div>
            <div style={{ flex: '1 1 60%', height: '100%', overflow: 'auto'}}>
                <Form onSubmit={formik.handleSubmit}>
                    <FormField>
                        <label htmlFor='education'>Education: </label>
                        <TextArea id='education' name='education' rows={3} value={formik.values.education} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='experience'>Experience: </label>
                        <TextArea id='experience' name='experience' rows={5} value={formik.values.experience} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='certificate'>Certificates: </label>
                        <TextArea id='certificate' name='certificate' rows={3} value={formik.values.certificate} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <Button type='submit'>Apply</Button>
                </Form>
            </div>
        </div>
    );
}

export default JobApplicationForm;