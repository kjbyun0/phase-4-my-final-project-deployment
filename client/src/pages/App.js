import React, { useEffect, useState } from "react";
// import { Switch, Route } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import { useWindowSize } from '@react-hook/window-size';
import NavBar from '../components/NavBar';

function App() {
  const [userAccount, setUserAccount] = useState(null);

  console.log('in App, userAccount: ', userAccount);

  useEffect(() => {
    fetch('/authenticate')
    .then(r => {
      if (r.ok)
        r.json().then(data => setUserAccount(data));
      else
        // => it is added because I can't set userAccount  to null in Signout component without outlet.
        // => when outlet is applied, I may need to delete this...
        setUserAccount(null);
      console.log('r: ', r);
    });
  }, [])

  const [width, height] = useWindowSize()

  return (
    <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'center', 
                  overflow: 'hidden',height: height }}>
      <header style={{ flex: '0 1 auto', height: 'auto' }}>
        <NavBar userAccount={userAccount}/>
      </header>
      <main style={{ flex: '1 1', overflow: 'hidden'}}>
        <Outlet context={{
          userAccount: userAccount, 
          onSetUserAccount: setUserAccount,
        }} />
      </main>
    </div>
  );
}

export default App;
