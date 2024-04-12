import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardMeta, CardDescription, 
    Label, Dropdown, Icon, ButtonGroup, Button, ButtonOr, 
    Accordion, AccordionTitle, AccordionContent } from 'semantic-ui-react';

function MyJobPostings() {
    const [ myJobPostings, setMyJobPostings ] = useState([]);
    const [ selJobPosting, setSelJobPosting ] = useState(null);
    const [ jobApps, setJobApps ] = useState([]);
    const [ selJobAppId, setSelJobAppId ] = useState(null);
    const { userAccount } = useOutletContext();
    const [ statusCat, setStatusCat ] = useState([]);     // app.status options: new, accepted, rejected

    const statusCatOptions = [
        { key: 'new', text: 'Not Reviewed', value: 'new',},
        { key: 'hired', text: 'Hired', value: 'hired',},
        { key: 'declined', text: 'Declinded', value: 'declined',},
    ];
    
    // RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.employer) 
            navigate('/');
    } else 
        navigate('/signin')


    useEffect(() => {
        fetch('/jobpostings/uid')
        .then(r => {
            if (r.ok) 
                r.json().then(data => {
                    console.log('MyJobPostings, data: ', data);
                    setMyJobPostings(data);
                    // When my job postings is fetched again, I reset my selected job card.
                    setSelJobPosting(null);
                })
            else {
                // => Error handling needed for HTTP response status 401 & 403
            }
        });
    }, []);

    useEffect(() => {
        if (!selJobPosting)
            return;

        fetch(`/jobapplications/jpids/${selJobPosting.id}`)
        .then(r => {
            if (r.ok) 
                r.json().then(data => {
                    console.log('MyJobPostings, job apps for selected job posting', data);
                    setJobApps(data);
                })
            else {
                // => Error handling needed for HTTP response status 401 & 403
            }
        });
    }, [selJobPosting]);

    function handleJobPostingClick(job) {
        console.log('handleJobPostingClick, job: ', job);
        setSelJobPosting(job);
        setSelJobAppId(null);
    }

    function handleAppClick(e, {index}) {
        console.log('Accordion, e: ', e, ', index: ', index);
        if (selJobAppId === index) 
            setSelJobAppId(null);
        else
            setSelJobAppId(index);
    }

    function handleAppDecisionClick(app, isHire) {
        console.log('handleAppDecisionClick, app: ', app, ', isHire: ', isHire);
        fetch(`/jobapplications/${app.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: isHire ? 'hired' : 'declined',
            })
        })
        .then(r => {
            if (r.ok)
                r.json().then(data => {
                    setJobApps(jobApps.map(app => app.id === data.id ? data : app));
                })
            else {
                // => Error handling needed for HTTP response status 404
            }
        })
    }

    function handleJPStatusChange(jobPosting, status) {
        if (!jobPosting)
            return;

        fetch(`/jobpostings/${jobPosting.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status
            }),
        })
        .then(r => {
            if (r.ok) {
                r.json().then(data => {
                    setMyJobPostings(myJobPostings.map(jp => jp.id === data.id ? data : jp));
                    setSelJobPosting(data);
                })
            } else {
                // => Error handling needed for HTTP response status 404
            }
        });
    }

    if (!selJobPosting && myJobPostings.length)
        setSelJobPosting(myJobPostings[0]);

    const dispJobCards = myJobPostings.map(job => {
        const cardColor = (selJobPosting && job.id === selJobPosting.id) ? 'aliceblue' : 'white';
        const statusColor = job.status === 'open' ? 'lightskyblue' : (job.status === 'review' ? 'tomato' : 'lightgray');
        const status = job.status === 'open' ? 'Open' : (job.status === 'review' ? 'In review' : 'Closed');

        return (
            <Card key={job.id} style={{width: '100%', background: cardColor}} color='grey' 
                onClick={() => handleJobPostingClick(job)}>
                <CardContent>
                    <CardHeader>{job.title}</CardHeader>
                    <CardMeta>{job.employer.name}</CardMeta>
                    <CardMeta>
                        {job.remote !== 'Remote'? 
                            `${job.employer.user.city}, ${job.employer.user.state}` : null}
                    </CardMeta>
                    <CardMeta>
                        {job.remote !== 'On Site' ? job.remote : null}
                    </CardMeta>
                    <CardDescription>
                        <Label style={{background: statusColor}} content={status} />
                    </CardDescription>
                </CardContent>
            </Card>
        );
    });

    const filterJobApps = statusCat.length ? jobApps.filter(app => statusCat.includes(app.status)) : jobApps;

    const dispSelJobApps = filterJobApps.map(app => {
        // This case only happens when debugging....
        if (!selJobPosting)
            return null;

        let status, statusIcon, statusColor;
        if (selJobPosting.status === 'open') {
            status = 'Open'; statusIcon = 'info circle'; statusColor = 'lightblue';
        } else if (selJobPosting.status === 'review' && app.status === 'new') {
            status = 'Not Reviewd'; statusIcon = 'play circle outline'; statusColor = 'MistyRose';
        } else if (app.status === 'hired') {
            status = 'Hired'; statusIcon = 'thumbs up outline'; statusColor = 'LightGreen';
        } else {
            status = 'Declined'; statusIcon = 'remove circle'; statusColor = 'LightGrey';
        }

        return (
            <div key={app.id}>
                <AccordionTitle
                    active={selJobAppId === app.id}
                    index={app.id}
                    onClick={handleAppClick}>
                    <div style={{display: 'flex', flexFlow: 'row', justifyContent: 'center', alignItems:'center', width: '100%'}}>
                        <div style={{flex: '1 1 1%' }}>
                            <Icon name='dropdown' />
                        </div>
                        <div style={{flex: '1 1 99%'}}>
                            {app.applicant.first_name}, {app.applicant.last_name} <br />
                            {app.applicant.user.email} <br />
                            <Label style={{background: statusColor,}} icon={statusIcon} content={status} />
                        </div>
                    </div>
                </AccordionTitle>
                <AccordionContent active={selJobAppId === app.id} style={{color: 'black', paddingLeft: '40px'}}>
                    <ul>
                        <li>Education:</li>
                        <div style={{marginBottom: '10px'}}>{app.education}</div>
                        <li>Experiences:</li>
                        <div style={{marginBottom: '10px'}}>{app.experience}</div>
                        <li>Certificates:</li>
                        <div style={{marginBottom: '10px'}}>{app.certificate}</div>
                        <li>Contact Info:<br />
                            - Email: {app.applicant.user.email} <br />
                            - Mobile: {app.applicant.mobile} <br />
                            - Phone: {app.applicant.user.phone} <br />
                            - Address:
                                <div>
                                    &nbsp;&nbsp;{app.applicant.user.street_1}<br/>
                                    &nbsp;&nbsp;{app.applicant.user.street_2}<br/>
                                    &nbsp;&nbsp;{app.applicant.user.city}, {app.applicant.user.state} {app.applicant.user.zip_code}
                                </div>
                        </li>
                    </ul>
                    <br />
                    <Button color='blue' disabled={selJobPosting.status !== 'review'} onClick={() => handleAppDecisionClick(app, true)}>Hire</Button>
                    <Button color='orange' disabled={selJobPosting.status !== 'review'} onClick={() => handleAppDecisionClick(app, false)}>Decline</Button>
                </AccordionContent>
            </div>
        );
    });

    console.log('MyJobPostings, myJobPostings: ', myJobPostings);
    console.log('MyJobPostings, filterJobApps: ', filterJobApps);
    console.log('MyJobPostings, selJobPosting: ', selJobPosting);

    return (
        <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '100%' }}>
            <div style={{ flex: '1 1 25%', height: '100%', overflow: 'auto', padding: '15px' }}>
                {dispJobCards}
            </div>
            <div style={{ flex: '1 1 75%', height: '100%'}}>   
                <div style={{height: '6%'}}>
                    <ButtonGroup>
                        <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'open')} color='blue' 
                            onClick={() => handleJPStatusChange(selJobPosting, 'open')}>Open</Button>
                        {/* <ButtonOr style={{border: '1px solid black',}} /> */}
                        <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'review')} color='orange' 
                            onClick={() => handleJPStatusChange(selJobPosting, 'review')}>In Review</Button>
                        {/* <ButtonOr style={{border: '1px solid black',}} /> */}
                        <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'close')} color='grey' 
                            onClick={() => handleJPStatusChange(selJobPosting, 'close')}>Close</Button>
                    </ButtonGroup>
                    <Dropdown style={{ position: 'absolute', right: '20px', }} icon='filter' 
                        floating labeled button className='icon' 
                        search multiple selection clearable 
                        placeholder='Status'
                        options={statusCatOptions} value={statusCat} onChange={(e, {value}) => setStatusCat(value)} />
                </div>
                <div style={{height: '94%'}}>
                    {/* <ItemGroup divided style={{ height: '100%', overflow: 'auto', padding: '15px'}}>
                        {dispSelJobApps}
                    </ItemGroup> */}
                    <Accordion fluid styled style={{height: '100%', overflow: 'auto', padding: '15px'}}>
                        {dispSelJobApps}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}

export default MyJobPostings;