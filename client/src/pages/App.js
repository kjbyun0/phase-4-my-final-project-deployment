import React, { useEffect, useState } from "react";
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

function App() {
  const [userAccount, setUserAccount] = useState(null);

  console.log('in App, userAccount: ', userAccount);

  useEffect(() => {
    console.log('in App, authentication occur...');
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

  return (
    <div style={{display: 'grid', width: '100%', height: '100%', gridTemplateRows: 'max-content 1fr', }}>
      <header>
        <NavBar userAccount={userAccount}/>
      </header>
      <main style={{minWidth: '0', minHeight: '0', }}>
        <Outlet context={{
          userAccount: userAccount, 
          onSetUserAccount: setUserAccount,
        }} />
      </main>
    </div>
  );
}



export default App;
