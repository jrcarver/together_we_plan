import { useState, useEffect, useContext } from "react";
import { Auth } from "../MainPage";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

export default function AddTimes(props) {
  const auth = useContext(Auth);

  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [event_id, setEventId] = useState(props.event_id ? props.event_id : null);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    axios.post(`${auth.backend}/get-times`, {
      event_id: event_id
    })
    .then((response) => {
      setTimes(response.data);
    })
  }, [])

  function addTime() {
    if (start_time) {
      const timeData = {
        id: null,
        event_id: event_id,
        user_id: auth.user_id,
        start_time: start_time,
        end_time: end_time
      }
      setTimes([...times, timeData]);
      props.addTime(timeData);

      setStartTime('');
      setEndTime('');
    }
  }

  function removeTime(time) {
    setTimes(times.filter(currentTime => currentTime != time));
    props.removeTime(time);
  }

  return (
    <div className='vertical'>
      <p style={{'marginBottom': '0px'}}>Time Suggestions:</p>
      <div className="input-line" style={{'margin': '0px'}}>
        <p style={{'margin': '0px'}}>&nbsp;&nbsp;&nbsp;&nbsp;Start Time: </p>
        <ReactDatePicker
          className='simple-text-input'
          style={{'margin': '0px'}}
          placeholderText="Select start date and time"
          selected={start_time}
          onChange={date => setStartTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </div>
      <div className="input-line" style={{'margin': '0px'}}>
        <p style={{'margin': '0px'}}>&nbsp;&nbsp;&nbsp;&nbsp;End Time: </p>
        <ReactDatePicker
          className='simple-text-input' 
          style={{'margin': '0px'}}
          placeholderText="Select end date and time"
          selected={end_time}
          onChange={date => setEndTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </div>
      <Button className='button' onClick={addTime}>
        Add Time
      </Button>
      {times.map((time, index) => {
        return (
          <div key={index}>
            <div className='input-line' style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
              <p style={{'margin': '5px'}}>Start: {time.start_time.toLocaleString()}</p>
              <Button className='accept' onClick={() => removeTime(time)} style={{'fontSize': '1em'}}>
                &times;
              </Button>
            </div>
            {time.end_time &&
              <p style={{'margin': '5px'}}>&nbsp;&nbsp;&nbsp;&nbsp;End: {time.end_time.toLocaleString()}</p>
            }
          </div>
        )
      })}
    </div>
  );
}