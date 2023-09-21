import { useState } from "react";
import { Button } from "react-bootstrap";
import ViewFriends from "./ViewFriends";

export default function FriendsButton() {
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
      <Button className='button' onClick={() => showForm()}>Friends</Button>
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <ViewFriends />
        </div>
      )}
    </div>
  );
}