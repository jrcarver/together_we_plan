import { useState } from "react";
import { Button } from "react-bootstrap";
import ThingsToDo from './ThingsToDo.js';

export default function ThingsToDoButton() {
  const [displayForm, setDisplayForm] = useState(false, null);

  function showForm() {
    setDisplayForm(!displayForm);
  }

  function clickOutside(event) {
    if (event.target.className === 'modal') {
      showForm();
    }
  }

  return (
    <div>
      <Button className='button' onClick={() => showForm()}>Things To Do!</Button>
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <ThingsToDo />
        </div>
      )}
    </div>
  );
}