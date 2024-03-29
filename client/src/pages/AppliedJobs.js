import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ItemGroup, Item, ItemContent, ItemHeader, 
    ItemMeta, ItemDescription, ItemExtra, Label } from 'semantic-ui-react';


function AppliedJobs() {
    const { userAccount } = useOutletContext();
    const [ appliedList, setAppliedList ] = useState([]);

    //RBAC
    const navigate = useNavigate();
    if (userAccount) {
        if (!userAccount.applicant) 
            navigate('/')
    } else 
        navigate('/signin');

    useEffect(() => {
        fetch(`/jobapplications/${userAccount.applicant_id}`)
        .then(r => r.json())
        .then(data => setAppliedList(data));
    }, []);

    console.log('in AppliedJobs, appliedList: ', appliedList);

        // thumbs up outline
        // trophy
        // search
        // hourglass outline
        // spinner
        // lock
        // remove circle
        // times rectangle

    const dispJobAppliedList = appliedList.map(app => {
        const status = app.status === 'new' ? 'Being reviewed' : 
            app.status === 'accepted' ? 'Hired' : 'Closed'
        const statusIcon = app.status === 'new' ? 'spinner' : 
            app.status === 'accepted' ? 'thumbs up outline' : 'remove circle'
        return (
            <Item key={app.id}>
                <ItemContent>
                    <ItemHeader>{app.job_posting.title}</ItemHeader>
                    <ItemMeta>{app.job_posting.employer.name}</ItemMeta>
                    {/* <ItemDescription>Job type: {app.job_posting.job_category}</ItemDescription>
                    <ItemDescription>Pay: {app.job_posting.salary}/hr</ItemDescription>
                    <ItemDescription>Remote: {app.job_posting.remote}</ItemDescription> */}
                    <ItemExtra>
                        <Label icon={statusIcon} content={status} />
                    </ItemExtra>
                </ItemContent>
            </Item>
        );
    });

    // const dispTestMsg = [];
    // for (let i = 0; i < 100; i++) {
    //     dispTestMsg.push(<p>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</p>);
    // }

    console.log('in AppliedJobs, dispJobAppliedList: ', dispJobAppliedList);
    
    return (
        <div style={{ display: 'flex', flexFlow: 'row', height: '100%', overflow: 'hidden'}}>
            <div sytle={{flex: '1 1', height: '100%', overflowY: 'scroll'}}>
                <ItemGroup divided >
                    {dispJobAppliedList}
                </ItemGroup>
                {/* {dispTestMsg} */}
            </div>
            {/* <div style={{flex: '1 1', height: '100%', overflowY: 'scroll'}}>
                <p>testing</p>
            </div> */}
        </div>
    );
}

export default AppliedJobs;