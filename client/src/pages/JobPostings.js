import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CardGroup, Card, CardContent, CardHeader, CardMeta,
        Grid, GridColumn, GridRow, Button } from 'semantic-ui-react';

function JobPostings() {
    const [jobPostings, setJobPostings] = useState([]);
    const [focusedCardIdx, setFocusedCardIdx] = useState(0);
    const {userAccount} = useOutletContext();

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/jobpostings')
        .then(r => r.json())
        .then(data => setJobPostings(data));
    }, []);

    console.log('jobPostings: ', jobPostings)

    const jobCards = jobPostings.map((job, i) => 
        <Card key={job.id} color={i === focusedCardIdx ? 'red' : 'grey'} onClick={() => setFocusedCardIdx(i)}>
            <CardContent>
                {/* <Button circular icon='bookmark outline' /> */}
                <CardHeader>{job.title}</CardHeader>
                <CardMeta>{job.employer.name}</CardMeta>
                <CardMeta>
                    {job.remote !== 'Remote'? 
                        `${job.employer.city}, ${job.employer.state}` : null}
                </CardMeta>
                <CardMeta>
                    {job.remote !== 'On Site' ? job.remote : null}
                </CardMeta>
            </CardContent>
        </Card>
    )

    function dispJobOnFocus() {
        if (!jobPostings.length) 
            return null;

        return (
            <Grid style={{ display: 'flex', flexFlow: 'column', height: '100%', overflow: 'hidden', padding: '15px'}}>
                <GridRow style={{ flex: '2 1', width: '100%', overflow: 'hidden'}}>
                    <div>
                        <h1>{jobPostings[focusedCardIdx].title}</h1>
                        <p>{jobPostings[focusedCardIdx].employer.name} · {jobPostings[focusedCardIdx].employer.user.city}, {jobPostings[focusedCardIdx].employer.user.state}</p>
                    </div>
                    {
                        userAccount && userAccount.employer ? 
                        null : 
                        <Button onClick={() => navigate(`/job_applications/${jobPostings[focusedCardIdx].id}`)}>Apply</Button>
                    }
                </GridRow>
                <GridRow style={{ flex: '10 1', width: '100%', overflowY: 'scroll'}}>
                    <ul>
                        <li>Job Type: {jobPostings[focusedCardIdx].job_type}</li>
                        <li>Pay: {jobPostings[focusedCardIdx].salary}/hr</li>
                        <li>Remote: {jobPostings[focusedCardIdx].remote}</li>
                        <li>Description: <br/>
                            {jobPostings[focusedCardIdx].description}
                        </li>
                        <li>Address: 
                            <p>{jobPostings[focusedCardIdx].employer.user.street_1},<br/>
                                {jobPostings[focusedCardIdx].employer.user.street_2},<br/>
                                {jobPostings[focusedCardIdx].employer.user.city}, {jobPostings[focusedCardIdx].employer.state}<br/>
                                {jobPostings[focusedCardIdx].employer.user.zipCode}</p>
                        </li>
                        <li>Tel: {jobPostings[focusedCardIdx].employer.user.phone}</li>
                        <li>Email: {jobPostings[focusedCardIdx].employer.user.email}</li>
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

export default JobPostings;
