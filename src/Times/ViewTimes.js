import { useState, useEffect, useContext } from "react";
import { Auth } from "../MainPage";
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ViewTimes(props) {
  const auth = useContext(Auth);

  const [times, setTimes] = useState([]);
  const [start_time, setStartTime] = useState(null);
  const [end_time, setEndTime] = useState(null);
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-times`, {
        event_id: props.event_id
      }),
      axios.post(`${auth.backend}/get-time-votes`, {
        event_id: props.event_id
      })
    ])
    .then((response) => {
      const [times, votes] = response;
      setTimes(times.data);
      setVotes(votes.data);
    })
    .catch((error) => console.error("Error getting times: ", error));
  }, []);

  function addTime() {
    if (start_time) {
      const timeData = {
        event_id: props.event_id,
        user_id: auth.userId,
        start_time: start_time,
        end_time: end_time
      }

      axios.post(`${auth.backend}/add-time`, timeData)
      .then((response) => {
        setTimes([...times, response.data]);

        setStartTime('');
        setEndTime('');
      })
      .catch((error) => console.error("Error adding time: ", error));
    }
  }

  function deleteTime(time) {
    axios.post(`${auth.backend}/delete-time`, {
      time_id: time.id  
    })
    .then((response) => {
      setTimes(times.filter(currentTime => currentTime != time));
    })
    .catch((error) => console.error("Error deleting time: ", error));
  }

  function vote(time) {
    if (votes.some(vote => vote.time_id === time.id && vote.user_id === auth.userId)) {
      removeVote(time);
    } else {
      addVote(time);
    }
  }

  function addVote(time) {
    axios.post(`${auth.backend}/add-time-vote`, {
      time_id: time.id,
      user_id: auth.userId,
      event_id: props.event_id
    })
    .then((response) => {
      setVotes([...votes, response.data]);
    })
    .catch((error) => console.error("Error adding vote: ", error));
  }

  function removeVote(time) {
    axios.post(`${auth.backend}/remove-time-vote`, {
      time_id: time.id,
      user_id: auth.userId,
      event_id: props.event_id
    })
    .then((response) => {
      setVotes(votes.filter(currentVote => currentVote.time_id !== time.id));
    })
    .catch((error) => console.error("Error removing vote: ", error));
  }

  return (
    <div>
      <div>
        {times.length != 0 &&
          <div>
            <p>Times:</p>
            {times.map((time, index) => (
              <div key={index} className="input-line" style={{'margin': '0px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
                <p style={{'margin': '5px'}}>{time.start_time} - {time.end_time}</p>
                <div style={{'display': 'flex', 'alignItems': 'center'}}>
                  {props.allow_time_voting &&
                    <div style={{'display': 'flex', 'alignItems': 'center', 'flexDirection': 'row'}}>
                      <p>{votes.filter(item => item.time_id === time.id).length}</p>
                      <Button 
                        className='accept' 
                        onClick={() => vote(time)} 
                        style={{'fontSize': '0.9em', 'margin': '5px', 'backgroundColor': votes.some(vote => vote.time_id === time.id && vote.user_id === auth.userId) ? 'rgb(0, 70, 3)' : ''}}
                      >
                        &#9733;
                      </Button>
                    </div>
                  }
                  {time.user_id == auth.userId && props.allow_time_input &&
                    <Button className='accept' onClick={() => deleteTime(time)} style={{'fontSize': '1em'}}>&times;</Button>
                  }
                </div>
              </div>
            ))}
          </div>
        }
      </div>
        {props.allow_time_input &&
          <div className='vertical'>
            <p style={{'marginBottom': '0px'}}>Add time: </p>
            <div style={{'border': '1px solid rgb(44, 44, 44)', 'borderRadius': '10px', 'padding': '0px'}}>
              <div className="input-line">
                <p>&nbsp;&nbsp;&nbsp;&nbsp;Start Time: </p>
                <ReactDatePicker
                  className='simple-text-input'
                  placeholderText="Select start date and time"
                  selected={start_time}
                  onChange={date => setStartTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
              <div className="input-line">
                <p>&nbsp;&nbsp;&nbsp;&nbsp;End Time: </p>
                <ReactDatePicker
                  className='simple-text-input'
                  placeholderText="Select end date and time"
                  selected={end_time}
                  onChange={date => setEndTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
            </div>
            <Button className='button' onClick={addTime}>Add Time</Button>
          </div>
      }
    </div>
  );
}