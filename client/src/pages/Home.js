import { useEffect, useState } from 'react';
import { CardGroup, Card, CardContent, CardHeader, CardMeta } from 'semantic-ui-react';

function Home() {
    const [jobOpenings, setJobOpenings] = useState([]);

    useEffect(() => {
        fetch('/jobopenings')
        .then(r => r.json())
        .then(data => setJobOpenings(data));
    }, []);

    console.log('jobOpenings: ', jobOpenings)

    const jobCards = jobOpenings.map(jobOpening => 
        <Card>
            <CardContent>
                <CardHeader>{jobOpening.title}</CardHeader>
                <CardMeta>{jobOpening.employer.name}</CardMeta>
                <CardMeta>
                    {jobOpening.remote !== 'Remote'? 
                        `${jobOpening.employer.city}, ${jobOpening.employer.state}` : null}
                </CardMeta>
                <CardMeta>
                    {jobOpening.remote !== 'On Site' ? jobOpening.remote : null}
                </CardMeta>
            </CardContent>
        </Card>
    )

    return (
        <>
            <h1>Welcome home</h1>
            <CardGroup itemsPerRow={1}>
                {jobCards}
            </CardGroup>
        </>
    );
}

export default Home;
