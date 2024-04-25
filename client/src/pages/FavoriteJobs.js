import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, ItemMeta, ItemExtra, 
    Label, Dropdown, Button, } from 'semantic-ui-react';

function FavoriteJobs() {
    const { userR, appFavJobsR, onSetAppFavJobsR, appJobAppsR } = useOutletContext();
    const [ statusCat, setStatusCat ] = useState([]);

    const statusCatOptions = [
        { key: 'open', text: 'Open', value: 'Open'}, 
        { key: 'applied', text: 'Applied', value: 'Applied',},
        { key: 'review', text: 'In Review', value: 'In Review',},
        { key: 'hired', text: 'Hired', value: 'Hired',},
        { key: 'declinded', text: 'Closed', value: 'Closed',},
    ];

    
    const navigate = useNavigate();
    useEffect(() => {
        if (userR && userR.employer)
            navigate('/signin');
    }, [userR]);

    // => This may be changed... app paramater already has everything to display
    function handleItemClick(fjob) {
        if (fjob.status === 'Open' || fjob.status === 'Applied') 
            navigate(`/job_applications/${fjob.job_posting_id}`)
    }

    function handleFavoriteDeleteClick(e, o, fjob) {
        // console.log('in handleFavoriteDeleteClick, e1: ', e1, ', e2: ', e2);
        e.stopPropagation();

        fetch(`/favoritejobs/${fjob.id}`, {
            method: 'DELETE',
        })
        .then(r => {
            if (r.ok) {
                onSetAppFavJobsR(appFavJobsR.filter(fj => fj.id !== fjob.id));
            } else {
                r.json().then(data => {
                    if (r.status === 401 || r.status === 403) {
                        console.log(data);
                        alert(data.message);
                    } else {
                        console.log('Server Error - Deleting Favorite Job: ', data);
                        alert(`Server Error - Deleting Favorite Job: ${data.message}`);
                    }
                });
            }
        });
    }

    const favoriteJobsStatus = appFavJobsR.map(fjob => {
        const app = appJobAppsR.find(app => app.job_posting_id === fjob.job_posting_id);

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
        let statusIcon='', statusColor='';
        switch (fjob.status) {
            case 'Open':
                statusIcon = 'info circle'; statusColor = 'dodgerblue';
                break;
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
            <Item key={fjob.id} style={{padding: '15px',}} 
                className={(fjob.status === 'Open' || fjob.status === 'Applied') ? 'pointerCursor' : null} 
                onClick={() => handleItemClick(fjob)}>
                <ItemContent>
                    <ItemHeader>{fjob.job_posting.title}</ItemHeader>
                    <ItemMeta>{fjob.job_posting.employer.name}</ItemMeta>

                    <ItemExtra>
                        <Label style={{ background: statusColor, }} icon={statusIcon} content={fjob.status}/>
                    </ItemExtra>
                </ItemContent>
                <Button basic circular size='small' compact icon='trash alternate outline'
                    style={{alignSelf: 'center', }} 
                    onClick={(e, o) => handleFavoriteDeleteClick(e, o, fjob)} />
            </Item>
        );
    });

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateColumns: '20% 1fr 20%', 
            gridTemplateRows: 'max-content 1fr', 
            gridTemplateAreas: 
                "'leftMargin filterBar rightMargin' 'leftMargin list rightMargin'"}}>
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
