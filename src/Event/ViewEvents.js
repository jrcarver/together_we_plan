import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';

export default function ViewEvents() {
  const auth = useContext(Auth);

  const [events, setEvents] = useState([]);
  const [counter, setCounter] = useState(0); // makes the page rerender when it changes

  useEffect(() => {
    axios.post(`${auth.backend}/get-events`, {
      user_id: auth.userId
    })
    .then(response => {
      setEvents(response.data)
    })
    .catch(error => {
      console.error('Error fetching events: ', error)
    })
  }, [auth.backend, auth.userId, counter]);
  
  function deleteEvent(event_id) {
    axios.post(`${auth.backend}/delete-event`, {
      user_id: auth.userId,
      event_id: event_id
    })
    .then(response => {
      setCounter(counter + 1);
    })
    .catch(error => console.error('Error deleting event: ', error))
  }

  return (
    <div className="modal-content">
      <h2>Events</h2>
      {events.map(event => (
        <div className='event'>
          <div className='event-name'>
            <h3><u>{event.name}</u></h3>
            <Button className='accept' onClick={() => deleteEvent(event.id)} style={{'fontSize': '1em'}}>&times;</Button>
          </div>
          <p>Start Time: {event.start_time}</p>
          <p>End Time: {event.end_time}</p>
          <p>Location: {event.location}</p>
          <p>Description: {event.description}</p>
        </div>
      ))}
    </div>
  );
}