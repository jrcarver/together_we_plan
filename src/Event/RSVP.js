import { Button } from "react-bootstrap";
import { useState, useEffect, useContext } from 'react';
import { Auth } from "../MainPage";
import axios from "axios";

export default function RSVP(props) {
  const auth = useContext(Auth);

  const quaternary_color = getComputedStyle(document.documentElement)
    .getPropertyValue('--quaternary-color')
    .trim();

  const [status, setStatus] = useState('pending');

  useEffect(() => {
    axios.post(`${auth.backend}/get-user-attendance`, {
      user_id: auth.userId,
      event_id: props.event_id
    })
    .then(response => {
      setStatus(response.data.status);
    })
    .catch(error => console.error('Error getting event status: ', error.response.data));
  }, []);

  function changeStatus(newStatus) {
    axios.post(`${auth.backend}/change-attendee-status`, {
      user_id: auth.userId,
      event_id: props.event_id,
      status: newStatus != status ? newStatus : 'pending'
    })
    .then(response => {
      setStatus(newStatus != status ? newStatus : 'pending');
    })
    .catch(error => console.error('Error changing attendee status: ', error.response.data));
  }

  return (
    <div className='input-line'>
      <p>RSVP:</p>
      <Button className='accept' style={status=='yes' ? {'backgroundColor': quaternary_color} : {}} onClick={() => changeStatus('yes')}>Yes</Button>
      <Button className='accept' style={status=='maybe' ? {'backgroundColor': quaternary_color} : {}} onClick={() => changeStatus('maybe')}>Maybe</Button>
      <Button className='accept' style={status=='no' ? {'backgroundColor': quaternary_color} : {}} onClick={() => changeStatus('no')}>No</Button>
    </div>
  );
}