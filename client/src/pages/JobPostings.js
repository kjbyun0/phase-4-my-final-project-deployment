import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CardGroup, Card, CardContent, CardHeader, CardMeta, Button, 
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

    function handleFiltersChange(e, o, type) {
        setFilters({
            ...filters,
            [type]: o.value,
        });

        setSelJobPosting(null);
    }

    function handleApplyClick() {
        if (userAccount) {
            navigate(`/job_applications/${selJobPosting.jobPost.id}`);
            // => I don't need the codes below anymore because job list displayed in this page are all in open status!!!!!
            // const app = selJobPosting.jobPost.job_applications.find(app => app.applicant_id === userAccount.applicant_id);
            // if (!app || app.status === 'new')
            //     navigate(`/job_applications/${selJobPosting.jobPost.id}`);
            // else {
            //     alert("Your application was reviewed. Please, check the result.");
            // } 
        } else {
            // => Semantic ui react의 Confirm을 사용하는 것 고려...
            alert("Please, sign in before applying for a job.");
            navigate('/signin');
        }
    }

    function handleFavoriteClick(e, o, jobPost) {
        e.stopPropagation();

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
                        if (jobPost.jobPost.id === selJobPosting.jobPost.id) 
                            setSelJobPosting({
                                jobPost: jobPost.jobPost,
                                favoriteJob: undefined,
                            });
                    } else {
                        setJobPostings(makeJobPostingState(data.jobs, false));
                        if (jobPost.jobPost.id === selJobPosting.jobPost.id)
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

    function handleCardClick(job) {
        // => Why do I need this condition??? I need to figure it out!!!!!!!!!!!!!!!!!!!!!!!!!
        if (selJobPosting.jobPost.id !== job.jobPost.id) {
            console.log("in handleCardClick, selJobPosting: ", selJobPosting, ", job: ", job);
            setSelJobPosting(job);
        }
    }

    function handleJobPostingDeleteClick(e, o, job) {
        console.log('in handleJobPostingDeleteClick, ');
        e.stopPropagation();

        fetch(`/jobpostings/${job.jobPost.id}`, {
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok) {
                setJobPostings(jobPostings.filter((jp, i) => {
                    if (jp.jobPost.id === job.jobPost.id && 
                        selJobPosting && selJobPosting.jobPost.id === jp.jobPost.id) {
                            if (jp < jobPostings.length - 1)
                                setSelJobPosting(jobPostings[i+1]);
                            else if (i > 0)
                                setSelJobPosting(jobPostings[i-1]);
                            else
                                setSelJobPosting(null);
                    }
                    return jp.jobPost.id !== job.jobPost.id;
                }));
            } else {
                // => Error handling needed for HTTP response status 404
            }
        })
        
    }

    function isEmployer() {
        return userAccount && userAccount.employer;
    }

    function isJobByEmployer(job) {
        return userAccount && userAccount.employer_id === job.jobPost.employer_id;
    }
    
    const filteredJobPostings = jobPostings.filter(job => 
        job.jobPost.status === 'open' && 
        (!filters.jobTypes.length || filters.jobTypes.includes(job.jobPost.job_type)) &&
        (!filters.remote.length || filters.remote.includes(job.jobPost.remote)) && 
        (filters.pay === '' || filters.pay <= job.jobPost.pay));

    if (!selJobPosting && filteredJobPostings.length) 
        setSelJobPosting(filteredJobPostings[0]);

    console.log('in JobPostings, userAccount: ', userAccount);
    // console.log('jobPostings: ', jobPostings);
    console.log('filteredJobPostings: ', filteredJobPostings);
    console.log('selJobPosting: ', selJobPosting);

    const dispJobCards = filteredJobPostings.map(job => {
        const cardColor = (selJobPosting && job.jobPost.id === selJobPosting.jobPost.id) ? 'aliceblue' :  'white';

        return (
            <Card key={job.jobPost.id} style={{ background: cardColor, }} color='grey' 
                onClick={() => handleCardClick(job)}>
                <CardContent>
                    {
                        (isEmployer()) ? 
                            (isJobByEmployer(job) ? 
                                <Button basic circular size='mini' compact icon='trash alternate outline' 
                                    style={{float: 'right', }} onClick={(e, o) => handleJobPostingDeleteClick(e, o, job)} /> : 
                                null) :
                            <Button basic circular icon={job.favoriteJob ? 'bookmark' :'bookmark outline'}
                                color='blue' size='mini' compact style={{ float: 'right', }} 
                                onClick={(e, o) => handleFavoriteClick(e, o, job)} />
                    }
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
            <div style={{display: 'grid', width: '100%', height: '100%', 
                gridTemplateRows: 'max-content 1fr', padding: '10px', }}>
                <div style={{overflow: 'auto', padding: '20px', 
                    border: '1px solid lightgray', borderRadius: '10px', }}>
                    <h1>{selJobPosting.jobPost.title}</h1>
                    <p>{selJobPosting.jobPost.employer.name} · {selJobPosting.jobPost.employer.user.city}, {selJobPosting.jobPost.employer.user.state}</p>
                    {
                        (isEmployer()) ? 
                            (isJobByEmployer(selJobPosting) ? 
                                <Button basic icon='trash alternate outline' 
                                    color='black' onClick={(e, o) => handleJobPostingDeleteClick(e, o, selJobPosting)} /> : 
                                null)
                            : 
                            <>
                                <Button color='blue' onClick={handleApplyClick}>Apply</Button>
                                <Button basic icon={selJobPosting.favoriteJob ? 'bookmark' : 'bookmark outline'} 
                                    color='blue' onClick={(e, o) => handleFavoriteClick(e, o, selJobPosting)} />
                            </>
                    }
                </div>
                <div style={{overflow: 'auto', padding: '20px 15px 15px 30px', }}>
                    <ul>
                        <li style={{fontWeight: 'bold', }}>Job type: 
                            <span style={{fontWeight: 'normal'}}>&nbsp;{selJobPosting.jobPost.job_type}</span>
                        </li> 
                        <li style={{fontWeight: 'bold', }}>Pay: 
                            <span style={{fontWeight: 'normal'}}>&nbsp;${selJobPosting.jobPost.pay}/hr</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Remote: 
                            <span style={{fontWeight: 'normal', }}>&nbsp;{selJobPosting.jobPost.remote}</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Description:</li>
                        <div style={{whiteSpace: 'pre', }}>{selJobPosting.jobPost.description}</div>
                        <li style={{fontWeight: 'bold', }}>Address:</li>
                        <div>
                            {selJobPosting.jobPost.employer.user.street_1},<br/>
                            {selJobPosting.jobPost.employer.user.street_2},<br/>
                            {selJobPosting.jobPost.employer.user.city},&nbsp;
                            {selJobPosting.jobPost.employer.user.state}
                        </div>
                        <li style={{fontWeight: 'bold', }}>Tel: 
                        <span style={{fontWeight: 'normal', }}>&nbsp;{selJobPosting.jobPost.employer.user.phone}</span>
                        </li>
                        <li style={{fontWeight: 'bold', }}>Email: 
                            <span style={{fontWeight: 'normal', }}>&nbsp;{selJobPosting.jobPost.employer.user.email}</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '10% 25% 1fr 10%',
            gridTemplateRows: 'max-content 1fr', 
            gridTemplateAreas: 
                "'filterBar filterBar filterBar filterBar' \
                'leftMargin cards details rightMargin'", }}>
            <div style={{gridArea: 'filterBar', margin: '0 5%' }}>
                {
                    filterTypes.map((type, i) => 
                        <Dropdown key={type} className='icon' style={{width: '32%', margin: '5px 3px', }}
                            icon='filter' floating labeled button 
                            search={type !== 'pay'} multiple={type !== 'pay'} selection clearable 
                            placeholder={filterNames[i]} 
                            options={filterOptions[type]} value={filters[type]}  
                            onChange={(e, o) => handleFiltersChange(e, o, type)} />
                    )
                }
            </div>
            <div style={{gridArea: 'leftMargin', background: 'lightgray', }} />
            <div style={{gridArea: 'cards', overflow: 'auto', paddingTop: '5px', marginTop: '5px', }}>
                <CardGroup itemsPerRow={1} centered >
                    {dispJobCards}
                </CardGroup>
            </div>
            <div style={{gridArea: 'details', minWidth: '0', minHeight: '0', margin: '10px', }}>
                {dispJobOnFocus()}
            </div>
            <div style={{gridArea: 'rightMargin', background: 'lightgray', }} />
        </div>
    );
}

export default JobPostings;