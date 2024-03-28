import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Form, FormField, Label, Input, Button } from 'semantic-ui-react';

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
        <>
            <Form onSubmit={handleSubmit}>
                <FormField>
                    <Label htmlFor='username'>Username: </Label>
                    <Input id='username' name='username' type='text' value={account.username} onChange={handleChange} />
                </FormField>
                <FormField>
                    <Label htmlFor='password'>Password: </Label>
                    <Input id='password' name='password' type='password' value={account.password} onChange={handleChange} />
                </FormField>
                <Button type='submit'>Submit</Button>
                <p style={{color: 'red'}}>{account.firstTime ? null : 'Invalid username or password. Please, try again.'}</p>
            </Form>
            <Button type='button' onClick={handleSignUpClick}>Create new account</Button>
        </>
    );
}

export default Signin;