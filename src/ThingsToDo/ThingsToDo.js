import { useEffect, useContext, useState } from "react";
import { Auth } from '../MainPage';
import axios from "axios";
import { Button } from "react-bootstrap";
import CreateEventForm from "../EventCreation/CreateEventForm";

export default function ThingsToDo() {
  const auth = useContext(Auth);
  const [thingsToDo, setThingsToDo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [terms, setTerms] = useState('');
  const [displayForm, setDisplayForm] = useState(false, null);
  const [name, setName] = useState('');
  const [business_location, setBusinessLocation] = useState('');
  const [url, setUrl] = useState('');

  function showForm(name, business_location, url) {
    setName(name);
    setBusinessLocation(business_location);
    setUrl(url);
    setDisplayForm(!displayForm);
  }

  function clickOutside(event) {
    if (event.target.className === 'modal') {
      event.stopPropagation(); // stop event from reaching parent modal
      showForm();
    }
  }

  useEffect(() => {
    axios.post(`${auth.backend}/yelp-things-to-do`, {
      user_id: auth.userId,
      location: auth.location
    })
    .then(response => {
      setThingsToDo(response.data.businesses);
      setLoading(false);
    })
    .catch(error => console.error('Error fetching things to do data: ', error))
  }, [auth.backend, auth.userId, auth.location]);

  function search(e) {
    e.preventDefault();

    axios.post(`${auth.backend}/yelp-search`, {
      user_id: auth.userId,
      location: location || auth.location,
      terms: terms || 'things to do'
    })
    .then(response => {
      setThingsToDo(response.data.businesses);
    })
    .catch(error => console.error('Error fetching things to do data: ', error))
  }

  return (
    <div>
      {!displayForm && (
        <div className='modal-content'>
          <h2>Things To Do!</h2>
          <form className='input-line' onSubmit={search}>
            <input
              className='simple-text-input'
              type='text'
              placeholder='Enter a city and state location to search around'
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <input
              className='simple-text-input'
              type='text'
              placeholder='Enter search terms'
              value={terms}
              onChange={e => setTerms(e.target.value)}
            />
            <Button className='button' type='submit'>
              Search!
            </Button>
          </form>
          {loading ? (
            <div>loading...</div>
          ) : (
            <div>
              {
                thingsToDo ? 
                  thingsToDo.map(thing => (
                    <div className='event' style={{'padding': '20px', 'position': 'relative'}} key={thing.id}>
                      <h3 style={{'margin': '0px'}}>{thing.name && thing.name}</h3>
                      <div style={{'display': 'flex', 'alignItems': 'center', 'marginTop': '15px'}}>
                        <img src={thing.image_url} alt={thing.name} style={{'maxHeight': '200px'}} />
                        <div style={{'paddingLeft': '20px'}}>
                          {
                            thing.categories && 
                              <div>
                                <p>Categories: {thing.categories.map((category, index) => <span>{category.title}{index < thing.categories.length - 1 && ', '}</span>)} </p>
                              </div>
                          }
                          <p>Location: {thing.location.display_address && thing.location.display_address.join(', ')}</p>
                        </div>
                      </div>
                      <div style={{'position': 'absolute', 'left': '50%', 'bottom': 0, 'transform': 'translate(-50%, 0%)', 'margin': '10px'}}>
                        <div>
                          <Button className='button' onClick={() => showForm(thing.name, thing.location.display_address.join(', '), thing.url)}>Plan an Event</Button>
                        </div>
                      </div>
                      <a href={thing.url} style={{'position': 'absolute', 'right': 0, 'bottom': 0, 'margin': '10px'}}><img src='/yelp_logo_dark_bg.png' style={{'height': '20px'}} /></a>
                    </div>
                  )) 
                : 
                  <div>Please refine your default location in your profile for Things To Do in your area!</div>
              }
            </div>
          )}
        </div>
      )}
      {displayForm && (
        <div className='modal' onClick={clickOutside}>
          <CreateEventForm closeForm={showForm} name={name} location={business_location} url={url} />
        </div>
      )}
    </div>
  );
}