import { useOutletContext, Navigate } from 'react-router-dom';
import { updateUserInfo } from '../components/commonLib';

// => This code need to be changed to nav menu
function Signout() {
    const { onSetUserR, onSetEmpJobPostingsR, onSetAppJobAppsR, onSetAppFavJobsR } = useOutletContext();

    function handleSignout() {
        fetch('/authenticate', { 
            method: 'DELETE',
        })
        .then(r => {
            // The server can't  fail logging out. So, don't need to check the return status.
            updateUserInfo({}, onSetUserR, onSetEmpJobPostingsR, onSetAppJobAppsR, onSetAppFavJobsR);
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