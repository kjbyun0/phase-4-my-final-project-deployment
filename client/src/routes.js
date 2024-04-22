import App from './pages/App';
import JobPostings from './pages/JobPostings';
import JobApplicationForm from './pages/JobApplicationForm';
import AppliedJobs from './pages/AppliedJobs';
import FavoriteJobs from './pages/FavoriteJobs';
import JobPostingForm from './pages/JobPostingForm';
import MyJobPostings from './pages/MyJobPostings';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Signout from './pages/Signout';

const routes = [
    {
        path: '/',
        element: <App />,
        // errorElement: 
        children: [
            {
                path: '/',
                element: <JobPostings />,
            },
            {
                path: '/job_applications/:id',
                element: <JobApplicationForm />,
            },
            {
                path: '/applied_jobs',
                element: <AppliedJobs />,
            },
            {
                path: '/favorite_jobs',
                element: <FavoriteJobs />,
            },
            {
                path: '/job_posting_form',
                element: <JobPostingForm />,
            },
            {
                path: '/my_job_postings',
                element: <MyJobPostings />,
            },
            {
                path: '/signup',
                element: <Signup />,
            },
            {
                path: '/signin',
                element: <Signin />,
            },
            {
                path: '/signout',
                element: <Signout />,
            },
        ],
    },
];

export default routes