import { useContext, useState } from 'react';
import { Auth } from '../App';
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function ViewProfile() {
  const auth = useContext(Auth);

  const [email, setEmail] = useState('');

  function addFriend() {
    axios.post(`${auth.backend}/add-friend`, {
      user_id: auth.userId,
      friend_email: email
    })
    .then(response => {
      if (response.data.message) {
        setEmail('');
      }
    })
    .catch(error => {
      console.error('Error sending friend request: ', error.response.data);
    });
  }

  return (
    <div className='modal-content'>
      Profile
    </div>
  );
}