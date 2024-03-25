import React, { useEffect, useState } from "react";
// import { Switch, Route } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import { useWindowSize } from '@react-hook/window-size';
import NavBar from '../components/NavBar';

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

  const [width, height] = useWindowSize()

  return (
    <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'center', 
                  overflow: 'hidden',height: height }}>
      <header style={{ flex: '0 1 auto', height: 'auto' }}>
        <NavBar signInAccount={signInAccount}/>
      </header>
      <main style={{ flex: '1 1', overflow: 'hidden'}}>
        <Outlet context={{
          signInAccount: signInAccount, 
          onSetSignInAccount: setSignInAccount,
        }} />
      </main>
    </div>
  );
}

export default App;
