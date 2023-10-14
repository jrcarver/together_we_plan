import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';

export default function ViewEvents() {
  const auth = useContext(Auth);

  const [events, setEvents] = useState([]);
  const [counter, setCounter] = useState(0); // makes the page rerender when it changes
  const [friends, setFriends] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-events`, {
        user_id: auth.userId
      }),
      axios.post(`${auth.backend}/get-friends`, {
        user_id: auth.userId
      })
    ])
    .then(responses => {
      const [events, friends] = responses;
      setEvents(events.data);
      setFriends(friends.data);
    })
    .catch(error => {
      console.error('Error fetching events or friends: ', error)
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
    .catch(error => console.error('Error deleting event: ', error));
  }

  function getFriend(user_id) {
    const friend = friends.filter(friend => friend.id === user_id);
    return (friend[0].alias ? friend[0].alias : friend[0].name);
  }

  return (
    <div className="modal-content">
      <h2>Events</h2>
      {events.map((event, index) => (
        <div className='event' key={index}>
          <div className='event-name'>
            <h3><u>{event.name}</u></h3>
            <Button className='accept' onClick={() => deleteEvent(event.id)} style={{'fontSize': '1em'}}>&times;</Button>
          </div>
          <p>Attendees:</p>
          {event.user_ids.map((user_id, event_index) => {
            if (user_id === auth.userId) {
              return null; // skip
            }

            return(
              <div key={event_index}>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;{getFriend(user_id)}</p>
              </div>
            )
          })}
          <p>Start Time: {event.start_time}</p>
          <p>End Time: {event.end_time}</p>
          <p>Location: {event.location}</p>
          <p>Description: {event.description}</p>
        </div>
      ))}
    </div>
  );
}