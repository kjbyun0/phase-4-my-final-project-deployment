import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardMeta, Button, 
        Dropdown } from 'semantic-ui-react';

function JobPostings() {
    const [jobPostings, setJobPostings] = useState([]);
    const [selJobPosting, setSelJobPosting] = useState(null);
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

    function handleApplyClick() {
        if (userAccount) {
            navigate(`/job_applications/${selJobPosting.id}`);
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

    if (selJobPosting) {
        if (!filteredJobPostings.map(job => job.id).includes(selJobPosting.id)) {
            if (filteredJobPostings.length)
                setSelJobPosting(filteredJobPostings[0]);
            else 
                setSelJobPosting(null);
        }
    } else {
        if (filteredJobPostings.length)
            setSelJobPosting(filteredJobPostings[0]);
    }

    // console.log('jobPostings: ', jobPostings);
    console.log('filteredJobPostings: ', filteredJobPostings);
    // console.log('selJobPosting: ', selJobPosting);

    const dispJobCards = filteredJobPostings.map(job => {
        const cardStyle = {
            width: '100%',
            background: (selJobPosting && job.id === selJobPosting.id) ? 'aliceblue' : 'white',
        };

        return (
            <Card key={job.id} style={cardStyle} color={(selJobPosting && job.id === selJobPosting.id) ? 'blue' : 'grey'} 
                onClick={() => setSelJobPosting(job)}>
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
        if (!selJobPosting)
            return null;

        return (
            <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
                <div style={{ flex: '1 1 25%', width: '100%', overflow: 'auto', padding: '20px'}}>
                    <h1>{selJobPosting.title}</h1>
                    <p>{selJobPosting.employer.name} · {selJobPosting.employer.user.city}, {selJobPosting.employer.user.state}</p>
                    {
                        userAccount && userAccount.employer ? 
                        null : 
                        <Button onClick={handleApplyClick}>Apply</Button>
                    }
                </div>
                <div style={{ flex: '1 1 75%', width: '100%', overflow: 'auto', padding: '20px 15px 15px 30px'}}>
                    <ul>
                        <li>Job type: {selJobPosting.job_type}</li>
                        <li>Pay: {selJobPosting.pay}/hr</li>
                        <li>Remote: {selJobPosting.remote}</li>
                        <li>Description: <br/>
                            {selJobPosting.description}
                        </li>
                        <li>Address: 
                            <p>{selJobPosting.employer.user.street_1},<br/>
                                {selJobPosting.employer.user.street_2},<br/>
                                {selJobPosting.employer.user.city}, 
                                {selJobPosting.employer.state}<br/>
                                {selJobPosting.employer.user.zipCode}</p>
                        </li>
                        <li>Tel: {selJobPosting.employer.user.phone}</li>
                        <li>Email: {selJobPosting.employer.user.email}</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexFlow: 'row', alignItems: 'center', height: '6%', }}>
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
            <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '94%' }}>
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
