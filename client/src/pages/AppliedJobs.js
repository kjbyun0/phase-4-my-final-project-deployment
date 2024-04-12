import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, 
    ItemMeta, ItemDescription, ItemExtra, Label,
    Dropdown, } from 'semantic-ui-react';


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
            case 'Hired':
                statusIcon = 'winner'; statusColor = 'lightgreen';
                break;
            case 'Closed':
                statusIcon = 'remove circle'; statusColor = 'lightgray';
                break;
        }

        return (
            <Item key={app.id} style={{padding: '15px',}} className={app.status === 'Applied' ? 'pointerCursor' : null} 
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
            </Item>
        );
    });

    console.log('in AppliedJobs, dispFilteredAppliedJobs: ', dispFilteredAppliedJobsStatus);

    return (
        <div style={{ height: '100%', }}>
            <div style={{ height: '6%', }}>
                <Dropdown style={{ position: 'absolute', right: '20px', }} icon='filter' 
                    floating labeled button className='icon' 
                    search multiple selection clearable 
                    placeholder='Status'
                    options={statusCatOptions} value={statusCat} onChange={(e, {value}) => setStatusCat(value)} />
            </div>
            <div style={{ height: '94%', }}>
                <ItemGroup divided style={{ height: '100%', overflow: 'auto', padding: '15px', }}>
                    {dispFilteredAppliedJobsStatus}
                </ItemGroup>
            </div>
        </div>
    );
}

export default AppliedJobs;