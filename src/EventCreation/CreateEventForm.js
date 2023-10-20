import { useContext, useState } from "react";
import { Auth } from '../MainPage';
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddAttendees from "./AddAttendees";
import AddActivities from "../Activities/AddActivities";
import AddTimes from "../Times/AddTimes";

export default function CreateEventForm(props) {
  const auth = useContext(Auth);

  const [name, setName] = useState('');
  const [user_ids, setUserIds] = useState([auth.userId]);
  const [start_time, setStartTime] = useState(null);
  const [end_time, setEndTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [resetAttendees, setResetAttendees] = useState(false);
  const [timeInput, setTimeInput] = useState(true);
  const [timeVoting, setTimeVoting] = useState(true);
  const [activityInput, setActivityInput] = useState(true);
  const [activityVoting, setActivityVoting] = useState(true);
  const [activities, setActivities] = useState([]);

  function createEvent(e) {
    e.preventDefault();

    // var iso_start;
    // var iso_end;

    // if (start_time) {
    //   iso_start = start_time.toISOString();
    // }
    // if (end_time) {
    //   iso_end = end_time.toISOString();
    // }

    const eventData = {
      owner_id: auth.userId,
      user_ids: user_ids,
      name: name,
      start_time: null,
      end_time: null,
      location: location,
      description: description,
      allow_time_input: timeInput,
      allow_time_voting: timeVoting,
      allow_activity_input: activityInput,
      allow_activity_voting: activityVoting,
      activities: activities,
      times: times
    }

    axios.post(`${auth.backend}/create-event`, eventData)
    .then(response => {
      setName('');
      setUserIds([auth.userId]);
      setStartTime(null);
      setEndTime(null);
      setLocation('');
      setDescription('');
      
      // Toggle the resetAttendees state
      setResetAttendees(prev => !prev);

      props.closeForm();
    })
    .catch(error => {
      console.error('Error creating event:', error);
    });
  }
  
  function changeAttendees(attendees) {
    var newAttendees = [];
    for (const attendee of attendees) {
      newAttendees = [...newAttendees, attendee.id];
    }
    setUserIds(newAttendees);
  }

  function changeActivities(new_activity) {
    setActivities([...activities, new_activity]);
  }

  function removeActivity(activity) {
    setActivities(activities.filter(currentActivity => currentActivity !== activity));
  }

  function changeTimes(new_time) {
    setTimes([...times, new_time])
  }

  function removeTime(time) {
    setTimes(times.filter(currentTime => currentTime !== time));
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
      <h2>Event Creation</h2>
      <div className='required-line'><p className='required'>* </p> = required</div>
      <form onSubmit={createEvent}>
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
        <AddAttendees change={changeAttendees} attendees={user_ids} reset={resetAttendees} />
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
        <AddTimes addTime={changeTimes} removeTime={removeTime} />
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
          <p style={{'marginBottom': '5px'}}>Description: </p>
          <textarea
            className='text-area'
            style={{'margin': '5px'}}
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
        <AddActivities addActivity={changeActivities} removeActivity={removeActivity} />
        <div style={{'display': 'flex', 'justifyContent': 'center'}}>
          <Button className='button' type='submit'>
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}