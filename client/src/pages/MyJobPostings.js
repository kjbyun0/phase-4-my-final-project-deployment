import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CardGroup, Card, CardContent, CardHeader, CardMeta, CardDescription, 
    Label, Dropdown, Icon, ButtonGroup, Button,  
    Accordion, AccordionTitle, AccordionContent, Divider } from 'semantic-ui-react';

function MyJobPostings() {
    const [jobPostings, setJobPostings] = useState([]);
    const [ selJobPosting, setSelJobPosting ] = useState(null);
    const [ selJobAppId, setSelJobAppId ] = useState(null);

    // <Outlet context={{
    //     userR: userR,
    //     onSetUserR: setUserR,
    //     empJobPostingsR: empJobPostingsR,
    //     onSetEmpJobPostingsR: setEmpJobPostingsR,
    //     appJobAppsR: appJobAppsR,
    //     onSetAppJobAppsR: setAppJobAppsR,
    //     appFavJobsR: appFavJobsR,
    //     onSetAppFavJobsR: setAppFavJobsR,
    //   }} />
    const { userR, empJobPostingsR, onSetEmpJobPostingsR } = useOutletContext();
    const [ statusCat, setStatusCat ] = useState([]);     // app.status options: new, accepted, rejected

    const statusCatOptions = [
        { key: 'new', text: 'Not Reviewed', value: 'new',},
        { key: 'hired', text: 'Hired', value: 'hired',},
        { key: 'declined', text: 'Declinded', value: 'declined',},
    ];

    const navigate = useNavigate();
    useEffect(() => {
        if (userR && userR.applicant)
            navigate('/signin');
    }, [userR]);

    useEffect(() => {
        if (!userR)
            return;
        
        fetch('/jobpostings')
        .then(r => r.json())
        .then(data => setJobPostings(
            data.filter(job => job.employer_id === userR.employer_id)
        ));
    }, [userR]);

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
            r.json().then(data => {
                if (r.ok) {
                    const job = {
                        ...selJobPosting,
                        job_applications: selJobPosting.job_applications.map(app => app.id == data.id ? data : app),
                    };
                    setSelJobPosting(job);
                    setJobPostings(jobPostings.map(jp => jp.id === job.id ? job : jp))
                } else {
                    console.log('Server Error - Updating Job Application: ', data);
                    alert(`Server Error - Updating Job Application: ${data.message}`);
                }
            });
        });
    }

    async function handleJPStatusChange(status) {
        if (!selJobPosting || selJobPosting.status === status)
            return;

        let job = {};
        await fetch(`/jobpostings/${selJobPosting.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status
            }),
        })
        .then(async r => {
            // <= Don't I need await here???
            await r.json().then(data => {
                if (r.ok) {
                    job = {...data};
                    setSelJobPosting(data);
                    setStatusCat([]);
                    setJobPostings(jobPostings.map(jp => jp.id === data.id ? data : jp));
                    onSetEmpJobPostingsR(empJobPostingsR.map(jp => jp.id === data.id ? data : jp));
                    // console.log('in handleJPStatusChange, Pre: ', data);
                } else {
                    console.log('Server Error - Updating Job Posting: ', data);
                    alert(`Server Error - Updating Job Posting: ${data.message}`);
                }
            });
        });

        if (status === 'open') {
            const apps = job.job_applications;
            for (let i = 0; i < apps.length; i++) {
                if (apps[i].status === 'new')
                    continue;

                console.log('in handleJPStatusChange, change app status to new: app: ', apps[i]);
                await fetch(`/jobapplications/${apps[i].id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: 'new',
                    }),
                })
                .then(async r => {
                    // <= Don't I need await here???
                    await r.json().then(data => {
                        if (r.ok) {
                            apps[i] = data;
                            const updatedJob = {
                                ...job,
                                job_applications: apps,
                            };
                            // console.log('in handleJPStatusChange, ', i, ': ', data);
                            setSelJobPosting(updatedJob);
                            setJobPostings(jobPostings.map(jp => jp.id === updatedJob.id ? updatedJob : jp));
                            onSetEmpJobPostingsR(empJobPostingsR.map(jp => jp.id === updatedJob.id ? updatedJob : jp));
                        } else  {
                            console.log('Server Error - Updating Job Application: ', data);
                            alert(`Server Error - Updating Job Application: ${data.message}`);
                        }
                    });
                });
            }
        }
    }

    function handleJobPostingDeleteClick(e, o, job) {
        console.log('in handleJobPostingDeleteClick, job: ', job);
        e.stopPropagation();

        fetch(`/jobpostings/${job.id}`, {
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok) {
                setJobPostings(jobPostings.filter((jp, i) => {
                    if (jp.id === job.id && 
                        selJobPosting && selJobPosting.id === jp.id) {
                        if (i < jobPostings.length - 1)
                            setSelJobPosting(jobPostings[i+1]);
                        else if (i > 0)
                            setSelJobPosting(jobPostings[i-1]);
                        else
                            setSelJobPosting(null);
                    }

                    return jp.id !== job.id;
                }));

                onSetEmpJobPostingsR(empJobPostingsR.filter(jp => jp.id !== job.id));
            } else {
                r.json().then(data => {
                    console.log('Server Error - Deleting Job Posting: ', data);
                    alert(`Server Error - Deleting Job Posting: ${data.message}`);
                });
            }
        })
    }

    if (!selJobPosting && jobPostings.length)
        setSelJobPosting(jobPostings[0]);

    const dispJobCards = jobPostings.map(job => {
        const cardColor = (selJobPosting && job.id === selJobPosting.id) ? 'aliceblue' : 'white';
        const statusColor = job.status === 'open' ? 'lightskyblue' : (job.status === 'review' ? 'tomato' : 'lightgray');
        const status = job.status === 'open' ? 'Open' : (job.status === 'review' ? 'In review' : 'Closed');

        return (
            <Card key={job.id} style={{width: '100%', background: cardColor, }} color='grey' 
                onClick={() => handleJobPostingClick(job)}>
                <CardContent>
                    <Button basic circular size='mini' compact icon='trash alternate outline' 
                        style={{float: 'right', }} onClick={(e, o) => handleJobPostingDeleteClick(e, o, job)} />
                    <CardHeader>{job.title}</CardHeader>
                    <CardMeta>{userR.employer.name}</CardMeta>
                    <CardMeta>
                        {job.remote !== 'Remote'? 
                            `${userR.city}, ${userR.state}` : null}
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

    console.log('MyJobPostings, jobPostings: ', jobPostings);
    console.log('MyJobPostings, selJobPosting: ', selJobPosting);
    
    const apps = selJobPosting ? selJobPosting.job_applications : [];
    const filterJobApps = statusCat.length ? 
        apps.filter(app => statusCat.includes(
            (selJobPosting && selJobPosting.status === 'close' && app.status === 'new') ? 
            'declined' : 
            app.status)
        ) : 
        apps;

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
                        <li style={{fontWeight: 'bold', }}>Education:</li>
                        <div style={{whiteSpace: 'pre', marginBottom: '10px'}}>{app.education}</div>
                        <li style={{fontWeight: 'bold', }}>Experiences:</li>
                        <div style={{whiteSpace: 'pre', marginBottom: '10px'}}>{app.experience}</div>
                        <li style={{fontWeight: 'bold', }}>Certificates:</li>
                        <div style={{whiteSpace: 'pre', marginBottom: '10px'}}>{app.certificate}</div>
                        <li style={{fontWeight: 'bold', }}>Contact Info:</li>
                        <div>
                            - Email: {app.applicant.user.email} <br />
                            - Mobile: {app.applicant.mobile} <br />
                            - Phone: {app.applicant.user.phone} <br />
                            - Address: <br />
                            &nbsp;&nbsp;{app.applicant.user.street_1}<br/>
                            &nbsp;&nbsp;{app.applicant.user.street_2}<br/>
                            &nbsp;&nbsp;{app.applicant.user.city}, {app.applicant.user.state} {app.applicant.user.zip_code}
                        </div>
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
            <div style={{gridArea: 'cards', overflow: 'auto', paddingTop: '5px', marginTop: '5px', }}>
                <CardGroup itemsPerRow={1} centered>
                    {dispJobCards}
                </CardGroup>
            </div>
            <div style={{gridArea: 'toolBar', }}>
                <ButtonGroup style={{margin: '5px 3px', }}>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'open')} color='blue'
                        onClick={() => handleJPStatusChange('open')}>Open</Button>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'review')} color='orange'
                        onClick={() => handleJPStatusChange('review')}>In Review</Button>
                    <Button basic={!selJobPosting || (selJobPosting && selJobPosting.status !== 'close')} color='grey'
                        onClick={() => handleJPStatusChange('close')}>Close</Button>
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