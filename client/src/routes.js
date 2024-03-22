import App from './pages/App';
import Home from './pages/Home';
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
                element: <Home />
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