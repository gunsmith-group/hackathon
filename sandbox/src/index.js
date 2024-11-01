import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'
import 'react-json-pretty/themes/monikai.css';
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'
import './assets/css/index.css';
import './assets/css/app.css';
import App from './App';
import store from './app/store'

TimeAgo.addDefaultLocale(en)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
  </React.StrictMode>
);