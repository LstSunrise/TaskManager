import React, {Component} from 'react';
import SweetAlert from 'sweetalert-react';
import ReactInterval from 'react-interval';

export default class DashBoard extends Component {
    constructor(props) {
        super(props);
        let items = JSON.parse(localStorage.tasks);
        this.state = {
            items: items,
            task: '',
            showError: false,
            errorTitle: "",
            errorMessage: undefined,
            errorType: "error",
            confirmText: undefined
        };
        this.addTask = this.addTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onUnload = this.onUnload.bind(this);
        this.sync = this.sync.bind(this);
        this.toggleTask = this.toggleTask.bind(this);
        
        this.sync(localStorage.user, localStorage.token, 'update', 0);
        this.MAX_TASK_LENGTH = 50;
    };

    toggleTask(e) {
        //toggle isDone boolean
        // console.log(e.target.name);
        let newItems = this.state.items;
        for(let i = 0; i < newItems.length; i++) {
            if(newItems[i].name == e.target.name) {
                let _state = newItems[i].isDone;
                newItems[i].isDone = !newItems[i].isDone;
                this.setState({items:newItems});
                this.sync(localStorage.user, localStorage.token, !_state?'done':'cancel', e.target.name);
            }
        }
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload);
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
    }

    onUnload(event) {
        // console.log("sync");
        //event.returnValue = "random_value";
    }

    deleteTask(e) {
        let taskIndex = parseInt(e.target.value, 10);
        let currentTask = this.state.items[taskIndex]['name'];
        console.log(currentTask);
        console.log(`Remove ${taskIndex} ${this.state.items[taskIndex]}`);
        this.setState(state => {
            this.state.items.splice(taskIndex, 1);
            return {items: state.items};
        });
        this.sync(localStorage.user, localStorage.token, 'delete', currentTask);

    };

    onChange(e) {
        //Переделать
        if(e.target.value.length < this.MAX_TASK_LENGTH) {
            this.setState({ task: e.target.value });
        } else {
            this.setState({task: ''});
            document.getElementById('task').value = "";
            this.state = {
                errorTitle: "Тише, тише",
                errorMessage: "Попробуй уместить все в 140 символов.",
                errorType: "warning",
                confirmText: "Ладно, уговорил"
            };
            this.setState({showError: true});
        }
    };

    addTask(e){
        let currentTask = this.state.task;
        if(currentTask) {
            this.setState({
                items: this.state.items.concat({"name":this.state.task,"isDone":false}),
                task: ''
        });

        this.sync(localStorage.user,localStorage.token,'add', currentTask);
        } else {
            this.setState({task: ''});
            this.state.errorTitle = "ЗАЧЕМ??????????";
            this.state.errorMessage = "Для того, для кого ясна пустота,\nВсё становится ясным.";
            this.state.errorType = "warning";
            this.state.confirmText = "Простите за пустую задачу, я просто хотел проверить кнопку";
            this.setState({showError: true});
        }
        document.getElementById('task').value = "";
    };

    sync(user,token,type,data) {
        // console.log('SYNC!');
        let request = new XMLHttpRequest();
        request.open('POST', '/data', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send(`user=${user}&token=${token}&type=${type}&data=${data}`);
        const RETRY_LIMIT = 100;

        request.onreadystatechange = function () {
            let retryCount = 0;
            if (request.readyState != 4) return;
            if (request.status != 200) {
                // console.log('Print error');
                //Добавить на страницу что-нибудь, если автономный режим
                // console.log(request.status + ': ' + request.statusText);
                document.getElementsByClassName('nav-wrapper')[0].style.backgroundColor = "#FE5E57";
                if (retryCount < RETRY_LIMIT) {
                    console.log(retryCount);
                    setTimeout(() => {
                        this.sync(user, token, type, data);
                    },1000);
                    retryCount++;
                };
            } else {
                let responce = JSON.parse(request.responseText);
                // console.log(responce);
                
                localStorage.setItem('user', responce.username);
                localStorage.setItem('tasks', JSON.stringify(responce.tasks));
                localStorage.setItem('token', (localStorage.user.length + 1));
                let items = JSON.parse(localStorage.tasks);
                this.setState({items: items});
                document.getElementsByClassName('nav-wrapper')[0].style.backgroundColor = "#5DD775";
            }
        }.bind(this);
    }

    render(){
        return(
            <div className="container">
                <div className="collection with-header col s6 offset-s4">
                    <div className="collection-header">
                        <h4 className="center">Hello, {localStorage.user}</h4>
                        <div className="input-field taskinput">
                            <input id="task" type="text" maxLength={this.MAX_TASK_LENGTH} onChange={this.onChange}/>
                            <label htmlFor="task">Введите задачу: </label>
                        </div>
                        <span className="btn addTask waves-effect waves-red" onClick={this.addTask}>+</span>
                    </div>
                    {this.state.items.map((task, taskIndex) =>
                        <a name={task.name} key={taskIndex} onDoubleClick={this.toggleTask} className="collection-item">
                            {task.name} {task.isDone ? "(Done)" : "(Not done yet)"}
                            <button className="delete-btn waves-effect waves-red z-depth-1 btn-floating secondary-content" onClick={this.deleteTask}
                                    value={taskIndex}> - </button>
                        </a>
                    )}
                </div>
                <SweetAlert
                    show={this.state.showError}
                    title={this.state.errorTitle}
                    text={this.state.errorMessage}
                    type={this.state.errorType}
                    confirmButtonText={this.state.confirmText}
                    onConfirm={() => this.setState({showError: false})}
                />
                <ReactInterval timeout={10000} enabled={true} callback={() => {this.sync(localStorage.user, localStorage.token, 'update', 0)}}/>
            </div>
        );
    }
};
