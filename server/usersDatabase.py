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
        userId TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        projects TEXT DEFAULT '[]'
    )''')
    conn.commit()
    conn.close()

def addUser(client, username, userId, password):
    conn = get_connection()
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    try:
        conn.execute('INSERT INTO users (username, userId, password) VALUES (?, ?, ?)',
                    (username, userId, hashed_password))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False

def __queryUser(client, username, userId):
    conn = get_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND userId = ?',
                       (username, userId)).fetchone()
    conn.close()
    return dict(user) if user else None

def login(client, username, userId, password):
    user = __queryUser(client, username, userId)
    if user:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        return user['password'] == hashed_password
    return False

def joinProject(client, userId, projectId):
    conn = get_connection()
    user = conn.execute('SELECT projects FROM users WHERE userId = ?', (userId,)).fetchone()
    if user:
        import json
        projects = json.loads(user['projects'])
        if projectId not in projects:
            projects.append(projectId)
            conn.execute('UPDATE users SET projects = ? WHERE userId = ?',
                        (json.dumps(projects), userId))
            conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def getUserProjectsList(client, userId):
    conn = get_connection()
    user = conn.execute('SELECT projects FROM users WHERE userId = ?', (userId,)).fetchone()
    conn.close()
    if user:
        import json
        return json.loads(user['projects'])
    return []