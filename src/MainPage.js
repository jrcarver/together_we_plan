import React, { useContext, useState, useEffect } from "react";
import { Auth0 } from './App.js';
import axios from 'axios';
import CreateEventButton from "./EventCreation/CreateEventButton.js";
import ViewEventsButton from "./Event/ViewEventsButton.js";
import ProfileButton from "./Profile/ProfileButton.js";
import FriendsButton from "./Friends/FriendsButton.js";

export const Auth = React.createContext();

export default function MainPage(props) {
  const auth0 = useContext(Auth0);

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [alias, setAlias] = useState('');

  const backend = 'http://localhost:5000';
  
  useEffect(() => {
    if (!auth0.userId){
      axios.post(`${auth0.backend}/user/${auth0.token}`, {
        token: auth0.token,
        email: auth0.email,
        name: auth0.name
      })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching/creating user data: ', error))
    }
    else {
      axios.get(`${auth0.backend}/userId/${auth0.userId}`)
      .then(response => (
        setUser(response.data),
        setName(response.data.name),
        setEmail(response.data.email),
        setUserId(response.data.id),
        setAlias(response.data.alias)
      ))
      .catch(error => console.error('Error fetching/creating user data: ', error))
    }
  }, [auth0.backend, auth0.token, auth0.email, auth0.name, auth0.userId]);

  if (!user) return <div>loading...</div>;

  props.setUserId(user.id);

  return(
    <Auth.Provider value={{ backend, name, email, userId, alias }}>
      <div className='wrapper'>
        <p>Hello {alias ? alias : user.name}!</p>
        <CreateEventButton />
        <ViewEventsButton />
        <FriendsButton />
        <ProfileButton />
      </div>
    </Auth.Provider>
  );
};