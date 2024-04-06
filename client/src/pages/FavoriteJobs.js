import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, ItemMeta, ItemExtra, 
    Label, Dropdown } from 'semantic-ui-react';

function FavoriteJobs() {
    const { userAccount } = useOutletContext();
    const [ favoriteJobs, setFavoriteJobs ] = useState([]);
    const [ statusCat, setStatusCat ] = useState([]);

    const statusCatOptions = [
        { key: 'notApplied', text: 'Not Applied', value: 'notApplied'}, 
        { key: 'applied', text: 'Applied', value: 'applied',},
        { key: 'hired', text: 'Hired', value: 'hired',},
        { key: 'closed', text: 'Closed', value: 'closed',},
    ];

    //RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/')
    } else 
        navigate('/signin');

    useEffect(() => {
        fetch('/favoritejobs')
        .then(r => {
            if (r.ok)
                r.json().then(data => {
                    // console.log('favoriteJobs: ', data);
                    setFavoriteJobs(data);
                });
            else {
                // => Error handling needed for HTTP response status 401 & 403
            }
        })
    }, []);

    // => This may be changed... app paramater already has everything to display
    function handleItemClick(job) {
        // console.log('job: ', job);
        if (job.status === 'notApplied' || job.status === 'applied') 
            navigate(`/job_applications/${job.job_posting_id}`)
    }

    const favoriteJobsStatus = favoriteJobs.map(job => {
        const app = job.applicant.job_applications.find(app => app.job_posting_id === job.job_posting_id);
        let status;
        if (!app) 
            status = 'notApplied';
        else if (app.status === 'new') 
            status = 'applied';
        else if (app.status === 'accepted') 
            status = 'hired';
        else 
            status = 'closed';
        
        return ({
            ...job,
            status: status,
        });
    });
    console.log("in FavoriteJobs, favoriteJobsStatus: ", favoriteJobsStatus);

    const filterFavoriteJobs = 
        statusCat.length === 0 ? 
        favoriteJobsStatus : 
        favoriteJobsStatus.filter((job, i) => statusCat.includes(job.status));

    const dispFilteredFavoriteJobs = filterFavoriteJobs.map(job => {
        let status, statusIcon, statusColor;
        switch (job.status) {
            case 'notApplied':
                status = 'Not Applied'; statusIcon = 'pause circle outline'; statusColor = 'dodgerblue';
                break;
            case 'applied':
                status = 'Applied'; statusIcon = 'play circle outline'; statusColor = 'MistyRose';
                break;
            case 'hired':
                status = 'Hired'; statusIcon = 'thumbs up outline'; statusColor = 'LightGreen';
                break;
            case 'closed':
                status = 'Closed'; statusIcon = 'remove circle'; statusColor = 'LightGrey';
                break;
        }

        return (
            <Item key={job.id} style={{padding: '15px',}} 
                className={(status === 'Not Applied' || status === 'Applied') ? 'pointerCursor' : null} 
                onClick={() => handleItemClick(job)}>
                <ItemContent>
                    <ItemHeader>{job.job_posting.title}</ItemHeader>
                    <ItemMeta>{job.job_posting.employer.name}</ItemMeta>

                    <ItemExtra>
                        <Label style={{ background: statusColor, }} icon={statusIcon} content={status}/>
                    </ItemExtra>
                </ItemContent>
            </Item>
        );
    });

    return (
        <div style={{ height: '100%', }}>
            <div style={{ height: '6%', }}>
                <Dropdown style={{ position: 'absolute', right: '20px', }} icon='filter' 
                    floating labeled button className='icon' 
                    search multiple selection clearable 
                    placeholder='Status'
                    options={statusCatOptions} value={statusCat}  onChange={(e, {value}) => setStatusCat(value)} />
            </div>
            <div style={{ height: '94%', }}>
                <ItemGroup divided style={{ height: '100%', overflow: 'auto', padding: '15px', }}>
                    {dispFilteredFavoriteJobs}
                </ItemGroup>
            </div>
        </div>
    );
}

export default FavoriteJobs;