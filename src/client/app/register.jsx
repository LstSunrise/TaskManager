import React, {Component} from 'react';
import SweetAlert from 'sweetalert-react';
import Navbar from './navbar';

export default class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showError: false,
            errorTitle: "",
            errorMessage: undefined,
            errorType: "error",
            confirmText: undefined
        };
        this.verifyForm = this.verifyForm.bind(this);
    }

    verifyForm() {
        if (!this._login.value.toString() || !this._password1.value.toString() || !this._fullname.value.toString() || !this._password2.value.toString()) {
            this.state = {
                errorTitle: "Хей!",
                errorMessage: "Забыл заполнить поля!",
                errorType: "warning",
                confirmText: "Упс! Сейчас заполню..."
            };
            this.setState({showError: true});
        } else if (this._password1.value.toString() !== this._password2.value.toString()) {
            this.state = {
                errorTitle: "Ой!",
                errorMessage: "Пароли не совпадают!",
                errorType: "error",
                confirmText: "Буду внимательней..."
            };
            this.setState({showError: true});
        } else {
            let request = new XMLHttpRequest();
            request.open('POST', '/register', true);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            request.send(`login=${this._login.value.toString()}&password=${this._password1.value.toString()}&fullname=${this._fullname.value.toString()}`);
            this._login.value = this._password1.value = this._password1.value = this._password2.value = this._fullname.value = '';
            
            //Ждем ошибку с сервера, если она будет
            request.onreadystatechange = function () {
            if (request.readyState != 4) return;
            if (request.status != 200) {
                console.log('Print error');
                console.log(request.status + ': ' + request.statusText);
                this.state = {
                    errorTitle: "Ха-ха-ха!",
                    errorMessage: `Пользователь с таким логином уже есть!`,
                    errorType: "error",
                    confirmText: "Придется думать над новым логином"
                };
                this.setState({showError: true});
            } else {
                window.location = "http://localhost:8080";
            }
            }.bind(this);
        }
    }

    render() {
        return (
        <div>
        <Navbar logo="Register to MyTasks"/>
        <div className="row panel-info">
            <div className="col m4"></div>
            <div className="col m4">
                <div className="card blue-grey darken-1">
                    <form action="/" method="POST" name="reg">
                        <div className="card-content white-text">
                            <span className="card-title">Регистрация:</span>
                            <div className="input-field">
                                <input ref={el => this._login = el} placeholder="Логин" name="login" type="text"/>
                            </div>
                            <div className="input-field">
                                <input ref={el => this._fullname = el} placeholder="Ваше имя" name="fullname" type="text"/>
                            </div>
                            <div className="input-field">
                                <input ref={el => this._password1 = el} placeholder="Пароль" name="password_1" type="password" required/>
                            </div>
                            <div className="input-field">
                                <input ref={el => this._password2 = el} placeholder="Повторите пароль" name="password_2" type="password" required/>
                            </div>
                        </div>
                        <div className="card-action">
                            <a onClick={this.verifyForm} className="btn reg-user waves-effect waves-light" to="/">Зарегистрироваться</a>
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
        </div>
        )
    }
}
