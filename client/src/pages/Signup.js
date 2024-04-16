import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Form, FormField, Label, Input, Button, Checkbox, 
    Modal, ModalContent, ModalActions } from 'semantic-ui-react';

function Signup() {
    const navigate = useNavigate();
    const { onSetUserAccount } = useOutletContext();
    const [ isEmployer, setIsEmployer ] = useState(false);

    const formSchema = yup.object().shape({
        name: isEmployer ? yup.string().required('Must enter a name') : '',
        firstName: isEmployer ? '' : yup.string().required('Must enter a first name'),
        lastName: isEmployer ? '' : yup.string().required('Must enter a last name'),
        username: yup.string().required('Must enter a username')
                    .min(5, 'Must be between 5 and 20 characters')
                    .max(20, 'Must be between 5 and 20 characters'),
        // => add more constraints later. think about making custom constraints
        password: yup.string().required('Must enter a password'),
        email: yup.string().required('Must enter your email').email('Invalid email format'),
        mobile: isEmployer ? '' : yup.string(),
        // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
        // phoneNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
        phone: yup.string(),
        // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
        // phoneNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
    });

    const formik = useFormik({
        initialValues: {
            isEmployer: isEmployer,
            name: '',
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            email: '',
            mobile: '',
            phone: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zipCode: '',
        },
        validationSchema: formSchema,
        onSubmit: (values) => {
            console.log('values: ', values);
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values)
            })
            .then(r => {
                if (r.ok) {
                    console.log('new account created: ');
                    r.json().then(data => onSetUserAccount(data));
                    
                    navigate('/');
                } else {
                    // => add a funciton to display errors and enable submit button.
                    r.json().then(data => console.log('New Account Server Error: ', data))
                }
            });
        },
    });

    function handleEmployerCheckChange(bEmployer) {
        setIsEmployer(!bEmployer);
        formik.setFieldValue('isEmployer', !bEmployer);
    }

    // console.log('formSchema: ', formSchema);
    // console.log('formik: ', formik);

    return (
        <div style={{width: '100%', height: '100%', overflow: 'auto', }}>
            <Form style={{width: '400px', margin: 'auto', position: 'relative', top: '10px', }} 
                onSubmit={formik.handleSubmit}>
                <Checkbox label='Are you an employer?' 
                    style={{ width: '100%', marginTop: '10px'}} 
                    checked={isEmployer} onChange={() => handleEmployerCheckChange(isEmployer)}/>
                {
                    isEmployer ?
                    <>
                        <Input id='name' name='name' type='text' placeholder='Name' 
                            style={{width: '100%', marginTop: '10px'}}
                            value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.name && formik.touched.name && <div style={{ color: 'red'}}>{formik.errors.name}</div>}
                    </> : 
                    <>
                        <Input id='firstName' name='firstName' type='text' placeholder='First name' 
                            style={{width: '100%', marginTop: '10px'}}
                            value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.firstName && formik.touched.firstName && <div style={{ color: 'red' }}>{formik.errors.firstName}</div>}
                        <Input id='lastName' name='lastName' type='text' placeholder='Last name' 
                            style={{width: '100%', marginTop: '10px'}}
                            value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.lastName && formik.touched.lastName && <div style={{ color: 'red' }}>{formik.errors.lastName}</div>}
                    </>
                }
                <Input id='username' name='username' type='text' placeholder='Username'
                    style={{width: '100%', marginTop: '10px'}}
                    value={formik.values.username} onChange={formik.handleChange} />
                {formik.errors.username && formik.touched.username && <div style={{ color: 'red'}}>{formik.errors.username}</div>}
                <Input id='password' name='password' type='password' placeholder='Password'
                    style={{width: '100%', marginTop: '10px'}}
                    value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.errors.password && formik.touched.password && <div style={{ color: 'red'}}>{formik.errors.password}</div>}
                <Input id='email' name='email' type='email' placeholder='Email'
                    style={{width: '100%', marginTop: '10px'}}
                    value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.errors.email && formik.touched.email && <div style={{ color: 'red'}}>{formik.errors.email}</div>}
                {
                    isEmployer ? 
                    null : 
                    <>
                        <Input id='mobile' name='mobile' type='tel' placeholder='Mobile number '
                            style={{width: '100%', marginTop: '10px'}}
                            value={formik.values.mobile} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {formik.errors.mobile && formik.touched.mobile && <div style={{ color: 'red'}}>{formik.errors.mobile}</div>}
                    </>
                }
                <Input id='phone' name='phone' type='tel' placeholder='Phone number' 
                    style={{width: '100%', marginTop: '10px'}}
                    value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                {formik.errors.phone && formik.touched.phone && <div style={{ color: 'red'}}>{formik.errors.phone}</div>}

                <Input id='street1' name='street1' type='text' placeholder='Street 1' 
                    style={{width: '100%', marginTop: '5px'}}
                    value={formik.values.street1} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                <Input id='street2' name='street2' type='text' placeholder='Street 2' 
                    style={{width: '100%', marginTop: '5px'}}
                    value={formik.values.street2} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                <Input id='city' name='city' type='text' placeholder='City' 
                    style={{width: '100%', marginTop: '5px'}}
                    value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                <Input id='state' name='state' type='text' placeholder='State' 
                    style={{width: '100%', marginTop: '5px'}}
                    value={formik.values.state} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                <Input id='zipCode' name='zipCode' type='text' placeholder='Zip Code' 
                    style={{width: '100%', marginTop: '5px'}}
                    value={formik.values.zipCode} onChange={formik.handleChange} onBlur={formik.handleBlur} />

                <Button type='submit' size='big' color='green' style={{ width: "40%", margin: '20px 120px 20px' }}>Sign up</Button>
            </Form>
        </div>
    );
}

export default Signup;