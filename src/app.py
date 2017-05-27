from wsgiref.simple_server import make_server
import os
from pyramid.config import Configurator
from pyramid.response import Response
from jinja2 import FileSystemLoader, Environment
from sqlalchemy import Table, MetaData, create_engine, select, and_, delete
from db import DataBase
import bcrypt
import json

env = Environment(loader=FileSystemLoader('server/templates'))
DB_PATH = "postgresql://localhost:5432/pwa_db"
engine = create_engine(DB_PATH)
connection = DataBase().init_db(engine)

def Data(request):
    users = connection.execute(select([DataBase.users]))
    if request.method == 'POST':
        for user in users:
            if(request.POST.getone('user') == user[0]):
                if(len(request.POST.getone('user'))+1 == int(request.POST.getone('token'))):
                    if(request.POST.getone('type') == 'add'):
                        connection.execute(DataBase.posts.insert(),
                        {"username": request.POST.getone('user'), "task": request.POST.getone('data'), "isDone": False})
                    if(request.POST.getone('type') == 'delete'):
                        query = DataBase.posts.delete(DataBase.posts.c.task == request.POST.getone('data'))
                        connection.execute(query)
                    if(request.POST.getone('type') == 'done'):
                        query = DataBase.posts.update().\
                                where(DataBase.posts.c.task==request.POST.getone('data')).\
                                values(isDone=True)
                        connection.execute(query)
                    if(request.POST.getone('type') == 'cancel'):
                        query = DataBase.posts.update().\
                                where(DataBase.posts.c.task==request.POST.getone('data')).\
                                values(isDone=False)
                        connection.execute(query)

        tasks = connection.execute(select([DataBase.posts.c.task, DataBase.posts.c.isDone]). \
                                   where(and_(DataBase.posts.c.username == request.POST.getone('user'))). \
                                   order_by(DataBase.posts.c.task))

        result = []
        for task in tasks:
            # some trouble with adding throw {"name":task[0],"isDone":task[1]}
            _task = {}
            _task["name"] = task[0]
            _task["isDone"] = task[1]
            result.append(_task)
                
        print(result)
        print(json.dumps({"username": request.POST.getone('user'), "tasks": result}))
        return Response(json.dumps({"username": request.POST.getone('user'), "tasks": result}))

def IndexPage(request):
    
    if request.method == 'POST':
        login = request.POST.getone('login')
        password = request.POST.getone('password').encode('utf-8')
        users = connection.execute(select([DataBase.users]))
        for user in users:
            if user[0] == login and bcrypt.hashpw(password, request.registry.settings['salt']) == user[1]:
                print("Render app. Auth succes")

                tasks = connection.execute(select([DataBase.posts.c.task, DataBase.posts.c.isDone]). \
                    where(and_(DataBase.posts.c.username == login, DataBase.posts.c.isDone == False)). \
                    order_by(DataBase.posts.c.id))

                result = []
                for task in tasks:
                    # some trouble with adding throw {"name":task[0],"isDone":task[1]}
                    _task = {}
                    _task["name"] = task[0]
                    _task["isDone"] = task[1]
                    print(_task)
                    result.append(_task)
                
                print(result)
                print(json.dumps({"username":login,"tasks":result}))
                return Response(json.dumps({"username":login,"tasks":result}))
        print('User not found')
        
        response = Response()
        response.status = 404
        response.body = json.dumps({"error":"User not found"})
        response.content_type = 'application/json'
        return response

    return Response(env.get_template('index.html').render(css=request.static_url('server/static/main.css'),bundle=request.static_url('server/static/bundle.js')))

def RegisterPage(request):

    if request.method == 'POST':

        hashed = bcrypt.hashpw(request.POST.getone('password').encode('utf-8'),request.registry.settings['salt'])

        users = connection.execute(select([DataBase.users]))
        for username in users:
            if username == request.POST.getone('login'):
                print("user already exist")
                response = Response()
                response.status = 409
                response.body = json.dumps({"error":"User already exist"})
                response.content_type = 'application/json'
                return response

        connection.execute(DataBase.users.insert(),
            {"login": request.POST.getone('login'), "password": str(hashed),"fullName": request.POST.getone('fullname')})
        print("user " + request.POST.getone('login') + " : " + request.POST.getone('fullname') + " created")

    return Response(env.get_template('index.html').render(css=request.static_url('server/static/main.css'),bundle=request.static_url('server/static/bundle.js')))


if __name__ == '__main__':

    config = Configurator()
    settings = config.get_settings()
    settings['salt'] = "$2a$12$AAAAAAAAAAAAAACgpDEPGQ=="

    config.add_static_view('static', 'server/static')

    config.add_route('home', '/')
    config.add_view(IndexPage, route_name='home')

    config.add_route('sync', '/data')
    config.add_view(Data, route_name='sync')

    config.add_route('registration', '/register')
    config.add_view(RegisterPage, route_name='registration')

    app = config.make_wsgi_app()
    PORT = 8080
    server = make_server('0.0.0.0', PORT, app)
    print("Serving localhost on 8080...")
    server.serve_forever()
