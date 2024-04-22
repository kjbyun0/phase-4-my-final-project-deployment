import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { updateUserInfo } from '../components/commonLib';

function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div>
            <h1 style={{ textAlign: 'center', paddingTop: '100px', color: 'crimson', }}>Invalid path! Please, check your path.</h1>
            <h3 style={{ textAlign: 'center', }}>{error.data}</h3>
        </div>
    );
}

export default ErrorPage;