import App from './components/App';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Signout from './components/Signout';

const routes = [
    {
        path: '/',
        element: <App />,
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
];

export default routes