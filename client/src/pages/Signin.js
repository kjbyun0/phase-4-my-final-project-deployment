import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Form, FormField, Input, Button, Divider } from 'semantic-ui-react';

function Signin() {
    const [account, setAccount] = useState({
        username: '',
        password: '',
        firstTime: true, 
    });
    const navigate = useNavigate();
    const { onSetUserAccount } = useOutletContext();

    function handleChange(e) {
        setAccount({
            ...account,
            [e.target.name]: e.target.value,
        })
    }

    function handleSubmit(e) {
        e.preventDefault();

        fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(account),
        })
        .then(r => {
            if (r.ok) {
                r.json().then(data => {
                    console.log('user: ', data);
                    onSetUserAccount(data);
                    navigate('/');
                });
            } else {
                setAccount({
                    username: '',
                    password: '',
                    firstTime: false,
                });
            }
        });
    }

    function handleSignUpClick(e) {
        navigate('/signup');
    }

    return (
        <div style={{width: '100%', height: '100%', overflow: 'auto', }} >
            <div style={{width: '400px', height: '500px', margin: 'auto', position: 'relative', top: '10%', }}>
                <Form 
                    onSubmit={handleSubmit}>
                    <FormField>
                        <Input id='username' name='username' type='text' placeholder='Username' 
                            size='big' icon='user' iconPosition='left' 
                            value={account.username} onChange={handleChange} />
                    </FormField>
                    <FormField>
                        <Input id='password' name='password' type='password' placeholder='Password' 
                            size='big' icon='lock' iconPosition='left' 
                            value={account.password} onChange={handleChange} />
                    </FormField>
                    <Button type='submit' size='big' color='blue' style={{width: '100%', margin: 'auto'}} >Sign in</Button>
                    <p style={{color: 'red'}}>{account.firstTime ? null : 'Invalid username or password. Please, try again.'}</p>
                </Form>
                <Divider horizontal>OR</Divider>
                <Button type='button' size='big' color='green' style={{width: '100%', margin: 'auto'}}
                    onClick={handleSignUpClick}>Create new account</Button>
            </div>
        </div>
    );
}

export default Signin;