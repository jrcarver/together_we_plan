import { useContext, useState, useEffect } from 'react';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function ViewProfile() {
  const auth = useContext(Auth);

  const [alias, setAlias] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setName(auth.name);
    setEmail(auth.email);
    setAlias(auth.alias);
  }, []);

  function changeAlias(e) {
    e.preventDefault();
    axios.post(`${auth.backend}/user-alias`, {
      user_id: auth.userId,
      alias: alias
    })
    .then(response => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error changing alias: ', error.response.data);
    });
  }

  return (
    <div className='modal-content'>
      <h2>Profile</h2>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <form className='input-line' onSubmit={changeAlias}>
        <p>Alias: </p>
        <input
          className='simple-text-input'
          type='alias'
          placeholder='Enter an alias your friends will know you by'
          value={alias}
          onChange={e => setAlias(e.target.value)}
        />
        <Button className='button' type='submit'>
          Change Alias
        </Button>
      </form>
    </div>
  );
}