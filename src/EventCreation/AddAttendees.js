import { useState, useEffect, useContext } from 'react';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function AddAttendees(props) {
  const auth = useContext(Auth);

  const [attendees, setAttendees] = useState([]);
  const [friends, setFriends] = useState(null);

  useEffect(() => {
    axios.post(`${auth.backend}/get-friends`, {
      user_id: auth.userId
    })
    .then(response => {
      setFriends(response.data);
    })
  }, [auth.backend, auth.userId]);

  function addAttendee(event) {
    const email = event.target.value;
    const newAttendee = friends.filter(friend => friend.email === email);
    const newAttendees = [...attendees, newAttendee[0]];
    setAttendees(newAttendees);
    props.change(newAttendees);
  }

  function removeAttendee(user) {
    const newAttendees = attendees.filter(attendee => attendee !== user);
    setAttendees(newAttendees);
    props.change(newAttendees);
  }

  return (
    <div>
      <div className='input-line' style={{'width': '100%'}}>
        <p>Attendees: </p>
        <div>
          <select className='simple-text-input' value='Choose friends to add' onChange={addAttendee} >
            <option hidden disabled>
              Choose friends to add
            </option>
            {friends && friends.map((friend, index) => {
              if (!attendees.includes(friend)){
                return (
                  <option key={index} value={friend.email}>{friend.alias ? friend.alias : friend.name}</option> 
                );
              }
            })}
          </select>
        </div>
      </div>
      {attendees.map((attendee, index) => {
        return (
          <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}} key={index}>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;{attendee.alias ? attendee.alias : attendee.name}</p>
            <Button className='accept' onClick={() => removeAttendee(attendee)} style={{'fontSize': '1em'}}>&times;</Button>
          </div>
        );
      })}
    </div>
  );
}