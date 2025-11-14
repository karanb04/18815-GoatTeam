import sqlite3
import hashlib

def get_connection():
    conn = sqlite3.connect('hardware_portal.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        projects TEXT DEFAULT '[]'
    )''')
    conn.commit()
    conn.close()

def addUser(client, username, password):
    conn = get_connection()
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                    (username, hashed_password))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False

def __queryUser(client, username):
    conn = get_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?',
                       (username,)).fetchone()
    conn.close()
    return dict(user) if user else None

def login(client, username, password):
    user = __queryUser(client, username)
    if user:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return user['password'] == hashed_password
    return False

def joinProject(client, username, projectId):
    conn = get_connection()
    user = conn.execute('SELECT projects FROM users WHERE username = ?', (username,)).fetchone()
    if user:
        import json
        projects = json.loads(user['projects'])
        if projectId not in projects:
            projects.append(projectId)
            conn.execute('UPDATE users SET projects = ? WHERE username = ?',
                        (json.dumps(projects), username))
            conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def getUserProjectsList(client, username):
    conn = get_connection()
    user = conn.execute('SELECT projects FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()
    if user:
        import json
        return json.loads(user['projects'])
    return []