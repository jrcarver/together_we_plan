import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <body className='wrapper' > 
    <Auth0Provider
      domain="dev-4r2t66psl6buvom1.us.auth0.com"
      clientId="OQddVsSOFkWHpHvkSmOeeZ9Ym7HnKInN"
      authorizationParams={{
        redirect_uri: "http://localhost:3000"
      }}
    >
      <App />
    </Auth0Provider>
  </body>,
);