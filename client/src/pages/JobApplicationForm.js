import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Grid, GridColumn, Form, FormField, TextArea, Button } from 'semantic-ui-react';
import { useFormik } from 'formik';

function JobApplicationForm() {
    const {id} = useParams();
    const {userAccount} = useOutletContext();
    const [jobPosting, setJobPosting] = useState(null);
    const [jobApplication, setJobApplication] = useState(null); //=> Should this be a state???

    const navigate = useNavigate();

    // RBAC
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/');
    } else {
        navigate('/signin');
    }

    useEffect(() => {
        fetch(`/jobpostings/${id}`)
        .then(r => {
            if (r.ok)
                r.json().then(data => setJobPosting(data));
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
                        job_posting_id: jobPosting.id,
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

    function dispJobPosting() {
        if (!jobPosting) 
            return null;

        return (
            // <>
            //     <h3>{jobPosting.title}</h3>
            //     <ul>
            //         <li>Company: {jobPosting.employer.name}</li>
            //         <li>Job Type: {jobPosting.job_type}</li>
            //         <li>Pay: {jobPosting.pay}/hr</li>
            //         <li>Remote: {jobPosting.remote}</li>
            //         <li>Description: <br/>
            //             {jobPosting.description}
            //         </li>
            //         <li>Address: 
            //             <p>{jobPosting.employer.user.street_1},<br/>
            //                 {jobPosting.employer.user.street_2},<br/>
            //                 {jobPosting.employer.user.city}, {jobPosting.employer.state}<br/>
            //                 {jobPosting.employer.user.zipCode}</p>
            //         </li>
            //         <li>Tel: {jobPosting.employer.user.phone}</li>
            //         <li>Email: {jobPosting.employer.user.email}</li>
            //     </ul>
            // </>
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%', padding: '10px 20px' }}>
                <div style={{ flex: '1 1 20%', width: '100%', overflow: 'auto', padding: '20px'}}>
                    <h1>{jobPosting.title}</h1>
                    <p>{jobPosting.employer.name}<br/>
                        {jobPosting.employer.user.city}, {jobPosting.employer.user.state} ({jobPosting.remote})</p>
                </div>
                <div style={{ flex: '1 1 80%', width: '100%', overflow: 'auto', padding: '20px 15px 15px 30px'}}>
                    <ul>
                        <li>Job type: {jobPosting.job_type}</li>
                        <li>Pay: {jobPosting.pay}/hr</li>
                        <li>Remote: {jobPosting.remote}</li>
                        <li>Description: <br/>
                            {jobPosting.description}
                        </li>
                        <li>Address: 
                            <p>{jobPosting.employer.user.street_1},<br/>
                                {jobPosting.employer.user.street_2},<br/>
                                {jobPosting.employer.user.city}, 
                                {jobPosting.employer.state}<br/>
                                {jobPosting.employer.user.zipCode}</p>
                        </li>
                        <li>Tel: {jobPosting.employer.user.phone}</li>
                        <li>Email: {jobPosting.employer.user.email}</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '100%' }}>
            <div style={{ flex: '1 1 40%', height: '100%', overflow: 'auto' }}>
                {dispJobPosting()}
            </div>
            <div style={{ flex: '1 1 60%', height: '100%', overflow: 'auto'}}>
                <Form style={{padding: '10px', margin: '3%'}}
                    onSubmit={formik.handleSubmit}>
                    <FormField>
                        <label htmlFor='education' style={{fontSize: '1.1em'}}>Education: </label>
                        <TextArea id='education' name='education' rows={7} value={formik.values.education} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='experience' style={{fontSize: '1.1em'}}>Experience: </label>
                        <TextArea id='experience' name='experience' rows={7} value={formik.values.experience} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='certificate' style={{fontSize: '1.1em'}}>Certificates: </label>
                        <TextArea id='certificate' name='certificate' rows={5} value={formik.values.certificate} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <Button type='submit'>Apply</Button>
                </Form>
            </div>
        </div>
    );
}

export default JobApplicationForm;