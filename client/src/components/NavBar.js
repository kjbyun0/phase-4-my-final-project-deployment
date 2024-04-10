import { NavLink } from "react-router-dom";

function NavBar({ userAccount }) {
    console.log('in NavBar, userAccount.employer: ', userAccount);

    return (
        <nav>
            <NavLink to='/' className='nav-link nav-link-first'>Jobs</NavLink>
            {userAccount && userAccount.applicant ? 
                (
                    <>
                        <NavLink to='applied_jobs' className='nav-link'>Applied Jobs</NavLink>
                        <NavLink to='favorite_jobs' className='nav-link'>Favorite Jobs</NavLink>
                    </>
                ) : 
                null
            }
            {userAccount && userAccount.employer ? 
                <>
                    <NavLink to='job_posting_form' className='nav-link'>Post Job</NavLink>
                    <NavLink to='my_job_postings' className='nav-link'>My Postings</NavLink>
                </> :
                null
            }
            {userAccount ? 
                <NavLink to='/signout' className='nav-link nav-link-last'>Sign Out</NavLink> :
                <NavLink to='/signin' className='nav-link nav-link-last'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;