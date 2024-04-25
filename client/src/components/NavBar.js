import { NavLink } from "react-router-dom";

function NavBar({ userR }) {
    // console.log('in NavBar, userR: ', userR);
    return (
        <nav>
            <NavLink to='/' className='nav-link nav-link-first'>{userR && userR.employer ? 'All Postings' : 'Jobs'}</NavLink>
            {userR && userR.applicant ? 
                <>
                    <NavLink to='applied_jobs' className='nav-link'>Applied Jobs</NavLink>
                    <NavLink to='favorite_jobs' className='nav-link'>Favorite Jobs</NavLink>
                </> : 
                null
            }
            {userR && userR.employer ? 
                <>
                    <NavLink to='my_job_postings' className='nav-link'>My Postings</NavLink>
                    <NavLink to='job_posting_form' className='nav-link'>Post Job</NavLink>
                </> :
                null
            }
            {userR ? 
                <NavLink to='/signout' className='nav-link nav-link-last'>Sign Out</NavLink> :
                <NavLink to='/signin' className='nav-link nav-link-last'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;