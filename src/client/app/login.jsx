import React, {Component} from 'react';
import { Link } from 'react-router';
import SweetAlert from 'sweetalert-react';

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showError: false,
            errorTitle: "",
            errorMessage: undefined,
            errorType: "error",
            confirmText: undefined,
            isSuccess: false
        };
        this.verifyForm = this.verifyForm.bind(this);
        this.login = this.login.bind(this);
    }

    verifyForm() {
        if(!this._login.value.toString() || !this._password.value.toString()){
            this.state = {
                errorTitle: "Хей!",
                errorMessage: "Забыл заполнить поля!",
                errorType: "warning",
                confirmText: "Упс! Сейчас заполню..."
            };
            this.setState({showError: true});
        } else {
            setTimeout(this.login(this._login.value.toString(),this._password.value.toString(),3000));
            this._login.value = this._password.value = '';
        }
    }

    login(login, pass) {
        let request = new XMLHttpRequest();
        request.open('POST', '/', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send(`login=${login}&password=${pass}`);

        request.onreadystatechange = function () {
            // Ждем завершения запроса
            if (request.readyState != 4) return;
            if (request.status != 200) {
                console.log('Print error');
                console.log(request.status + ': ' + request.statusText);
                this.state = {
                    errorTitle: "Оу!",
                    errorMessage: "Нет такого пользователя!",
                    errorType: "error",
                    confirmText: "Окей"
                };
                this.setState({showError: true});
            } else {
                this.setState({isSuccess:true},() => {console.log('Auth complete!')});
                let responce = JSON.parse(request.responseText);
                console.log(responce);
                localStorage.setItem('user',responce.username);
                localStorage.setItem('tasks',JSON.stringify(responce.tasks));
                localStorage.setItem('token',(localStorage.user.length+1));
                window.location.reload();
            }
        }.bind(this);
    }

    render() {
        return <div className="row panel-info">
            <div className="col m4"></div>
            <div className="col m4">
                <div className="card blue-grey darken-1">
                    <form action="/" method="POST" name="auth">
                        <div className="card-content white-text">
                            <span className="card-title">Авторизация:</span>
                            <div className="input-field">
                                <input ref={el => this._login = el} placeholder="Логин" name="login" type="text"/>
                            </div>
                            <div className="input-field">
                                <input ref={el => this._password = el} placeholder="Пароль" name="password" type="password" required/>
                            </div>
                        </div>
                        <div className="card-action">
                            <a className="btn enter waves-effect waves-light tooltipped" 
                            data-position="right" data-delay="50" 
                            data-tooltip="Добро пожаловать!" 
                            onClick={this.verifyForm}>
                                Войти
                            </a>
                            <Link className="btn-flat reg waves-effect waves-light" to="/register">Регистрация</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className="col m4"></div>
            <SweetAlert
                show={this.state.showError}
                title={this.state.errorTitle}
                text={this.state.errorMessage}
                type={this.state.errorType}
                confirmButtonText={this.state.confirmText}
                onConfirm={() => this.setState({showError: false})}
            />
        </div>
    }
}
