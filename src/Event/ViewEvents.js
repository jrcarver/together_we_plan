import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import EditEvent from './EditEvent';
import RSVP from './RSVP';

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
      axios.post(`${auth.backend}/get-all-users`, {}),
      axios.post(`${auth.backend}/get-attendees`, {
        user_id: auth.userId
      })
    ])
    .then(responses => {
      const [events, friends, users, attendees] = responses;
      
      for (const event of events.data) {
        const event_attendees = attendees.data.filter((attendee) => attendee.event_id === event.id);
        event['attendees'] = event_attendees;
      }

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
              {Object.keys(event.user_ids).length > 1 &&
                <div>
                  <p>Attendees:</p>
                  {event.attendees.map((attendee, attendee_index) => {
                    if (attendee.user_id === auth.userId) {
                      return null; // skip
                    }

                    return(
                      <div className='input-line' key={attendee_index} style={{'justifyContent': 'space-between'}}>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;{getFriend(attendee.user_id)}</p>
                        <p>{attendee.status}</p>
                      </div>
                    )
                  })}
                </div>
              }
              {event.start_time &&
                <p>Start Time: {event.start_time}</p>
              }
              {event.end_time &&
                <p>End Time: {event.end_time}</p>
              }
              {event.location &&
                <p>Location: {event.location}</p>
              }
              {event.description &&
                <p>Description: {event.description}</p>
              }
              {event.owner_id !== auth.userId &&
                <RSVP event_id={event.id}/>
              }
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