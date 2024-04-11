import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardMeta, Button, 
        Dropdown, Icon } from 'semantic-ui-react';

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

    console.log('in JobPostings, userAccount: ', userAccount);
    function makeJobPostingState(data, bResetSelJobPosting) {
        console.log('in JobPostings, makeJobPostingState data before: ', data);
        console.log('in JobPostings, makeJobPostingState userAccount: ', userAccount);
        const jps = data.map(job => {
            return {
                jobPost: job,
                favoriteJob: (userAccount ? 
                            job.favorite_jobs.find(fjob => fjob.applicant_id === userAccount.applicant_id) : 
                            null),
            };
        });
        console.log('in JobPostings, makeJobPostingState data after: ', jps);

        if (bResetSelJobPosting)
            setSelJobPosting(null);

        return jps;
    }

    useEffect(() => {
        fetch('/jobpostings')
        .then(r => r.json())
        .then(data => setJobPostings(makeJobPostingState(data, true)));
    }, [userAccount]);
    // I added userAccount because everyone can view this page without signing in.

    function handleFiltersChange(e1, e2, type) {
        setFilters({
            ...filters,
            [type]: e2.value,
        });

        setSelJobPosting(null);
    }

    function handleApplyClick() {
        if (userAccount) {
            const app = selJobPosting.jobPost.job_applications.find(app => app.applicant_id === userAccount.applicant_id);
            if (!app || app.status === 'new')
                navigate(`/job_applications/${selJobPosting.jobPost.id}`);
            else {
                alert("Your application was reviewed. Please, check the result.");
            } 
        } else {
            // => Semantic ui react의 Confirm을 사용하는 것 고려...
            alert("Please, sign in before applying for a job.");
            navigate('/signin');
        }
    }

    function handleFavoriteClick(jobPost) {
        let pms;
        if (jobPost.favoriteJob) {
            pms = fetch(`/favoritejobs/uid/${jobPost.favoriteJob.id}`, {
                method: 'DELETE',
            });
        } else {
            pms = fetch('/favoritejobs/uid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_posting_id: jobPost.jobPost.id,
                    // I'm not gonna send the applicant_id because server can get it from session.
                }),
            })
        }

        pms.then(r => {
            if (r.ok) {                
                r.json().then(data => {
                    if (jobPost.favoriteJob) {
                        setJobPostings(makeJobPostingState(data, false));
                        setSelJobPosting({
                            jobPost: jobPost.jobPost,
                            favoriteJob: undefined,
                        });
                    } else {
                        setJobPostings(makeJobPostingState(data.jobs, false));
                        setSelJobPosting({
                            jobPost: jobPost.jobPost,
                            favoriteJob: data.favorite_job,
                        });
                    }
                });
            } else if (r.status === 403) {
                alert("You are signed in with your employer account. Please, sign in again.")
            } else if (r.status === 401) {
                alert("Please, sign in before adding it to your favorite jobs.");
                navigate('/signin');
            }
        });
    }

    const filteredJobPostings = jobPostings.filter(job => 
        job.jobPost.is_active && 
        (!filters.jobTypes.length || filters.jobTypes.includes(job.jobPost.job_type)) &&
        (!filters.remote.length || filters.remote.includes(job.jobPost.remote)) && 
        (filters.pay === '' || filters.pay <= job.jobPost.pay));

    if (!selJobPosting && filteredJobPostings.length)
        setSelJobPosting(filteredJobPostings[0]);

    // console.log('jobPostings: ', jobPostings);
    console.log('filteredJobPostings: ', filteredJobPostings);
    console.log('selJobPosting: ', selJobPosting);

    const dispJobCards = filteredJobPostings.map(job => {
        const cardColor = (selJobPosting && job.jobPost.id === selJobPosting.jobPost.id) ? 'aliceblue' : 'white';

        return (
            <Card key={job.jobPost.id} style={{width: '100%', background: cardColor}} color='gray' 
                onClick={() => setSelJobPosting(job)}>
                <CardContent>
                    <Button basic circular icon={job.favoriteJob ? 'bookmark' :'bookmark outline'}
                        color='blue' size='mini' compact style={{ float: 'right', }} 
                        onClick={() => handleFavoriteClick(job)} />
                    <CardHeader>{job.jobPost.title}</CardHeader>
                    <CardMeta>{job.jobPost.employer.name}</CardMeta>
                    <CardMeta>
                        {job.jobPost.remote !== 'Remote'? 
                            `${job.jobPost.employer.user.city}, ${job.jobPost.employer.user.state}` : null}
                    </CardMeta>
                    <CardMeta>
                        {job.jobPost.remote !== 'On Site' ? job.jobPost.remote : null}
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
                    <h1>{selJobPosting.jobPost.title}</h1>
                    <p>{selJobPosting.jobPost.employer.name} · {selJobPosting.jobPost.employer.user.city}, {selJobPosting.jobPost.employer.user.state}</p>
                    {
                        userAccount && userAccount.employer ? 
                        null : 
                        <>
                            <Button color='blue' onClick={handleApplyClick}>Apply</Button>
                            <Button basic icon={selJobPosting.favoriteJob ? 'bookmark' : 'bookmark outline'} 
                                color='blue' onClick={() => handleFavoriteClick(selJobPosting)} />
                        </>
                    }
                </div>
                <div style={{ flex: '1 1 75%', width: '100%', overflow: 'auto', padding: '20px 15px 15px 30px'}}>
                    <ul>
                        <li>Job type: {selJobPosting.jobPost.job_type}</li>
                        <li>Pay: {selJobPosting.jobPost.pay}/hr</li>
                        <li>Remote: {selJobPosting.jobPost.remote}</li>
                        <li>Description: <br/>
                            {selJobPosting.jobPost.description}
                        </li>
                        <li>Address: 
                            <p>{selJobPosting.jobPost.employer.user.street_1},<br/>
                                {selJobPosting.jobPost.employer.user.street_2},<br/>
                                {selJobPosting.jobPost.employer.user.city}, 
                                {selJobPosting.jobPost.employer.state}<br/>
                                {selJobPosting.jobPost.employer.user.zipCode}</p>
                        </li>
                        <li>Tel: {selJobPosting.jobPost.employer.user.phone}</li>
                        <li>Email: {selJobPosting.jobPost.employer.user.email}</li>
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
                            onChange={(e1, e2) => handleFiltersChange(e1, e2, type)} />
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
