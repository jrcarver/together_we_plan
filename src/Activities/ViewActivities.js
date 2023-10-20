import { useState, useEffect, useContext } from "react";
import { Auth } from "../MainPage";
import axios from "axios";
import { Button } from "react-bootstrap";

export default function ViewActivities(props) {
  const auth = useContext(Auth);

  const [activities, setActivities] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.post(`${auth.backend}/get-activities`, {
        event_id: props.event_id
      }),
      axios.post(`${auth.backend}/get-activity-votes`, {
        event_id: props.event_id
      })
    ])
    .then((response) => {
      const [activities, votes] = response;
      setActivities(activities.data);
      setVotes(votes.data);
    })
    .catch((error) => console.error("Error getting activities: ", error));
  }, []);

  function addActivity() {
    if(name) {
      const activityData = {
        event_id: props.event_id,
        user_id: auth.userId,
        activity: name,
        description: description
      }
  
      axios.post(`${auth.backend}/add-activity`, activityData)
      .then((response) => {
        setActivities([...activities, response.data]);
  
        setName('');
        setDescription('');
      })
      .catch((error) => console.error("Error adding activity: ", error));
    }
  }

  function deleteActivity(activity) {
    axios.post(`${auth.backend}/delete-activity`, {
      activity_id: activity.id  
    })
    .then((response) => {
      setActivities(activities.filter(currentActivity => currentActivity != activity));
    })
    .catch((error) => console.error("Error deleting activity: ", error));
  }

  function addVote(activity) {
    axios.post(`${auth.backend}/add-activity-vote`, {
      activity_id: activity.id,
      user_id: auth.userId,
      event_id: props.event_id
    })
    .then((response) => {
      setVotes([...votes, response.data]);
    })
    .catch((error) => console.error("Error adding vote: ", error));
  }

  return (
    <div>
      <div>
        {activities.length != 0 &&
          <div>
            <p>Activities:</p>
            {activities.map((activity, index) => (
              <div key={index}>
                <div className='input-line' style={{'margin': '0px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
                  <p style={{'margin': '5px'}}><u>{activity.activity}</u></p>
                  <div style={{'display': 'flex', 'alignItems': 'center'}}>
                    {props.allow_activity_voting &&
                      <div style={{'display': 'flex', 'alignItems': 'center', 'flexDirection': 'row'}}>
                        <p>{votes.filter(item => item.activity_id === activity.id).length}</p>
                        <Button 
                          className='accept' 
                          onClick={() => addVote(activity)} 
                          style={{'fontSize': '0.9em', 'margin': '5px', 'backgroundColor': votes.some(vote => vote.activity_id === activity.id && vote.user_id === auth.userId) ? 'rgb(0, 70, 3)' : ''}}
                          disabled={votes.some(vote => vote.activity_id === activity.id && vote.user_id === auth.userId)}
                        >
                          &#9733;
                        </Button>
                      </div>
                    }
                    {activity.user_id == auth.userId &&
                      <Button className='accept' onClick={() => deleteActivity(activity)} style={{'fontSize': '1em'}}>
                        &times;
                      </Button>
                    }
                  </div>
                </div>
                {activity.description.length != 0 &&
                  < p style={{'margin': '5px'}}>{activity.description}</p>
                }
              </div>
            ))}
          </div>
        }
        {props.allow_activity_input &&
          <div className='vertical'>
            <p style={{'marginBottom': '0px'}}>Add activity: </p>
            <input
              className='simple-text-input'
              style={{'marginLeft': '5px', 'border': '1px solid rgb(44, 44, 44)'}}
              type='text'
              placeholder='Activity'
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              className='text-area'
              style={{'marginLeft': '5px', 'border': '1px solid rgb(44, 44, 44)'}}
              type='text'
              placeholder='Activity description'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <Button className='button' onClick={addActivity}>
              Add Activity
            </Button>
          </div>
        }
      </div>
    </div>
  );
}