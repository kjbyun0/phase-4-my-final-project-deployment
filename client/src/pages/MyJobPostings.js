import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CardGroup, Card, CardContent, CardHeader, CardMeta, CardDescription, 
    Label, Dropdown, Icon, ButtonGroup, Button,  
    Accordion, AccordionTitle, AccordionContent, Divider } from 'semantic-ui-react';

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
        // => Why do I need this condition??? I need to figure it out!!!!!!!!!!!!!!!!!!!!!!!!!
        if (selJobPosting.id !== job.id) {
            console.log("in handleJobPostingClick, selJobPosting: ", selJobPosting, ", job: ", job);
            setSelJobPosting(job);
            setSelJobAppId(null);
        }
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
        if (!jobPosting || jobPosting.status === status)
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
                    setStatusCat([]);
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
            <Card key={job.id} style={{width: '100%', background: cardColor, }} color='grey' 
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

    // const filterJobApps = statusCat.length ? 
    //     jobApps.filter(app => statusCat.includes(app.status)) : 
    //     jobApps;

    const filterJobApps = statusCat.length ? 
        jobApps.filter(app => statusCat.includes(
            (selJobPosting && selJobPosting.status === 'close' && app.status === 'new') ? 
            'declined' : 
            app.status)
        ) : 
        jobApps;

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
                    <div style={{display: 'grid', width: '100%', gridTemplateColumns: 'max-content 1fr', }}>
                        <div>
                            <Icon name='dropdown' />
                        </div>
                        <div>
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
                    {
                        selJobPosting.status !== 'close' ? 
                        <div>
                            <Button color='blue' disabled={selJobPosting.status !== 'review'} onClick={() => handleAppDecisionClick(app, true)}>Hire</Button>
                            <Button color='orange' disabled={selJobPosting.status !== 'review'} onClick={() => handleAppDecisionClick(app, false)}>Decline</Button>
                        </div> : 
                        null
                    }
                </AccordionContent>
                <Divider />
            </div>
        );
    });

    console.log('MyJobPostings, myJobPostings: ', myJobPostings);
    console.log('MyJobPostings, selJobPosting: ', selJobPosting);
    console.log('MyJobPostings, filterJobApps: ', filterJobApps);
    console.log('MyJobPostings, statusCat: ', statusCat);

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '10% 25% 1fr 10%', 
            gridTemplateRows: 'max-content 1fr', 
            gridTemplateAreas: 
                "'leftMargin cards toolBar rightMargin' \
                'leftMargin cards list rightMargin'", }}>
            <div style={{gridArea: 'leftMargin', background: 'lightgray', }} />
            <div style={{gridArea: 'cards', overflow: 'auto', marginTop: '5px', }}>
                <CardGroup itemsPerRow={1} centered>
                    {dispJobCards}
                </CardGroup>
            </div>
            <div style={{gridArea: 'toolBar', }}>
                <ButtonGroup style={{margin: '5px 3px', }}>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'open')} color='blue'
                        onClick={() => handleJPStatusChange(selJobPosting, 'open')}>Open</Button>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'review')} color='orange'
                        onClick={() => handleJPStatusChange(selJobPosting, 'review')}>In Review</Button>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'close')} color='grey'
                        onClick={() => handleJPStatusChange(selJobPosting, 'close')}>Close</Button>
                </ButtonGroup>
                <Dropdown style={{float: 'right', }} icon='filter' 
                    labeled button className='icon' 
                    search multiple selection clearable 
                    placeholder='Status'
                    disabled={!selJobPosting || selJobPosting.status === 'open'}
                    options={selJobPosting && selJobPosting.status === 'close' ? 
                        statusCatOptions.slice(1) : statusCatOptions} 
                    value={statusCat} onChange={(e, {value}) => setStatusCat(value)} />
            </div>
            <div style={{gridArea: 'list', overflow: 'auto', minWidth: '0', }}>
                <Accordion fluid style={{height: '100%', padding: '15px', }}>
                    {dispSelJobApps}
                </Accordion>
            </div>
            <div style={{gridArea: 'rightMargin', background: 'lightgray', }} />
        </div>
    );
}

export default MyJobPostings;