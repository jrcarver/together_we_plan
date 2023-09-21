import { useState } from "react";
import { Button } from "react-bootstrap";
import ViewEvents from "./ViewEvents";

export default function ViewEventsButton() {
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
      <Button className='button' onClick={() => showForm()}>View Events</Button>
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <ViewEvents />
        </div>
      )}
    </div>
  );
}