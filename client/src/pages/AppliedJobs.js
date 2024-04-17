import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, 
    ItemMeta, ItemDescription, ItemExtra, Label,
    Dropdown, Button } from 'semantic-ui-react';


function AppliedJobs() {
    const { userAccount } = useOutletContext();
    const [ appliedJobs, setAppliedJobs ] = useState([]);
    const [ statusCat, setStatusCat ] = useState([]);     // app.status options: new, accepted, rejected

    const statusCatOptions = [
        { key: 'applied', text: 'Applied', value: 'Applied',},
        { key: 'review', text: 'In review', value: 'In review',},
        { key: 'hired', text: 'Hired', value: 'Hired',},
        { key: 'closed', text: 'Closed', value: 'Closed',},
    ];

    //RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/')
    } else 
        navigate('/signin');

    useEffect(() => {
        fetch(`/jobapplications/uid`)
        .then(r => {
            if (r.ok)
                r.json().then(data => setAppliedJobs(data));
            else {
                // => Error handling needed.
                // => check if the HTTP response code is 401. if it is the user needs to sign in... redirect to the sign in page.
            }
        })
    }, []);

    console.log('in AppliedJobs, appliedJobs: ', appliedJobs);

    // => This may be changed... app paramater already has everything to display
    function handleItemClick(app) {
        console.log('app: ', app);
        if (app.status === 'Applied')
            navigate(`/job_applications/${app.job_posting.id}`)
    }

    function handleAppDeleteClick(e, o, app) {
        e.stopPropagation();


        fetch(`/jobapplications/${app.id}`, {
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok) {
                console.log('handleAppDeleteClick, delete successful.');
                setAppliedJobs(appliedJobs.filter(aJob => aJob.id !== app.id));
            } else {
                // => Handle Errors.
            }
        })
    }

    const appliedJobsStatus = appliedJobs.map(app => {
        let status;
        if (app.job_posting.status === 'open')
            status = 'Applied';
        else if (app.job_posting.status === 'review')
            status = 'In review';
        else if (app.status === 'hired')
            status = 'Hired';
        else
            status = 'Closed';

        return {
            ...app,
            status: status,
        }
    });

    const filterAppliedJobsStatus = statusCat.length ? 
                                appliedJobsStatus.filter(app => statusCat.includes(app.status)) : 
                                appliedJobsStatus;

    const dispFilteredAppliedJobsStatus = filterAppliedJobsStatus.map(app => {
        let statusIcon, statusColor;
        switch(app.status) {
            case 'Applied':
                statusIcon = 'pin'; statusColor = 'lightblue';
                break;
            case 'In review':
                statusIcon = 'spinner'; statusColor = 'mistyrose';
                break;
            case 'Hired':
                statusIcon = 'winner'; statusColor = 'lightgreen';
                break;
            case 'Closed':
                statusIcon = 'remove circle'; statusColor = 'lightgray';
                break;
        }

        return (
            <Item key={app.id} style={{padding: '15px',}} 
                className={app.status === 'Applied' ? 'pointerCursor' : null} 
                onClick={() => handleItemClick(app)} >
                <ItemContent>
                    <ItemHeader>{app.job_posting.title}</ItemHeader>
                    <ItemMeta>{app.job_posting.employer.name}</ItemMeta>
                    {/* <ItemDescription>Job type: {app.job_posting.job_category}</ItemDescription>
                    <ItemDescription>Pay: {app.job_posting.pay}/hr</ItemDescription>
                    <ItemDescription>Remote: {app.job_posting.remote}</ItemDescription> */}
                    <ItemExtra>
                        <Label style={{background: statusColor,}} icon={statusIcon} content={app.status} />
                    </ItemExtra>
                </ItemContent>
                {
                    (app.status === 'Applied' || app.status === 'Closed') ? 
                    <Button basic circular size='small' compact icon='trash alternate outline'
                        style={{alignSelf: 'center', }} 
                        onClick={(e, o) => handleAppDeleteClick(e, o, app)} /> : 
                    null
                }
            </Item>
        );
    });

    console.log('in AppliedJobs, dispFilteredAppliedJobs: ', dispFilteredAppliedJobsStatus);

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '20% 1fr 20%', 
            gridTemplateRows: 'max-content 1fr', 
            gridTemplateAreas: 
                "'leftMargin filterBar rightMargin' \
                'leftMargin list rightMargin'", }}>
            <div style={{gridArea: 'leftMargin', background: 'lightgray', }} />
            <div style={{gridArea: 'filterBar', margin: '5px 0', }}>
                <Dropdown style={{ float: 'right', }} icon='filter' 
                    floating labeled button className='icon' 
                    search multiple selection clearable 
                    placeholder='Status'
                    options={statusCatOptions} value={statusCat} onChange={(e, {value}) => setStatusCat(value)} />
            </div>
            <div style={{gridArea: 'list', overflow: 'auto', }}>
                <ItemGroup divided style={{ padding: '15px', }}>
                    {dispFilteredAppliedJobsStatus}
                </ItemGroup>
            </div>
            <div style={{gridArea: 'rightMargin', background: 'lightgray', }} />
        </div>
    );
}

export default AppliedJobs;
