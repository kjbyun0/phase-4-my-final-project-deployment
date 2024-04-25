import { useOutletContext, Navigate } from 'react-router-dom';
import { updateUserInfo } from '../components/commonLib';


function Signout() {
    const { onSetUserR, onSetEmpJobPostingsR, onSetAppJobAppsR, onSetAppFavJobsR } = useOutletContext();

    function handleSignout() {
        fetch('/authenticate', { 
            method: 'DELETE',
        })
        .then(r => {
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