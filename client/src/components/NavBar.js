import { NavLink } from "react-router-dom";
import './NavBar.css';

function NavBar({ signInAccount }) {
    return (
        <nav>
            <NavLink to='/'>Home</NavLink>
            {signInAccount ? 
                <NavLink to='/signout' className='nav-link'>Sign Out</NavLink> :
                <NavLink to='/signin' className='nav-link'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;