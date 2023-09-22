import { useContext, useState } from 'react';
import { Auth } from '../MainPage';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Friends from './Friends';

export default function ViewFriends() {
  const auth = useContext(Auth);

  const [counter, setCounter] = useState(0); // makes the page rerender when it changes
  const [email, setEmail] = useState('');

  function addFriend(e) {
    e.preventDefault();
    axios.post(`${auth.backend}/add-friend`, {
      user_id: auth.userId,
      friend_email: email
    })
    .then(response => {
      if (response.data.message) {
        setEmail('');
        setCounter(counter + 1);
      }
    })
    .catch(error => {
      console.error('Error sending friend request: ', error.response.data);
    });
  }

  return (
    <div className='modal-content'>
      <h2>My Friends</h2>
      <Friends rerender={counter}/>
      <form className='input-line' onSubmit={addFriend}>
        <input
          className='simple-text-input'
          type='email'
          placeholder='Add a friend by email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button className='button' type='submit'>
          Send Friend Request
        </Button>
      </form>
    </div>
  );
}