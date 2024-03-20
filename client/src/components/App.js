import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import Login from './login';
import Signup from './signup';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/authenticate')
    .then(r => {
      if (r.ok)
        r.json().then(data => setUser(data));
      console.log('r: ', r);
    });
  }, [])

  return (
    <>
      {/* <h1>Project Client, User:  {user ? `${user.username}` : '-'}</h1>
      <Login user={user} onSetUser={setUser} /> */}
      <Signup onSetUser={setUser} />
    </>
  );
}

export default App;
