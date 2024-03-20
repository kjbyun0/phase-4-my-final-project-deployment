import { useState } from 'react';
import Logout from './logout';

function Login({ user, onSetUser }) {
    const [username, setUsername] = useState('');

    function handleSubmit(e) {
        e.preventDefault();

        fetch('/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username
            })
        })
        .then(r => r.json())
        .then(data => {
                onSetUser(data);
                console.log('user: ', data)
            }
        );
    }

    return (
        <>
            {
                user ? (
                   <Logout onSetUser={onSetUser} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label>
                            Username: <input name='username' type='text' value={username} onChange={e => setUsername(e.target.value)} />
                        </label>
                        <input type='submit' value='Submit' />
                    </form>
                )
            }
        </>
    );
}

export default Login;