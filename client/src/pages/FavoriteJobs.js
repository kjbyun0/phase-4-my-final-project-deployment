import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, ItemMeta, ItemExtra, 
    Label, Dropdown, Button, IconGroup, Icon, } from 'semantic-ui-react';

function FavoriteJobs() {
    const { userAccount } = useOutletContext();
    const [ favoriteJobs, setFavoriteJobs ] = useState([]);
    const [ statusCat, setStatusCat ] = useState([]);

    const statusCatOptions = [
        { key: 'open', text: 'Open', value: 'Open'}, 
        { key: 'applied', text: 'Applied', value: 'Applied',},
        { key: 'review', text: 'In Review', value: 'In Review',},
        { key: 'hired', text: 'Hired', value: 'Hired',},
        { key: 'declinded', text: 'Closed', value: 'Closed',},
    ];

    //RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/')
    } else 
        navigate('/signin');

    useEffect(() => {
        fetch('/favoritejobs/uid')
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
        if (job.status === 'Open' || job.status === 'Applied') 
            navigate(`/job_applications/${job.job_posting_id}`)
    }

    function handleFavoriteDeleteClick(id) {
        fetch(`/favoritejobs/uid/${id}`, {
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok) {
                setFavoriteJobs(favoriteJobs.filter(job => job.id !== id));
            } else if (r.status === 403) {
                // => It can't be reached. If this popup shows up, then there is a hole for an employer to acess favorites...
                alert("You are signed in with your employer account. Please, sign in again.")
            } else if (r.status === 401) {
                // => It can't be reached because, if not signed up, favorite jobs can't be shown.
                alert("Please, sign in before adding it to your favorite jobs.");
                navigate('/signin');
            }
        })
    }

    const favoriteJobsStatus = favoriteJobs.map(fjob => {
        const app = fjob.applicant.job_applications.find(app => app.job_posting_id === fjob.job_posting_id);

        let status;
        if (fjob.job_posting.status === 'open') {
            status = app ? 'Applied' : 'Open';
        } else if (fjob.job_posting.status === 'review') {
            status = app ? 'In review' : 'Closed';
        } else {
            status = app ? (app.status === 'hired' ? 'Hired' : 'Closed') : 'Closed';
        }
        
        return ({
            ...fjob,
            status: status,
        });
    });
    console.log("in FavoriteJobs, favoriteJobsStatus: ", favoriteJobsStatus);

    const filterFavoriteJobs = 
        statusCat.length === 0 ? 
        favoriteJobsStatus : 
        favoriteJobsStatus.filter(fjob => statusCat.includes(fjob.status));

    const dispFilteredFavoriteJobs = filterFavoriteJobs.map(fjob => {
        let statusIcon, statusColor;
        switch (fjob.status) {
            case 'Open':
                statusIcon = 'info circle'; statusColor = 'dodgerblue';
                break;
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
            <Item key={fjob.id} 
                className={(fjob.status === 'Open' || fjob.status === 'Applied') ? 'pointerCursor' : null} 
                onClick={() => handleItemClick(fjob)}>
                <Button basic circular size='small' compact icon='trash alternate outline'
                    style={{alignSelf: 'center', marginRight: '20px', }} 
                    onClick={() => handleFavoriteDeleteClick(fjob.id)} />
                <ItemContent>
                    <ItemHeader>{fjob.job_posting.title}</ItemHeader>
                    <ItemMeta>{fjob.job_posting.employer.name}</ItemMeta>

                    <ItemExtra>
                        <Label style={{ background: statusColor, }} icon={statusIcon} content={fjob.status}/>
                    </ItemExtra>
                </ItemContent>
            </Item>
        );
    });

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '20% 1fr 20%', 
            gridTemplateRows: 'max-content 1fr', 
            gridTemplateAreas: 
                "'leftMargin filterBar rightMargin' \
                'leftMargin list rightMargin'"}}>
            <div style={{gridArea: 'leftMargin', background: 'lightgray', }} />
            <div style={{gridArea: 'filterBar', margin: '5px 0', }}>
                <Dropdown style={{ float: 'right', }} icon='filter' 
                    floating labeled button className='icon' 
                    search multiple selection clearable 
                    placeholder='Status'
                    options={statusCatOptions} value={statusCat}  onChange={(e, {value}) => setStatusCat(value)} />
            </div>
            <div style={{gridArea: 'list', overflow: 'auto', }}>
                <ItemGroup divided style={{ padding: '15px', }}>
                    {dispFilteredFavoriteJobs}
                </ItemGroup>
            </div>
            <div style={{gridArea: 'rightMargin', background: 'lightgray', }} />
        </div>
    );
}

export default FavoriteJobs;
