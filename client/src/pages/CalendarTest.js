import Fullcalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


function CalendarTest() {
    const fullCalEvent = [
        {
            // id: 
            // groupId:
            title: 'The Title', 
            start: '2024-03-25T09:00:00', 
            end: '2024-03-25T17:00:00', 
            overlap: true,
            color: 'green',
        },
        {
            title: 'The Title2',
            // start: '2024-03-25T10:30:00',
            // end: '2024-03-25T13:00:00',
            daysOfWeek: [1,2],
            startTime: '10:30',
            endTime: '13:00',
            startRecur: '2024-03-25',
            endRecur: '2024-03-30',
            editable: false,    // => There must be a eventhandler prop to register an event handler
            overlap: true,
            color: 'blue',
        },


    ];

    function handleEventChange(e) {
        console.log("in handleEventChange, e: ", e);
    }

    return (
        <>
            <h1>Welcome~</h1>
            <Fullcalendar 
                plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]} 
                initialView={'dayGridMonth'}
                headerToolbar={{
                    start: 'today prev,next',
                    center: 'title',
                    end: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                // weekends={false} 
                slotMinTime={'09:00:00'} 
                slotMaxTime={'18:00:00'} 
                scrollTime={'09:00:00'} 
                events={fullCalEvent} 
                height={'90vh'} 
                eventChange={handleEventChange}
            />
        </>
    );
}

export default CalendarTest;

// timGridDay
// timeGridWeek