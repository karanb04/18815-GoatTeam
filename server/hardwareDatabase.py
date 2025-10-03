import sqlite3

def get_connection():
    conn = sqlite3.connect('hardware_portal.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS hardware_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hwName TEXT UNIQUE NOT NULL,
        capacity INTEGER NOT NULL,
        availability INTEGER NOT NULL
    )''')
    
    # Add default hardware sets
    conn.execute('INSERT OR IGNORE INTO hardware_sets (hwName, capacity, availability) VALUES ("HWSet1", 100, 100)')
    conn.execute('INSERT OR IGNORE INTO hardware_sets (hwName, capacity, availability) VALUES ("HWSet2", 100, 100)')
    
    conn.commit()
    conn.close()

def createHardwareSet(client, hwSetName, initCapacity):
    conn = get_connection()
    try:
        conn.execute('INSERT INTO hardware_sets (hwName, capacity, availability) VALUES (?, ?, ?)',
                    (hwSetName, initCapacity, initCapacity))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        conn.close()
        return False

def queryHardwareSet(client, hwSetName):
    conn = get_connection()
    hw_set = conn.execute('SELECT * FROM hardware_sets WHERE hwName = ?', (hwSetName,)).fetchone()
    conn.close()
    return dict(hw_set) if hw_set else None

def updateAvailability(client, hwSetName, newAvailability):
    conn = get_connection()
    conn.execute('UPDATE hardware_sets SET availability = ? WHERE hwName = ?',
                (newAvailability, hwSetName))
    conn.commit()
    conn.close()
    return True

def requestSpace(client, hwSetName, amount):
    conn = get_connection()
    hw_set = conn.execute('SELECT availability FROM hardware_sets WHERE hwName = ?',
                         (hwSetName,)).fetchone()
    if hw_set and hw_set['availability'] >= amount:
        new_availability = hw_set['availability'] - amount
        conn.execute('UPDATE hardware_sets SET availability = ? WHERE hwName = ?',
                    (new_availability, hwSetName))
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def getAllHwNames(client):
    conn = get_connection()
    hw_sets = conn.execute('SELECT hwName FROM hardware_sets').fetchall()
    conn.close()
    return [hw['hwName'] for hw in hw_sets]