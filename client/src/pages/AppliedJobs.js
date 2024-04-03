import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, 
    ItemMeta, ItemDescription, ItemExtra, Label,
    Dropdown, } from 'semantic-ui-react';


function AppliedJobs() {
    const { userAccount } = useOutletContext();
    const [ appliedList, setAppliedList ] = useState([]);
    const [ statusCat, setStatusCat ] = useState([]);     // app.status options: new, accepted, rejected

    const statusCatOptions = [
        { key: 'new', text: 'Being reviewed', value: 'new',},
        { key: 'accepted', text: 'Hired', value: 'accepted',},
        { key: 'rejected', text: 'Closed', value: 'rejected',},
    ];

    //RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/')
    } else 
        navigate('/signin');

    useEffect(() => {
        fetch(`/jobapplications`)
        .then(r => {
            if (r.ok)
                r.json().then(data => setAppliedList(data));
            else {
                // => Error handling needed.
                // => check if the HTTP response code is 401. if it is the user needs to sign in... redirect to the sign in page.
            }
        })
    }, []);

    console.log('in AppliedJobs, appliedList: ', appliedList);

    function handleDropdownChange(e1, e2) {
        console.log(e1, e2);
        setStatusCat(e2.value);
    }

    const filterJobAppliedList = statusCat.length === 0 ? appliedList : appliedList.filter(app => statusCat.includes(app.status));
    const dispJobAppliedList = filterJobAppliedList.map(app => {
        let status = 'Being reviewed', statusIcon = 'spinner', statusColor = 'MistyRose';
        if  (app.status === 'accepted') {
            status = 'Hired';
            statusIcon = 'thumbs up outline';
            statusColor = 'LightGreen';
        } else if (app.status === 'rejected') {
            status = 'Closed';
            statusIcon = 'remove circle';
            statusColor = 'LightGrey';
        }

        return (
            <Item key={app.id} style={{padding: '15px',}}>
                <ItemContent>
                    <ItemHeader>{app.job_posting.title}</ItemHeader>
                    <ItemMeta>{app.job_posting.employer.name}</ItemMeta>
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

    console.log('in AppliedJobs, dispJobAppliedList: ', dispJobAppliedList);

    return (
        <>
            <Dropdown style={{ position: 'absolute', right: '20px', }} icon='filter' 
                floating labeled button className='icon' 
                search multiple selection clearable 
                options={statusCatOptions} value={statusCat}  onChange={handleDropdownChange} />
            <ItemGroup divided style={{ padding: '15px', }}>
                {dispJobAppliedList}
            </ItemGroup>
        </>

    );
}

export default AppliedJobs;