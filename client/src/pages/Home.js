import { useEffect, useState } from 'react';
import { CardGroup, Card, CardContent, CardHeader, CardMeta,
        Grid, GridColumn, GridRow, Button } from 'semantic-ui-react';

function Home() {
    const [jobOpenings, setJobOpenings] = useState([]);
    const [focusedCardIdx, setFocusedCardIdx] = useState(0);

    useEffect(() => {
        fetch('/jobopenings')
        .then(r => r.json())
        .then(data => setJobOpenings(data));
    }, []);

    console.log('jobOpenings: ', jobOpenings)

    const jobCards = jobOpenings.map((jobOpening, i) => 
        <Card key={jobOpening.id} color={i === focusedCardIdx ? 'red' : 'grey'} onClick={() => setFocusedCardIdx(i)}>
            <CardContent>
                {/* <Button circular icon='bookmark outline' /> */}
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

    function dispJobOnFocus() {
        if (!jobOpenings.length) 
            return null;

        return (
            <Grid style={{ display: 'flex', flexFlow: 'column', height: '100%', overflow: 'hidden', padding: '15px'}}>
                <GridRow style={{ flex: '2 1', width: '100%', overflow: 'hidden'}}>
                    <div>
                        <h1>{jobOpenings[focusedCardIdx].title}</h1>
                        <p>{jobOpenings[focusedCardIdx].employer.name} · {jobOpenings[focusedCardIdx].employer.city}, {jobOpenings[focusedCardIdx].employer.state}</p>
                    </div>
                </GridRow>
                <GridRow style={{ flex: '10 1', width: '100%', overflowY: 'scroll'}}>
                    <ul>
                        <li>Job Type: {jobOpenings[focusedCardIdx].job_type}</li>
                        <li>Pay: {jobOpenings[focusedCardIdx].salary}/hr</li>
                        <li>Remote: {jobOpenings[focusedCardIdx].remote}</li>
                        <li>Description: <br/>
                            {jobOpenings[focusedCardIdx].description}
                        </li>
                        <li>Address: 
                            <p>{jobOpenings[focusedCardIdx].employer.street_1},<br/>
                                {jobOpenings[focusedCardIdx].employer.street_2},<br/>
                                {jobOpenings[focusedCardIdx].employer.city}, {jobOpenings[focusedCardIdx].employer.state}<br/>
                                {jobOpenings[focusedCardIdx].employer.zipCode}</p>
                        </li>
                        <li>Tel: {jobOpenings[focusedCardIdx].employer.phone}</li>
                        <li>Email: {jobOpenings[focusedCardIdx].employer.email}</li>
                    </ul>
                </GridRow>
            </Grid>
        );
    }

    return (
        <Grid style={{ display: 'flex', flexFlow: 'row', height: '100%', overflow: 'hidden', padding: '15px'}}>
            <GridColumn style={{ flex: '1 1', height: '100%', overflowY: 'scroll' }}>
                <CardGroup itemsPerRow={1}>
                    {jobCards}
                </CardGroup>
            </GridColumn>
            <GridColumn style={{ flex: '2 1', height: '100%', overflow: 'hidden' }}>
                {/* <p>Right Column</p> */}
                {dispJobOnFocus()}
            </GridColumn>
        </Grid>
    );
}

export default Home;
