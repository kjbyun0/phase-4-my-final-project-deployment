import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { updateUserInfo } from '../components/commonLib';


function App() {
  const [userR, setUserR] = useState(null);
  // Job postings created by this employer user account
  const [empJobPostingsR, setEmpJobPostingsR] = useState([]);
  // Job applications applied by this applicant user account
  const [appJobAppsR, setAppJobAppsR] = useState([]);
  // Favorite jobs marked by this applicant user account
  const [appFavJobsR, setAppFavJobsR] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/authenticate')
    .then(r => {
      if (r.ok) {
        r.json().then(data => {
          updateUserInfo(data, setUserR, setEmpJobPostingsR, setAppJobAppsR, setAppFavJobsR);
        });
      } else {
        //Access Control
        const paths = [
          '/job_applications', 
          '/applied_jobs',
          '/favorite_jobs',
          '/job_posting_form',
          '/my_job_postings',
        ];

        paths.forEach(path => {
          if (window.location.pathname.includes(path))
            navigate('/signin');
        });
      }
    });
  }, []);

  // console.log('in App, userR: ', userR);
  // console.log('in App, empJobPostingsR: ', empJobPostingsR);
  // console.log('in App, appJobAppsR: ', appJobAppsR);
  // console.log('in App, appFavJobsR: ', appFavJobsR);

  return (
    <div style={{display: 'grid', width: '100%', height: '100%', gridTemplateRows: 'max-content 1fr', }}>
      <header>
        <NavBar userR={userR}/>
      </header>
      <main style={{minWidth: '0', minHeight: '0', }}>
        <Outlet context={{
          userR: userR,
          onSetUserR: setUserR,
          empJobPostingsR: empJobPostingsR,
          onSetEmpJobPostingsR: setEmpJobPostingsR,
          appJobAppsR: appJobAppsR,
          onSetAppJobAppsR: setAppJobAppsR,
          appFavJobsR: appFavJobsR,
          onSetAppFavJobsR: setAppFavJobsR,
        }} />
      </main>
    </div>
  );
}

export default App;