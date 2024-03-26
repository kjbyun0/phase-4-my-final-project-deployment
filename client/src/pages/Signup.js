import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Form, FormField, Label, Input, Button } from 'semantic-ui-react';

function Signup() {
    const navigate = useNavigate();
    const { onSetSignInAccount } = useOutletContext();

    const formSchema = yup.object().shape({
        name: yup.string().required('Must enter a name'),
        username: yup.string().required('Must enter a username')
                    .min(5, 'Must be between 5 and 50 characters')
                    .max(20, 'Must be between 5 and 50 characters'),
        // => add more constraints later. think about making custom constraints
        password: yup.string().required('Must enter a password'),
        email: yup.string().required('Must enter your email').email('Invalid email format'),
        // mobile: yup.string(),
        // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
        // phoneNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
        phone: yup.string(),
        // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
        // phoneNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
    });

    const formik = useFormik({
        initialValues: {
            // isEmployer: false,
            name: '',
            // firstName: '',
            // lastName: '',
            username: '',
            password: '',
            email: '',
            // mobile: '',
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
                    r.json().then(data => onSetSignInAccount(data));
                    
                    navigate('/');
                } else {
                    // => add a funciton to display errors and enable submit button.
                    r.json().then(data => console.log('New Account Server Error: ', data))
                }
            });
        },
    });

    // console.log('formik: ', formik);

    return (
        <Form onSubmit={formik.handleSubmit}>
            <FormField>
            <Label htmlFor='name'>Name:</Label>
            <Input id='name' name='name' type='text' value={formik.values.name} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.name ? formik.errors.name : null}</p>
            </FormField>
            <FormField>
            <Label htmlFor='username'>Username:</Label>
            <Input id='username' name='username' type='text' value={formik.values.username} 
                onChange={formik.handleChange} />
            <p style={{ color: 'red'}}>{formik.touched.username ? formik.errors.username : null}</p>
            </FormField>
            <FormField>
            <Label htmlFor='password'>Password:</Label>
            <Input id='password' name='password' type='password' value={formik.values.password} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.password ? formik.errors.password : null}</p>
            </FormField>
            <FormField>
            <Label htmlFor='email'>Email:</Label>
            <Input id='email' name='email' type='email' value={formik.values.email} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.email ? formik.errors.email : null}</p>
            </FormField>
            <FormField>
            {/* <Label htmlFor='mobile'>Mobile:</Label>
            <Input id='mobile' name='mobile' type='tel' value={formik.values.mobile} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.mobile ? formik.errors.mobile : null}</p>
            </FormField>
            <FormField> */}
            <Label htmlFor='phone'>Phone:</Label>
            <Input id='phone' name='phone' type='tel' value={formik.values.phone} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.phone ? formik.errors.phone : null}</p>
            </FormField>
            <FormField>
            <Label htmlFor='street1'>Street 1:</Label>
            <Input id='street1' name='street1' type='text' value={formik.values.street1} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
            <FormField>
            <Label htmlFor='street2'>Street 2:</Label>
            <Input id='street2' name='street2' type='text' value={formik.values.street2} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
            <FormField>
            <Label htmlFor='city'>City:</Label>
            <Input id='city' name='city' type='text' value={formik.values.city} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
            <FormField>
            <Label htmlFor='state'>State:</Label>
            <Input id='state' name='state' type='text' value={formik.values.state} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
            <FormField>
            <Label htmlFor='zipCode'>Zip Code:</Label>
            <Input id='zipCode' name='zipCode' type='text' value={formik.values.zipCode} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </FormField>
            <Button type='submit'>Submit</Button>
        </Form>
    );
}

export default Signup;