import { NavLink } from "react-router-dom";
import './NavBar.css';

function NavBar({ signInAccount }) {
    return (
        <nav>
            <NavLink to='/'>Jobs</NavLink>
            <NavLink to='new_job_posting'>Post Job</NavLink>
            {signInAccount ? 
                <NavLink to='/signout' className='nav-link'>Sign Out</NavLink> :
                <NavLink to='/signin' className='nav-link'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;