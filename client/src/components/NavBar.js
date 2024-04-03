import { NavLink } from "react-router-dom";

function NavBar({ userAccount }) {
    console.log('in NavBar, userAccount.employer: ', userAccount);

    return (
        <nav>
            <NavLink to='/' className='nav-link'>Jobs</NavLink>
            {userAccount && userAccount.applicant ? 
                <NavLink to='applied_jobs' className='nav-link'>Appliced Job List</NavLink> : 
                null
            }
            {userAccount && userAccount.employer ? 
                <NavLink to='job_posting_form' className='nav-link'>Post Job</NavLink> :
                null
            }
            {userAccount ? 
                <NavLink to='/signout' className='nav-link'>Sign Out</NavLink> :
                <NavLink to='/signin' className='nav-link'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;