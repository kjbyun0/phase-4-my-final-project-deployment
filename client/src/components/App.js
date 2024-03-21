import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import NavBar from './NavBar';

function App() {
  const [signInAccount, setSignInAccount] = useState(null);

  console.log('in App, signInAccount: ', signInAccount);

  useEffect(() => {
    fetch('/authenticate')
    .then(r => {
      if (r.ok)
        r.json().then(data => setSignInAccount(data));
      else
        // => it is added because I can't set signInAccount to null in Signout component without outlet.
        // => when outlet is applied, I may need to delete this...
        setSignInAccount(null);
      console.log('r: ', r);
    });
  }, [])

  return (
    <>
      <header>
        <NavBar signInAccount={signInAccount}/>
      </header>
      <main>
        <h1>Welcome Back!!</h1>
      </main>
    </>
  );
}

export default App;
