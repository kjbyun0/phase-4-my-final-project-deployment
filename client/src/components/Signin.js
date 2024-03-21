import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signin() {
    const [account, setAccount] = useState({
        username: '',
        password: '',
    });
    const navigate = useNavigate();

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
        .then(r => r.json())
        .then(data => {
                console.log('user: ', data)
                // => maybe later, I want to set new user here again.
                // => if so, I need to use outlet to get setUser function.
                // onSetSignInAccount(signInAccount);
                navigate('/');
            }
        );
    }

    function handleSignUpClick(e) {
        navigate('/signup');
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor='username'>Username: </label>
                <input id='username' name='username' type='text' value={account.username} onChange={handleChange} />
                <br />
                <label htmlFor='password'>Password: </label>
                <input id='password' name='password' type='password' value={account.password} onChange={handleChange} />
                <br />
                <input type='submit' value='Submit' />
            </form>
            <button type='button' onClick={handleSignUpClick}>Create new account</button>
        </>
    );
}

export default Signin;