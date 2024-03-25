import { useEffect, useState } from 'react';
import { CardGroup, Card, CardContent, CardHeader, CardMeta,
        Grid, GridColumn } from 'semantic-ui-react';

function Home() {
    const [jobOpenings, setJobOpenings] = useState([]);

    useEffect(() => {
        fetch('/jobopenings')
        .then(r => r.json())
        .then(data => setJobOpenings(data));
    }, []);

    console.log('jobOpenings: ', jobOpenings)

    const jobCards = jobOpenings.map(jobOpening => 
        <Card key={jobOpening.id}>
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
        <Grid style={{ display: 'flex', flexFlow: 'row', height: '100%', overflow: 'hidden', padding: '15px'}} >
            <GridColumn style={{ flex: '1 1', height: '100%', overflowY: 'scroll' }} >
                <CardGroup itemsPerRow={1}>
                    {jobCards}
                </CardGroup>
            </GridColumn>
            <GridColumn style={{ flex: '2 1', height: '100%', overflowY: 'scroll' }} >
                {/* <p>Right Column</p> */}
                {jobCards}
            </GridColumn>
        </Grid>
    );
}

export default Home;
