import { useState } from "react";
import { Button } from "react-bootstrap";
import ViewProfile from "./ViewProfile";

export default function ProfileButton() {
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
      <Button className='button' onClick={() => showForm()}>Profile</Button>
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <ViewProfile />
        </div>
      )}
    </div>
  );
}