import { useContext, useState, useEffect } from "react";
import { Auth } from './App.js';
import axios from 'axios';
import Cookies from 'js-cookie';
import CreateEventButton from "./EventCreation/CreateEventButton.js";
import ViewEventsButton from "./Event/ViewEventsButton.js";

export default function MainPage(props) {
  const auth = useContext(Auth);

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth.userId){
      axios.post(`${auth.backend}/user/${auth.token}`, {
        token: auth.token,
        email: auth.email,
        name: auth.name
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching/creating user data: ', error))
    }
    else {
      axios.get(`${auth.backend}/userId/${auth.userId}`)
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching/creating user data: ', error))
    }
  }, [auth.backend, auth.token, auth.email, auth.name, auth.userId]);

  if (!user) return <div>loading...</div>;

  Cookies.set('userId', user.id, { expires: 7 });

  return(
    <div className='wrapper'>
      <p>Hello {user.name}!</p>
      <CreateEventButton />
      <ViewEventsButton />
    </div>
  );
};