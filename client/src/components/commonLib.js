

function updateUserInfo(userData, setUserR, setEmpJobPostingsR, setAppJobAppsR, setAppFavJobsR) {
  const {applicant, employer, ... userRemainings} = userData;
  const {job_applications, favorite_jobs, ...appRemainings} = userData.applicant ? userData.applicant : {};
  const {job_postings, ...empRemainings} = userData.employer ? userData.employer : {};

  if (Object.keys(userRemainings).length) {
    setUserR({
      ...userRemainings,
      applicant: Object.keys(appRemainings).length === 0 ? null : appRemainings,
      employer: Object.keys(empRemainings).length === 0 ? null : empRemainings,
    });
  } else {
    setUserR(null);
  }

  setEmpJobPostingsR(job_postings === undefined ? [] : job_postings);
  setAppJobAppsR(job_applications === undefined ? [] : job_applications);
  setAppFavJobsR(favorite_jobs === undefined ? [] : favorite_jobs);
}

export { updateUserInfo };