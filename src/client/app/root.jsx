import React, {Component} from 'react';

import Login from "./login";
import DashBoard from "./dashboard";
import Navbar from './navbar';

export default class RootComponent extends Component {
    render() {
        if(localStorage.token) {
            //функция проверки токена
            if(localStorage.token == localStorage.user.length+1) {
                return (<div><Navbar logo="DashBoard"/><DashBoard/></div>)
            }
        }
        return (<div><Navbar logo="MyTasks"/><Login/></div>);
    }
}
