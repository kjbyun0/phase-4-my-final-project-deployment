import { useOutletContext, Navigate } from 'react-router-dom';

// => This code need to be changed to nav menu
function Signout() {
    const { onSetUserAccount } = useOutletContext();

    function handleSignout() {
        fetch('/authenticate', { 
            method: 'DELETE',
        })
        .then(r => {
            // The server can't  fail logging out. So, don't need to check the return status.
            onSetUserAccount(null);
        })
    }

    return (
        <>
            {handleSignout()}
            <Navigate to='/' />
        </>
    )
}

export default Signout;