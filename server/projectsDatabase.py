import sqlite3
import json
from . import hardwareDatabase as hardwareDB

def get_connection():
    conn = sqlite3.connect('hardware_portal.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectName TEXT NOT NULL,
        projectId TEXT UNIQUE NOT NULL,
        description TEXT,
        hwSets TEXT DEFAULT '{}',
        users TEXT DEFAULT '[]'
    )''')
    conn.commit()
    conn.close()

def queryProject(client, projectId):
    conn = get_connection()
    project = conn.execute('SELECT * FROM projects WHERE projectId = ?', (projectId,)).fetchone()
    conn.close()
    if project:
        result = dict(project)
        result['hwSets'] = json.loads(result['hwSets'])
        result['users'] = json.loads(result['users'])
        return result
    return None

def createProject(client, projectName, projectId, description):
    conn = get_connection()
    try:
        conn.execute('INSERT INTO projects (projectName, projectId, description) VALUES (?, ?, ?)',
                    (projectName, projectId, description))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False

def addUser(client, projectId, username):
    conn = get_connection()
    project = conn.execute('SELECT users FROM projects WHERE projectId = ?', (projectId,)).fetchone()
    if project:
        users = json.loads(project['users'])
        if username not in users:
            users.append(username)
            conn.execute('UPDATE projects SET users = ? WHERE projectId = ?',
                        (json.dumps(users), projectId))
            conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def updateUsage(client, projectId, hwSetName):
    # This function updates hardware usage tracking
    return True

def checkOutHW(client, projectId, hwSetName, qty, username):
    # Check if hardware is available
    if hardwareDB.requestSpace(client, hwSetName, qty):
        # Update project's hardware usage
        conn = get_connection()
        project = conn.execute('SELECT hwSets FROM projects WHERE projectId = ?', (projectId,)).fetchone()
        if project:
            hw_sets = json.loads(project['hwSets'])
            hw_sets[hwSetName] = hw_sets.get(hwSetName, 0) + qty
            conn.execute('UPDATE projects SET hwSets = ? WHERE projectId = ?',
                        (json.dumps(hw_sets), projectId))
            conn.commit()
        conn.close()
        return True
    return False

def checkInHW(client, projectId, hwSetName, qty, username):
    conn = get_connection()
    project = conn.execute('SELECT hwSets FROM projects WHERE projectId = ?', (projectId,)).fetchone()
    
    if project:
        hw_sets = json.loads(project['hwSets'])
        current_usage = hw_sets.get(hwSetName, 0)
        
        if current_usage >= qty:
            # Update project usage
            hw_sets[hwSetName] = current_usage - qty
            if hw_sets[hwSetName] == 0:
                del hw_sets[hwSetName]
            
            conn.execute('UPDATE projects SET hwSets = ? WHERE projectId = ?',
                        (json.dumps(hw_sets), projectId))
            conn.commit()
            
            # Update hardware availability
            hw_set = hardwareDB.queryHardwareSet(client, hwSetName)
            if hw_set:
                new_availability = hw_set['availability'] + qty
                hardwareDB.updateAvailability(client, hwSetName, new_availability)
            
            conn.close()
            return True
    
    conn.close()
    return False
