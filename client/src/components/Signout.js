import { useNavigate } from 'react-router-dom';

// => This code need to be changed to nav menu
function Signout() {
    const navigate = useNavigate()

    function handleSignout() {
        fetch('/authenticate', { 
            method: 'DELETE',
        })
        .then(r => {
            // if (r.ok)
            //     onSetSignInAccount(null)
            console.log('In handleSignout, navigate back to App')
            navigate('/');
        })
    }

    return (
        <>
            {handleSignout()}
        </>
    )
}

export default Signout;