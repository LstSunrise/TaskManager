import React, {Component} from 'react';
import { Link } from 'react-router';

export default class Navbar extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }
    
    logout() {
        localStorage.clear();
        window.location.reload();
    }
    
    render() {
        return <nav>
                <div className="nav-wrapper">
                  <a href="#" className="brand-logo center">{this.props.logo}</a>
                  <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><a href="#" onClick={this.logout}>Выход</a></li>
                  </ul>
                </div>
              </nav>
    }
}
