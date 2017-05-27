import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { render } from 'react-dom';
import React from 'react';

import Register from './register';
import RootComponent from './root';

render((
    <Router history={browserHistory}>
        <Route path="/" component={RootComponent}/>
        <Route path="/register" component={Register}/>
    </Router>
), document.getElementById('root'));
