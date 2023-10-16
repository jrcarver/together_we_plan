import { useContext, useState, useEffect } from "react";
import { Auth } from '../MainPage';
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddAttendees from "../EventCreation/AddAttendees";

export default function EditEvent(props) {
  const auth = useContext(Auth);

  const [name, setName] = useState('');
  const [user_ids, setUserIds] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.post(`${auth.backend}/get-event`, {
      event_id: props.eventId
    })
    .then(response => {
      setName(response?.data?.name || '');
      setUserIds(response?.data?.user_ids || []);
      setLoading(false);
      setStartTime(response?.data?.start_time ? new Date(response.data.start_time) : null);
      setEndTime(response?.data?.end_time ? new Date(response.data.end_time) : null);
      setLocation(response?.data?.location || '');
      setDescription(response?.data?.description || '');
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
      name: name,
      start_time: iso_start,
      end_time: iso_end,
      location: location,
      description: description,
      user_ids: user_ids
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
        <div className="input-line">
          <p>Start Time: </p>
          <ReactDatePicker
            className='simple-text-input'
            placeholderText="Select start date and time"
            selected={start_time}
            onChange={date => setStartTime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        </div>
        <div className="input-line">
          <p>End Time: </p>
          <div>
            <ReactDatePicker
              className='simple-text-input' 
              placeholderText="Select end date and time"
              selected={end_time}
              onChange={date => setEndTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </div>
        </div>
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
        <div style={{'display': 'flex', 'justifyContent': 'center'}}>
          <Button className='button' type='submit'>
            Edit Event
          </Button>
        </div>
      </form>
    </div>
  );
}