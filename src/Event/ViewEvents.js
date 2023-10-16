import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import EditEvent from './EditEvent';

export default function ViewEvents(props) {
  const auth = useContext(Auth);

  const [events, setEvents] = useState([]);
  const [counter, setCounter] = useState(0); // makes the page rerender when it changes
  const [friends, setFriends] = useState(null);
  const [users, setUsers] = useState(null);
  const [displayEdit, setDisplayEdit] = useState(false);
  const [editEventId, setEditEventId] = useState('');

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-events`, {
        user_id: auth.userId
      }),
      axios.post(`${auth.backend}/get-friends`, {
        user_id: auth.userId
      }),
      axios.post(`${auth.backend}/get-all-users`, {})
    ])
    .then(responses => {
      const [events, friends, users] = responses;
      setEvents(events.data);
      setFriends(friends.data);
      setUsers(users.data);
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

  function editEvent(event_id) {
    setEditEventId(event_id);
    setDisplayEdit(true);
  }

  function clickOutside(event) {
    if (event.target.className === 'modal') {
      event.stopPropagation(); // stop event from reaching parent modal
      setDisplayEdit(false);
    }
  }

  function closeEditModal() {
    setDisplayEdit(false);
    setCounter(counter + 1);
  }

  function getFriend(user_id) {
    var friend = friends.filter(friend => friend.id === user_id);
    if (!friend[0]) {
      friend = users.filter(user => user.id === user_id);
    }
    return (friend[0].alias ? friend[0].alias : friend[0].name);
  }

  return (
    <div>
      {!displayEdit &&
        <div className="modal-content">
          <h2>Events</h2>
          {events.map((event, index) => (
            <div className='event' key={index}>
              <div className='event-name'>
                <h3><u>{event.name}</u></h3>
                {event.owner_id === auth.userId &&
                  <div>
                    <Button className='accept' onClick={() => editEvent(event.id)} style={{'fontSize': '0.8em', 'marginRight': '5px'}}>&#x270E;</Button>
                    <Button className='accept' onClick={() => deleteEvent(event.id)} style={{'fontSize': '1em'}}>&times;</Button>
                  </div>
                }
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
      }
      {displayEdit && 
        <div className='modal' onClick={clickOutside}>
          <EditEvent eventId={editEventId} closeEditModal={closeEditModal} />
        </div>
      }
    </div>
  );
}