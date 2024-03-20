import { useFormik } from 'formik';
import * as yup from 'yup';

function Signup({ onSetUser }) {

    const formSchema = yup.object().shape({
        name: yup.string().required('Must enter a name'),
        username: yup.string().required('Must enter a username')
                    .min(5, 'Must be between 5 and 50 characters')
                    .max(20, 'Must be between 5 and 50 characters'),
        // => add more constraints later. think about making custom constraints
        password: yup.string().required('Must enter a password'),
        email: yup.string().required('Must enter your email').email('Invalid email format'),
        mobile: yup.string()
        // const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
        // phoneNumber: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            username: '',
            password: '',
            email: '',
            mobile: '',
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
                    console.log('new account created: ', r.json());
                    r.json().then(data => onSetUser(data));
                    // => redirect to an appropriate page.
                } else {
                    // => add a funciton to display errors and enable submit button.
                }
            });
        },
    });

    // console.log('formik: ', formik);

    return (
        <form onSubmit={formik.handleSubmit}>
            <label htmlFor='name'>Full name:</label>
            <input id='name' name='name' type='text' value={formik.values.name} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.name ? formik.errors.name : null}</p>
            <lable htmlFor='username'>Username:</lable>
            <input id='username' name='username' type='text' value={formik.values.username} 
                onChange={formik.handleChange} />
            <p style={{ color: 'red'}}>{formik.touched.username ? formik.errors.username : null}</p>
            <lable htmlFor='password'>Password:</lable>
            <input id='password' name='password' type='password' value={formik.values.password} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.password ? formik.errors.password : null}</p>
            <label htmlFor='email'>Email:</label>
            <input id='email' name='email' type='email' value={formik.values.email} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.email ? formik.errors.email : null}</p>
            <label htmlFor='mobile'>Mobile:</label>
            <input id='mobile' name='mobile' type='tel' value={formik.values.mobile} 
                onChange={formik.handleChange} onBlur={formik.handleBlur} />
            <p style={{ color: 'red'}}>{formik.touched.mobile ? formik.errors.mobile : null}</p>
            <button type='submit'>Submit</button>
        </form>
    );
}

export default Signup;