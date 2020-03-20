import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import UploadPage from './containers/UploadPage';
import CounterPage from './containers/CounterPage';
import CropPage from './containers/CropPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.UPLOAD} component={UploadPage}/>
        <Route path={routes.COUNTER} component={CounterPage}/>
        <Route path={routes.CROP} component={CropPage}/>
        <Route path={routes.HOME} component={HomePage}/>
      </Switch>
    </App>
  );
}
