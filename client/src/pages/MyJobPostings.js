import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardMeta, CardDescription, 
    ItemGroup, Item, ItemContent, ItemHeader, ItemMeta, ItemExtra, 
    Label, Dropdown } from 'semantic-ui-react';


function MyJobPostings() {
    const [ myJobPostings, setMyJobPostings ] = useState([]);
    const [ selJobPosting, setSelJobPosting ] = useState(null);
    const [ selJobApps, setSelJobApps ] = useState([]);
    const { userAccount } = useOutletContext();
    const [ statusCat, setStatusCat ] = useState([]);     // app.status options: new, accepted, rejected

    const statusCatOptions = [
        { key: 'new', text: 'Not Reviewed', value: 'new',},
        { key: 'accepted', text: 'Hired', value: 'accepted',},
        { key: 'rejected', text: 'Rejected', value: 'rejected',},
    ];
    
    // RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.employer) 
            navigate('/');
    } else 
        navigate('/signin')


    useEffect(() => {
        fetch('/empjobpostings')
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

        fetch(`/empjobapplications/${selJobPosting.id}`)
        .then(r => {
            if (r.ok) 
                r.json().then(data => {
                    console.log('MyJobPostings, job apps for selected job posting', data);
                    setSelJobApps(data);
                })
            else {
                // => Error handling needed for HTTP response status 401 & 403
            }
        });
    }, [selJobPosting]);

    if (!selJobPosting && myJobPostings.length)
        setSelJobPosting(myJobPostings[0]);

    const dispJobCards = myJobPostings.map(job => {
        const cardColor = (selJobPosting && job.id === selJobPosting.id) ? 'aliceblue' : 'white';
        const statusColor = job.is_active ? 'lightskyblue' : 'lightgray';
        const status = job.is_active ? 'Proceeding' : 'Process Completed';

        return (
            <Card key={job.id} style={{width: '100%', background: cardColor}} color='grey' 
                onClick={() => setSelJobPosting(job)}>
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

    const filterAppliedJobs = statusCat.length ? selJobApps.filter(app => statusCat.includes(app.status)) : selJobApps;
    const dispSelJobApps = filterAppliedJobs.map(app => {
        let status, statusIcon, statusColor;
        if (app.status === 'new') {
            status = 'Not Reviewd'; statusIcon = 'play circle outline'; statusColor = 'MistyRose';
        } else if (app.status === 'accepted') {
            status = 'Hired'; statusIcon = 'thumbs up outline'; statusColor = 'LightGreen';
        } else {
            status = 'Rejected'; statusIcon = 'remove circle'; statusColor = 'LightGrey';
        }

        return (
            <Item key={app.id} style={{padding: '15px',}} >
                {/* onClick={() => handleItemClick(app)} > */}
                <ItemContent>
                    <ItemHeader>{app.applicant.first_name}, {app.applicant.last_name}</ItemHeader>
                    <ItemMeta>{app.applicant.email}</ItemMeta>
                    {/* <ItemDescription>Job type: {app.job_posting.job_category}</ItemDescription>
                    <ItemDescription>Pay: {app.job_posting.pay}/hr</ItemDescription>
                    <ItemDescription>Remote: {app.job_posting.remote}</ItemDescription> */}
                    <ItemExtra>
                        <Label style={{background: statusColor,}} icon={statusIcon} content={status} />
                    </ItemExtra>
                </ItemContent>
            </Item>
        );
    });

    console.log('MyJobPostings, myJobPostings: ', myJobPostings);
    console.log('MyJobPostings, dispSelJobApps: ', dispSelJobApps);

    return (
        <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', height: '100%' }}>
            <div style={{ flex: '1 1 25%', height: '100%', overflow: 'auto', padding: '15px' }}>
                {dispJobCards}
            </div>
            <div style={{ flex: '1 1 75%', height: '100%'}}>   
                <div style={{height: '6%'}}>
                    <Dropdown style={{ position: 'absolute', right: '20px', }} icon='filter' 
                        floating labeled button className='icon' 
                        search multiple selection clearable 
                        placeholder='Status'
                        options={statusCatOptions} value={statusCat} onChange={(e, {value}) => setStatusCat(value)} />
                </div>
                <div style={{height: '94%'}}>
                    <ItemGroup divided style={{ height: '100%', overflow: 'auto', padding: '15px'}}>
                        {dispSelJobApps}
                    </ItemGroup>
                </div>
            </div>
        </div>
    );
}

export default MyJobPostings;