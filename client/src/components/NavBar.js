import { NavLink } from "react-router-dom";

function NavBar({ signInAccount }) {
    return (
        <nav>
            <NavLink to='/'>Home</NavLink>
            {signInAccount ? 
                <NavLink to='/signout'>Sign Out</NavLink> :
                <NavLink to='/signin'>Sign In</NavLink>
            }
        </nav>
    );
}

export default NavBar;