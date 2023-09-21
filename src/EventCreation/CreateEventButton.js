import { useState } from "react";
import { Button } from "react-bootstrap";
import CreateEventForm from "./CreateEventForm";

export default function CreateEventButton() {
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
      <Button className='button' onClick={() => showForm()}>Create an Event</Button>
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <CreateEventForm />
        </div>
      )}
    </div>
  );
}