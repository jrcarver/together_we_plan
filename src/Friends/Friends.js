import { useEffect, useContext, useState } from "react";
import { Auth } from '../MainPage';
import axios from "axios";
import { Button } from "react-bootstrap";

export default function Friends(props) {
  const auth = useContext(Auth);

  const [counter, setCounter] = useState(0); // makes the page rerender when it changes
  const [friends, setFriends] = useState(null);
  const [pending_friends, setPendingFriends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-friends`, {
        user_id: auth.userId
      }),
      axios.post(`${auth.backend}/get-pending-friends`, {
        user_id: auth.userId
      })
    ])
    .then(responses => {
      const [response1, response2] = responses;
      setFriends(response1.data);
      setPendingFriends(response2.data);
      setLoading(false);
    })
    .catch(error => console.error('Error fetching friends data: ', error))
  }, [auth.backend, auth.userId, props.rerender, counter]);

  function removeFriend(friend_id) {
    axios.post(`${auth.backend}/remove-friend`, {
      user_id: auth.userId,
      friend_id: friend_id
    })
    .then(response => {
      setCounter(counter + 1);
    })
    .catch(error => console.error('Error removing friend: ', error))
  }

  function acceptRequest(friend_id) {
    axios.post(`${auth.backend}/accept-friend`, {
      user_id: auth.userId,
      friend_id: friend_id
    })
    .then(response => {
      setCounter(counter + 1);
    })
    .catch(error => console.error('Error accepting friend request: ', error))
  }

  function denyRequest(friend_id) {
    axios.post(`${auth.backend}/deny-friend`, {
      user_id: auth.userId,
      friend_id: friend_id
    })
    .then(response => {
      setCounter(counter + 1);
    })
    .catch(error => console.error('Error denying friend request: ', error))
  }

  return (
    <div>
      {loading ? (
        <div>loading...</div>
      ) : (
      <div>
        {friends.map((friend, friendIndex) => (
          <div className='friend' key={friendIndex}>
            <div>{friend.alias ? friend.alias : friend.name}</div>
            <Button className='accept' onClick={() => removeFriend(friend.id)} style={{'fontSize': '1em'}}>&times;</Button>
          </div>
        ))}
        {pending_friends.map((friend, friendIndex) => (
          <div className='friend' key={friendIndex}>
            <div>
              <div>{friend.user.alias ? friend.user.alias : friend.user.name}</div>
            </div>
            <div>
              {String(friend.waitingon) === String(auth.userId) ? (
                <div style={{'display': 'flex', 'gap': '5px', 'alignItems': 'center'}}>
                  <div>add friend?</div>
                  <Button className='accept' onClick={() => acceptRequest(friend.user.id)}>&#10003;</Button>
                  <Button className='accept' onClick={() => denyRequest(friend.user.id)} style={{'fontSize': '1em'}}>&times;</Button>
                </div>
              ) : (
                <div style={{'display': 'flex', 'gap': '5px', 'alignItems': 'center'}}>
                  <div>pending</div>
                  <Button className='accept' onClick={() => denyRequest(friend.user.id)} style={{'fontSize': '1em'}}>&times;</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}