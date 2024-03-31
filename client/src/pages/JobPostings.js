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
        <Card key={job.id} style={{ width: '100%' }} color={i === focusedCardIdx ? 'red' : 'grey'} onClick={() => setFocusedCardIdx(i)}>
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
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <div style={{ flex: '1 1 25%', width: '100%', overflow: 'auto', padding: '20px'}}>
                    <h1>{jobPostings[focusedCardIdx].title}</h1>
                    <p>{jobPostings[focusedCardIdx].employer.name} · {jobPostings[focusedCardIdx].employer.user.city}, {jobPostings[focusedCardIdx].employer.user.state}</p>
                    {
                        userAccount && userAccount.employer ? 
                        null : 
                        <Button onClick={() => navigate(`/job_applications/${jobPostings[focusedCardIdx].id}`)}>Apply</Button>
                     }
                </div>
                <div style={{ flex: '1 1 75%', width: '100%', overflow: 'auto', padding: '20px 15px 15px 30px'}}>
                    <ul>
                        <li>Job type: {jobPostings[focusedCardIdx].job_type}</li>
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
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '100%' }}>
            <div style={{ flex: '1 1 25%', height: '100%', overflow: 'auto', padding: '15px' }}>
                {jobCards}
            </div>
            <div style={{ flex: '1 1 75%', height: '100%', overflowY: 'auto'}}>
                {dispJobOnFocus()}
            </div>
        </div>
    );
}

export default JobPostings;
