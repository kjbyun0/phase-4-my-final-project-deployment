import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Form, FormField, Input, Dropdown, TextArea, Button } from 'semantic-ui-react';

function JobPostingForm() {
    const [ categories, setCagetories ] = useState([]);
    const { userR, empJobPostingsR, onSetEmpJobPostingsR } = useOutletContext();

    const navigate = useNavigate();
    useEffect(() => {
        if (userR && userR.applicant)
            navigate('/signin');
    }, [userR]);

    useEffect(() => {
        fetch('/jobcategories')
        .then(r => r.json())
        .then(data => {
            setCagetories(data)
            formik.setFieldValue('category', data.length ? data[0].category : '');
        });
    }, []);

    const formSchema = yup.object().shape({
        title: yup.string().required("Must enter a title"),
        pay: yup.number().positive('Must be a positive number'),
        description: yup.string().required('Must enter a job description'),
    });

    const formik = useFormik({
        initialValues: {
            title: '',
            category: '',
            description: '',
            pay: 0.0,
            job_type: 'Full time',
            remote: 'On-Site',
            status: 'open',
        },
        validationSchema: formSchema,
        onSubmit: (values) => {
            fetch('/jobpostings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            })
            .then(r => {
                r.json().then(data => {
                    if (r.ok) {
                        onSetEmpJobPostingsR([
                            ...empJobPostingsR,
                            data,
                        ]);
                        navigate('/');
                    } else if (r.status === 401 || r.status === 403) {
                        console.log(data);
                        alert(data.message);
                    } else {
                        console.log('Server Error - New Job Posting: ', data);
                        alert(`Server Error - New Job Posting: ${data.message}`);
                    }
                });
            });
        },
    });

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', gridTemplateColumns: '10% 1fr 10%', }} >
            <div style={{background: 'lightgray', }} />
            <div style={{padding: '5%', top: '5%', overflow: 'auto', }}>
                <Form onSubmit={formik.handleSubmit}>
                    <FormField inline>
                        <label style={{fontSize: '1.1em'}}>Job Title:</label>
                        <Input id='title' name='title' type='text' style={{width: '80%'}} value={formik.values.title}
                            onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.title && formik.touched.title && <div style={{ color: 'red', }}>{formik.errors.title}</div>}
                    </FormField>
                    <FormField inline>
                        <label style={{fontSize: '1.1em', margin: '0 15px 0 0', }}>Job Category:</label>
                        <Dropdown selection search value={formik.values.category} 
                            onChange={(e, selVal) => formik.setFieldValue('category', selVal.value)}  
                            options={categories.map(category => ({
                                key: category.id, 
                                value: category.category, 
                                text: category.category,
                            }))} 
                        />
                    </FormField>
                    <FormField inline>
                        <label style={{fontSize: '1.1em'}}>Pay:</label>
                        <Input id='pay' name='pay' type='number' value={formik.values.pay} 
                            onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        <label style={{fontSize: '1.1em'}}>&nbsp;&nbsp;/hr</label>
                        {formik.errors.pay && formik.touched.pay && <div style={{ color: 'red', }}>{formik.errors.pay}</div>}
                    </FormField>
                    <FormField inline>
                        <label style={{fontSize: '1.1em'}}>Job Type:</label>
                        <Dropdown selection value={formik.values.job_type} 
                            onChange={(e, selVal) => formik.setFieldValue('job_type', selVal.value)}
                            options={[
                                {key: 'f', value: 'Full time', text: 'Full time'}, 
                                {key: 'p', value: 'Part time', text: 'Part time'}, 
                                {key: 'c', value: 'Contract', text: 'Contract'}, 
                            ]} 
                        />
                    </FormField>
                    <FormField inline>
                        <label style={{fontSize: '1.1em'}}>Remote:</label>
                        <Dropdown selection value={formik.values.remote}
                            onChange={(e, selVal) => formik.setFieldValue('remote', selVal.value)} 
                            options={[
                                {key: 'o', value: 'On-Site', text: 'On-Site'}, 
                                {key: 'r', value: 'Remote', text: 'Remote'}, 
                                {key: 'h', value: 'Hybrid', text: 'Hybrid'},
                            ]} 
                        />
                    </FormField>
                    <FormField inline>
                        <label style={{fontSize: '1.1em'}}>Description:</label>
                        <TextArea id='description' name='description' rows='20'  
                            value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.description && formik.touched.description && <div style={{color: 'red', }}>{formik.errors.description}</div>}
                    </FormField>
                    <Button type='submit' size='big' color='orange' style={{margin: '0 40%', width: '20%', }} >Post it</Button>
                </Form>
            </div>
            <div style={{background: 'lightgray', }} />
        </div>
    );
}

export default JobPostingForm;