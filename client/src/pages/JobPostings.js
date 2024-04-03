import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardMeta, Button, 
        Dropdown } from 'semantic-ui-react';

function JobPostings() {
    const [jobPostings, setJobPostings] = useState([]);
    const [focusedCardIdx, setFocusedCardIdx] = useState(0);
    const {userAccount} = useOutletContext();
    const navigate = useNavigate();

    const filterTypes = ['jobTypes', 'remote', 'pay'];
    const filterNames = ['Job Types', 'Remote', 'Pay'];
    const [filters, setFilters] = useState({
        jobTypes: [],
        remote: [],
        pay: '',
    });     
    const filterOptions = {
        jobTypes: [
            {key: 'fullTime', text: 'Full Time', value: 'Full time'}, 
            {key: 'partTime', text: 'Part Time', value: 'Part time'}, 
            {key: 'contract', text: 'Contract', value: 'Contract'}, 
        ],
        remote: [
            {key: 'onSite', text: 'On Site', value: 'On-Site'}, 
            {key: 'remote', text: 'Remote', value: 'Remote'}, 
            {key: 'hybrid', text: 'Hybrid', value: 'Hybrid'}, 
        ],
        pay: [
            {key: '1', text: '$15.00+/hour', value: 15.00},
            {key: '2', text: '$17.50+/hour', value: 17.50},
            {key: '3', text: '$20.00+/hour', value: 20.00},
            {key: '4', text: '$25.00+/hour', value: 25.00},
            {key: '5', text: '$37.50+/hour', value: 37.50},
        ]
    };

    useEffect(() => {
        fetch('/jobpostings')
        .then(r => r.json())
        .then(data => setJobPostings(data));
    }, []);

    console.log('jobPostings: ', jobPostings);

    function handleApplyClick() {
        if (userAccount) {
            navigate(`/job_applications/${jobPostings[focusedCardIdx].id}`);
        } else {
            // => Semantic ui react의 Confirm을 사용하는 것 고려...
            alert("Please, sign in before applying for a job.");
            navigate('/signin');
        }
    }

    const filteredJobPostings = jobPostings.filter(job => 
        job.is_active && 
        (!filters.jobTypes.length || filters.jobTypes.includes(job.job_type)) &&
        (!filters.remote.length || filters.remote.includes(job.remote)) && 
        (filters.pay === '' || filters.pay <= job.pay));

    const dispJobCards = filteredJobPostings.map((job, i) => {
        const cardStyle = {
            width: '100%',
            background: i === focusedCardIdx ? 'aliceblue' : 'white',
        };

        return (
            <Card key={job.id} style={cardStyle} color={i === focusedCardIdx ? 'blue' : 'grey'} 
                onClick={() => setFocusedCardIdx(i)}>
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
        );
    });

    function dispJobOnFocus() {
        if (!filteredJobPostings.length) 
            return null;

        return (
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <div style={{ flex: '1 1 25%', width: '100%', overflow: 'auto', padding: '20px'}}>
                    <h1>{filteredJobPostings[focusedCardIdx].title}</h1>
                    <p>{filteredJobPostings[focusedCardIdx].employer.name} · {filteredJobPostings[focusedCardIdx].employer.user.city}, {filteredJobPostings[focusedCardIdx].employer.user.state}</p>
                    {
                        userAccount && userAccount.employer ? 
                        null : 
                        <Button onClick={handleApplyClick}>Apply</Button>
                    }
                </div>
                <div style={{ flex: '1 1 75%', width: '100%', overflow: 'auto', padding: '20px 15px 15px 30px'}}>
                    <ul>
                        <li>Job type: {filteredJobPostings[focusedCardIdx].job_type}</li>
                        <li>Pay: {filteredJobPostings[focusedCardIdx].pay}/hr</li>
                        <li>Remote: {filteredJobPostings[focusedCardIdx].remote}</li>
                        <li>Description: <br/>
                            {filteredJobPostings[focusedCardIdx].description}
                        </li>
                        <li>Address: 
                            <p>{filteredJobPostings[focusedCardIdx].employer.user.street_1},<br/>
                                {filteredJobPostings[focusedCardIdx].employer.user.street_2},<br/>
                                {filteredJobPostings[focusedCardIdx].employer.user.city}, 
                                {filteredJobPostings[focusedCardIdx].employer.state}<br/>
                                {filteredJobPostings[focusedCardIdx].employer.user.zipCode}</p>
                        </li>
                        <li>Tel: {filteredJobPostings[focusedCardIdx].employer.user.phone}</li>
                        <li>Email: {filteredJobPostings[focusedCardIdx].employer.user.email}</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexFlow: 'row', alignItems: 'center', height: '7%', }}>
                {
                    filterTypes.map((type, i) => 
                        <Dropdown key={type} style={{ flex: '1 1', }} className='icon' 
                            icon='filter' floating labeled button 
                            search={type !== 'pay'} multiple={type !== 'pay'} selection clearable 
                            placeholder={filterNames[i]} 
                            options={filterOptions[type]} value={filters[type]}  
                            onChange={(e1, e2) => setFilters({
                                ...filters,
                                [type]: e2.value,
                            })} />
                    )
                }
            </div>
            <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '93%' }}>
                <div style={{ flex: '1 1 25%', height: '100%', overflow: 'auto', padding: '15px' }}>
                    {dispJobCards}
                </div>
                <div style={{ flex: '1 1 75%', height: '100%', overflowY: 'auto'}}>
                    {dispJobOnFocus()}
                </div>
            </div>
        </div>
    );
}

export default JobPostings;
