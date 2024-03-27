import App from './pages/App';
import JobPostings from './pages/JobPostings';
import NewJobPosting from './pages/NewJobPosting';
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
                element: <JobPostings />
            },
            {
                path: '/new_job_posting',
                element: <NewJobPosting />
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