import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

function Signin() {
    const [account, setAccount] = useState({
        username: '',
        password: '',
        firstTime: true, 
    });
    const navigate = useNavigate();
    const { signInAccount, onSetSignInAccount } = useOutletContext();

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
                    onSetSignInAccount(data);
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
            <form onSubmit={handleSubmit}>
                <label htmlFor='username'>Username: </label>
                <input id='username' name='username' type='text' value={account.username} onChange={handleChange} />
                <br />
                <label htmlFor='password'>Password: </label>
                <input id='password' name='password' type='password' value={account.password} onChange={handleChange} />
                <br />
                <input type='submit' value='Submit' />
                <p style={{color: 'red'}}>{account.firstTime ? null : 'Invalid username or password. Please, try again.'}</p>
            </form>
            <button type='button' onClick={handleSignUpClick}>Create new account</button>
        </>
    );
}

export default Signin;