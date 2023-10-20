import { useState, useEffect, useContext } from 'react';
import { Auth } from '../MainPage';
import { Button } from 'react-bootstrap';
import axios from 'axios';

export default function AddActivities(props) {
  const auth = useContext(Auth);

  const [activities, setActivities] = useState(['hello']);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [event_id, setEventId] = useState(props.event_id ? props.event_id : null);

  useEffect(() => {
    axios.post(`${auth.backend}/get-activities`, {
      event_id: event_id
    })
    .then((response) => {
      setActivities(response.data);
    })
  }, [])
  
  function addActivity() {
    if (name) {
      const activityData = {
        id: null,
        user_id: auth.userId,
        activity: name,
        description: description
      }
      setActivities([...activities, activityData]);
      props.addActivity(activityData);

      setName('');
      setDescription('');
    }
  }

  function removeActivity(activity) {
    setActivities(activities.filter(currentActivity => currentActivity != activity));
    props.removeActivity(activity);
  }

  function addVote(activity) {
    axios.post(`${auth.backend}/add-activity-vote`, {
      activity_id: activity,
      user_id: auth.userId,
      event_id: props.event_id
    })
    .catch((error) => console.error("Error adding vote: ", error));
  }

  return (
    <div className='vertical'>
      <p style={{'marginTop': '10px', 'marginBottom': '0px'}}>Activity Suggestions:</p>
      <input
        className='simple-text-input'
        style={{'marginLeft': '5px'}}
        type='text'
        placeholder='Activity'
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className='text-area'
        style={{'marginLeft': '5px'}}
        type='text'
        placeholder='Activity description'
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <Button className='button' onClick={addActivity}>
        Add Activity
      </Button>
      {activities.map((activity, index) => {
          return (
            <div key={index}>
              <div className='input-line' style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
                <p style={{'margin': '5px'}}><u>{activity.activity}</u></p>
                <Button className='accept' onClick={() => removeActivity(activity)} style={{'fontSize': '1em'}}>
                  &times;
                </Button>
              </div>
              {activity.description &&
                <p style={{'margin': '5px'}}>{activity.description}</p>
              }
            </div>
          );
        })
      }
    </div>
  );
}