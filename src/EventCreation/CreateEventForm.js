import { useContext } from "react";
import { Auth } from '../App.js';
import axios from "axios";

export default function CreateEventForm() {
  const auth = useContext(Auth);

  return (
    <div className='modal-content'>
      Event Creation Form
    </div>
  );
}