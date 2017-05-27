from sqlalchemy import Table, MetaData, create_engine, String, Integer, DateTime, ForeignKey, Boolean, Column, ForeignKeyConstraint

class DataBase(object):
    DB_PATH = "postgresql://max:qwerty@localhost:5432/pwa_db"
    engine = create_engine(DB_PATH)
    meta = MetaData(bind=engine, reflect=True)

    users = Table('users', meta,
                Column('login', String(30), primary_key=True),
                Column('password', String(60), nullable=False),
                Column('fullName', String(80), nullable=False),
                extend_existing=True)
    posts = Table('tasks', meta,
                Column('id', Integer, primary_key=True, autoincrement=True),
                Column('username', String(30), ForeignKey('users.login') , nullable=False),
                Column('task', String(140), nullable=False),
                Column('isDone', Boolean, nullable=False, default=False),
                extend_existing=True)

    def init_db(self, engine):
        conn = engine.connect()

        if not engine.dialect.has_table(engine, 'users') and not engine.dialect.has_table(engine, 'posts'):
            self.meta.create_all(engine)
        return conn
