import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import Cookies from 'js-cookie';

const LogoutButton = () => {
  const { logout } = useAuth0();

  function logoutAndClear() {
    Cookies.remove('userId');
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <button className='button' onClick={() => logoutAndClear()}>
      Log Out
    </button>
  );
};

export default LogoutButton;