
// => This code need to be changed to nav menu
function Logout({ onSetUser }) {
    function handleLogout() {
        fetch('/authenticate', { 
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok)
                onSetUser(null)
        })
    }

    return (
        <button onClick={handleLogout}>Logout</button>
    )
}

export default Logout;