import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import MainPage from "./MainPage";
import Cookies from 'js-cookie';
import LoginButton from './Authentication/login';
import LogoutButton from './Authentication/logout';

export const Auth0 = React.createContext();

export default function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    document.title = "Together We Plan";
    setUserId(Cookies.get('userId'));
  }, []);

  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading && !userId) {
    return <div>Loading ...</div>;
  }

  const token = user?.sub;
  const backend = 'http://localhost:5000';
  const name = user?.name;
  const email = user?.email;

  function setId(user_id) {
    Cookies.set('userId', user_id, { expires: 7 });
    setUserId(user_id);
  }

  return (
    <div className='wrapper' >
      {(isAuthenticated || userId) && (
        <Auth0.Provider value={{ backend, token, name, email, userId }}>
          <div className='logout'>
            <LogoutButton />
          </div>
          <h1>Together We Plan</h1>
          <MainPage setUserId={setId} />
        </Auth0.Provider>
      )}
      {!isAuthenticated && !userId && (
        <div className='wrapper'>
          <h1>Together We Plan</h1>
          <p>Log in to get started!</p>
          <LoginButton />
        </div>
      )}
    </div>
  );
};