import { NavLink } from "react-router-dom";
import './NavBar.css';

function NavBar({ userAccount }) {
    console.log('in NavBar, userAccount.employer: ', userAccount);

    return (
        <nav>
            <NavLink to='/'>Jobs</NavLink>
            {userAccount && userAccount.employer ? 
                <NavLink to='new_job_posting'>Post Job</NavLink> :
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