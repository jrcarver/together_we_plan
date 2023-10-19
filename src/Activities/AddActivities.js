import { useState, useEffect, useContext } from 'react';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function AddActivities(props) {
  const auth = useContext(Auth);

  const [activities, setActivities] = useState([]);

  

  return (
    <div>
      Hello there!
    </div>
  );
}