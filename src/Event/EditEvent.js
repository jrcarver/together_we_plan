import { useContext, useState, useEffect } from "react";
import { Auth } from '../MainPage';
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddAttendees from "../EventCreation/AddAttendees";
import AddActivities from "../Activities/AddActivities";
import AddTimes from "../Times/AddTimes";

export default function EditEvent(props) {
  const auth = useContext(Auth);

  const [name, setName] = useState('');
  const [user_ids, setUserIds] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeInput, setTimeInput] = useState('');
  const [timeVoting, setTimeVoting] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [activityVoting, setActivityVoting] = useState('');
  const [activities, setActivities] = useState([]);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-event`, {
        event_id: props.eventId
      }),
      axios.post(`${auth.backend}/get-activities`, {
        event_id: props.eventId
      }),
      axios.post(`${auth.backend}/get-times`, {
        event_id: props.eventId
      })
    ])
    .then(response => {
      const [event, activities, times] = response;
      setName(event?.data?.name || '');
      setUserIds(event?.data?.user_ids || []);
      setLoading(false);
      setStartTime(event?.data?.start_time ? new Date(event.data.start_time) : null);
      setEndTime(event?.data?.end_time ? new Date(event.data.end_time) : null);
      setLocation(event?.data?.location || '');
      setDescription(event?.data?.description || '');
      setTimeInput(event?.data?.allow_time_input);
      setTimeVoting(event?.data?.allow_time_voting);
      setActivityInput(event?.data?.allow_activity_input);
      setActivityVoting(event?.data?.allow_activity_voting);
      setActivities(activities?.data || []);
      setTimes(times?.data || []);
   });
  }, [])

  function editEvent(e) {
    e.preventDefault();

    var iso_start;
    var iso_end;

    if (start_time) {
      iso_start = start_time.toISOString();
    }
    if (end_time) {
      iso_end = end_time.toISOString();
    }

    const eventData = {
      event_id: props.eventId,
      owner_id: auth.userId,
      user_ids: user_ids,
      name: name,
      start_time: iso_start,
      end_time: iso_end,
      times: times,
      location: location,
      description: description,
      allow_time_input: timeInput,
      allow_time_voting: timeVoting,
      allow_activity_input: activityInput,
      allow_activity_voting: activityVoting,
      activities: activities
    }

    axios.post(`${auth.backend}/edit-event`, eventData)
    .then(response => {
      props.closeEditModal();
    })
    .catch(error => {
      console.error('Error editing event:', error);
    });
  }
  
  function changeAttendees(attendees) {
    var newAttendees = [];
    for (const attendee of attendees) {
      newAttendees = [...newAttendees, attendee.id]
    }
    setUserIds(newAttendees);
  }

  function changeActivities(new_activity) {
    setActivities([...activities, new_activity]);
  }

  function removeActivity(activity) {
    setActivities(activities.filter(currentActivity => currentActivity.id !== activity.id));
  }

  function changeTimes(new_time) {
    setTimes([...times, new_time])
  }

  function removeTime(time) {
    setTimes(times.filter(currentTime => currentTime.id !== time.id));
  }

  function toggleTimeInput(event) {
    setTimeInput(event.target.checked);
  }

  function toggleTimeVoting(event) {
    setTimeVoting(event.target.checked);
  }

  function toggleActivityInput(event) {
    setActivityInput(event.target.checked);
  }

  function toggleActivityVoting(event) {
    setActivityVoting(event.target.checked);
  }

  return (
    <div className='modal-content'>
      <h2>Edit Event</h2>
      <div className='required-line'><p className='required'>* </p> = required</div>
      <form onSubmit={editEvent}>
        <div className='input-line'>
          <div className='required-line'><p className='required'>*</p>Event name: </div>
          <input
            className='simple-text-input'
            type='text'
            placeholder='Event name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        {!loading && 
          <AddAttendees change={changeAttendees} attendees={user_ids} />
        }
        <div className='input-line'>
          <input
            type='checkbox'
            checked={timeInput}
            onChange={toggleTimeInput}
          />
          Allow user input on times
        </div>
        <div className='input-line'>
          <input
            type='checkbox'
            checked={timeVoting}
            onChange={toggleTimeVoting}
          />
          Allow user voting on times
        </div>
        <AddTimes addTime={changeTimes} removeTime={removeTime} event_id={props.eventId} />
        <div className="input-line">
          <p>Location: </p>
          <input
            className='simple-text-input'
            type='text'
            placeholder='Event location'
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <div style={{'display': 'flex', 'flexDirection': 'column'}}>
          <p>Description: </p>
          <textarea
            className='text-area'
            placeholder='Event description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows='5'
          />
        </div>
        <div className='input-line'>
          <input
            type='checkbox'
            checked={activityInput}
            onChange={toggleActivityInput}
          />
          Allow user input on activities
        </div>
        <div className='input-line'>
          <input
            type='checkbox'
            checked={activityVoting}
            onChange={toggleActivityVoting}
          />
          Allow user voting on activities
        </div>
        <AddActivities addActivity={changeActivities} removeActivity={removeActivity} event_id={props.eventId} />
        <div style={{'display': 'flex', 'justifyContent': 'center'}}>
          <Button className='button' type='submit'>
            Edit Event
          </Button>
        </div>
      </form>
    </div>
  );
}