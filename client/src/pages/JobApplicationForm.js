import { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Form, FormField, TextArea, Button } from 'semantic-ui-react';
import { useFormik } from 'formik';

function JobApplicationForm() {
    const param = useParams();
    const id = parseInt(param.id);
    const {userR, appJobAppsR, onSetAppJobAppsR} = useOutletContext();
    const [jobPosting, setJobPosting] = useState(null);
    const [jobApplication, setJobApplication] = useState(null);

    const navigate = useNavigate();
    useEffect(() => {
        if (userR && userR.employer)
            navigate('/signin');
    }, [userR]);

    useEffect(() => {
        fetch(`/jobpostings/${id}`)
        .then(r => {
            r.json().then(data => {
                if (r.ok) {
                    setJobPosting(data);
                    const app = appJobAppsR.find(app => app.job_posting_id === id);
                    if (app) {
                        setJobApplication(app);
                        formik.setFieldValue('education', app.education);
                        formik.setFieldValue('experience', app.experience);
                        formik.setFieldValue('certificate', app.certificate);
                    }
                } else {
                    console.log('Server Error - Fetching Job Posting: ', data);
                    alert(`Server Error - Fetching Job Posting: ${data.message}`);
                    navigate('/');
                }
            });
        });
    }, []);

    const formik = useFormik({
        initialValues: {
            education: '',
            experience: '',
            certificate: '',
        },
        onSubmit: (values) => {
            if (jobApplication) {
                fetch(`/jobapplications/${jobApplication.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...values,
                    }),
                })
                .then(r => {
                    r.json().then(data => {
                        if (r.ok) {
                            onSetAppJobAppsR(appJobAppsR.map(app => app.id === data.id ? data : app));
                            navigate('/');
                        } else if (r.status === 401 || r.status === 403) {
                            console.log(data);
                            alert(data.message);
                        } else {
                            console.log('Server Error - Updating Job Application: ', data);
                            alert(`Server Error - Updating Job Application: ${data.message}`);
                        }
                    });
                });
            } else {
                fetch('/jobapplications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...values,
                        status: 'new',
                        job_posting_id: jobPosting.id,
                        applicant_id: userR.applicant_id,
                    }),
                })
                .then(r => {
                    r.json().then(data => {
                        if (r.ok) {
                            onSetAppJobAppsR([
                                ...appJobAppsR,
                                data
                            ]);
                            navigate('/');
                        } else if (r.status === 401 || r.status === 403) {
                            console.log(data);
                            alert(data.message);
                        } else {
                            console.log('Server Error - New Job Application: ', data);
                            alert(`Server Error - New Job Application: ${data.message}`);
                        }
                    });
                });
            }
        },
    });

    function dispJobPosting() {
        if (!jobPosting) 
            return null;

        return (
            <div style={{display: 'grid', width: '100%', height: '100%', 
                gridTemplateRows: 'max-content 1fr', padding: '10px', }}>
                <div style={{overflow: 'auto', padding: '20px', 
                    border: '1px solid lightgray', borderRadius: '10px', }}>
                    <h1>{jobPosting.title}</h1>
                    <p>{jobPosting.employer.name}<br/>
                        {jobPosting.employer.user.city}, {jobPosting.employer.user.state} ({jobPosting.remote})</p>
                </div>
                <div style={{overflow: 'auto', padding: '20px 15px 15px 30px', }}>
                    <ul>
                        <li style={{fontWeight: 'bold', }}>Job type: 
                            <span style={{fontWeight: 'normal', }}>&nbsp;{jobPosting.job_type}</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Pay: 
                            <span style={{fontWeight: 'normal', }}>&nbsp;${jobPosting.pay}/hr</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Remote:
                            <span style={{fontWeight: 'normal', }}>&nbsp;{jobPosting.remote}</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Description:</li>
                        <div style={{whiteSpace: 'pre', }}>{jobPosting.description}</div>
                        <li style={{fontWeight: 'bold', }}>Address:</li>
                        <div>{jobPosting.employer.user.street_1},<br/>
                            {jobPosting.employer.user.street_2},<br/>
                            {jobPosting.employer.user.city},&nbsp;
                            {jobPosting.employer.user.state}&nbsp;
                            {jobPosting.employer.user.zipCode}
                        </div>
                        <li style={{fontWeight: 'bold', }}>Tel:
                            <span style={{fontWeight: 'normal', }}>&nbsp;{jobPosting.employer.user.phone}</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Email:
                            <span style={{fontWeight: 'normal', }}>&nbsp;{jobPosting.employer.user.email}</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '10% 35% 45% 10%', }}>
            <div style={{background: 'lightgray', }} />
            <div style={{minWidth: '0', minHeight: '0', }}>
                {dispJobPosting()}
            </div>
            <div style={{padding: '5%', top: '5%', overflow: 'auto', }}>
                <Form onSubmit={formik.handleSubmit}>
                    <FormField>
                        <label htmlFor='education' style={{fontSize: '1.1em'}}>Education: </label>
                        <TextArea id='education' name='education' rows={10} value={formik.values.education} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='experience' style={{fontSize: '1.1em'}}>Experience: </label>
                        <TextArea id='experience' name='experience' rows={10} value={formik.values.experience} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <FormField>
                        <label htmlFor='certificate' style={{fontSize: '1.1em'}}>Certificates: </label>
                        <TextArea id='certificate' name='certificate' rows={7} value={formik.values.certificate} 
                            onChange={formik.handleChange} />
                    </FormField>
                    <Button type='submit' color='blue' style={{width: '28%', margin: '0 36%'}}>Apply</Button>
                </Form>
            </div>
            <div style={{background: 'lightgray', }} />
        </div>
    );
}

export default JobApplicationForm;
