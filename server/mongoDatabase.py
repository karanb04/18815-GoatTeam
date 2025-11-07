import urllib.parse
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import hashlib
import json
import ssl
from datetime import datetime

class MongoDatabase:
    def __init__(self):
        username = urllib.parse.quote_plus("karanbhakta_db_user")
        password = urllib.parse.quote_plus("VXTSFN6zQfMBS9DR")
        self.uri = f"mongodb+srv://{username}:{password}@cluster0.7zw9yhb.mongodb.net/?appName=Cluster0"
        self.client = None
        self.db = None
        
    def connect(self):
        try:
            # Add SSL configuration for Heroku compatibility
            self.client = MongoClient(
                self.uri, 
                server_api=ServerApi('1'),
                ssl=True,
                ssl_cert_reqs=ssl.CERT_NONE,
                connect=True,
                serverSelectionTimeoutMS=5000,
                socketTimeoutMS=20000,
                connectTimeoutMS=20000,
                maxPoolSize=1
            )
            self.client.admin.command('ping')
            self.db = self.client['HardwarePortal']
            print("Successfully connected to MongoDB!")
            return True
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return False
    
    def close(self):
        if self.client:
            self.client.close()

# Initialize database collections
def init_db():
    mongo = MongoDatabase()
    if mongo.connect():
        # Create collections with indexes
        mongo.db.users.create_index("username", unique=True)
        mongo.db.projects.create_index("projectId", unique=True)
        mongo.db.hardware.create_index("hwName", unique=True)
        
        # Initialize default hardware sets
        hardware_sets = [
            {"hwName": "HWSet1", "capacity": 100, "availability": 100, "checkout_history": []},
            {"hwName": "HWSet2", "capacity": 100, "availability": 100, "checkout_history": []}
        ]
        
        for hw_set in hardware_sets:
            mongo.db.hardware.update_one(
                {"hwName": hw_set["hwName"]},
                {"$setOnInsert": hw_set},
                upsert=True
            )
        
        mongo.close()
        return True
    return False

# User Management Functions
def addUser(username, password):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        user_doc = {
            "username": username,
            "password": hashed_password,
            "projects": [],
            "created_at": datetime.utcnow()
        }
        mongo.db.users.insert_one(user_doc)
        mongo.close()
        return True
    except Exception as e:
        print(f"Error adding user: {e}")
        mongo.close()
        return False

def loginUser(username, password):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        user = mongo.db.users.find_one({"username": username})
        if user:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            mongo.close()
            return user['password'] == hashed_password
        mongo.close()
        return False
    except Exception as e:
        print(f"Error during login: {e}")
        mongo.close()
        return False


def getUserProjects(username):
    mongo = MongoDatabase()
    if not mongo.connect():
        return []
    
    try:
        user = mongo.db.users.find_one({"username": username}, {"projects": 1})
        mongo.close()
        return user['projects'] if user else []
    except Exception as e:
        print(f"Error getting user projects: {e}")
        mongo.close()
        return []

def joinProject(username, projectId):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        # Add project to user's list
        mongo.db.users.update_one(
            {"username": username},
            {"$addToSet": {"projects": projectId}}
        )
        # Add user to project's list
        mongo.db.projects.update_one(
            {"projectId": projectId},
            {"$addToSet": {"users": username}}
        )
        mongo.close()
        return True
    except Exception as e:
        print(f"Error joining project: {e}")
        mongo.close()
        return False

# Project Management Functions
def createProject(projectName, projectId, description, creator_username):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        project_doc = {
            "projectName": projectName,
            "projectId": projectId,
            "description": description,
            "hwSets": {},
            "users": [creator_username],
            "created_by": creator_username,
            "created_at": datetime.utcnow()
        }
        mongo.db.projects.insert_one(project_doc)
        
        # Add project to creator's list
        mongo.db.users.update_one(
            {"username": creator_username},
            {"$addToSet": {"projects": projectId}}
        )
        
        mongo.close()
        return True
    except Exception as e:
        print(f"Error creating project: {e}")
        mongo.close()
        return False

def queryProject(projectId):
    mongo = MongoDatabase()
    if not mongo.connect():
        return None
    
    try:
        project = mongo.db.projects.find_one({"projectId": projectId})
        mongo.close()
        if project:
            # Convert ObjectId to string for JSON serialization
            project['_id'] = str(project['_id'])
            return project
        return None
    except Exception as e:
        print(f"Error querying project: {e}")
        mongo.close()
        return None

# Hardware Management Functions
def createHardwareSet(hwSetName, capacity):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        hw_doc = {
            "hwName": hwSetName,
            "capacity": capacity,
            "availability": capacity,
            "checkout_history": []
        }
        mongo.db.hardware.insert_one(hw_doc)
        mongo.close()
        return True
    except Exception as e:
        print(f"Error creating hardware set: {e}")
        mongo.close()
        return False

def queryHardwareSet(hwSetName):
    mongo = MongoDatabase()
    if not mongo.connect():
        return None
    
    try:
        hw_set = mongo.db.hardware.find_one({"hwName": hwSetName})
        mongo.close()
        if hw_set:
            hw_set['_id'] = str(hw_set['_id'])
            return hw_set
        return None
    except Exception as e:
        print(f"Error querying hardware set: {e}")
        mongo.close()
        return None

def getAllHwNames():
    mongo = MongoDatabase()
    if not mongo.connect():
        return []
    
    try:
        hw_sets = mongo.db.hardware.find({}, {"hwName": 1})
        mongo.close()
        return [hw['hwName'] for hw in hw_sets]
    except Exception as e:
        print(f"Error getting hardware names: {e}")
        mongo.close()
        return []

def checkOutHW(projectId, hwSetName, qty, username):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        # Check availability
        hw_set = mongo.db.hardware.find_one({"hwName": hwSetName})
        if not hw_set or hw_set['availability'] < qty:
            mongo.close()
            return False
        
        # Update hardware availability
        mongo.db.hardware.update_one(
            {"hwName": hwSetName},
            {
                "$inc": {"availability": -qty},
                "$push": {
                    "checkout_history": {
                        "projectId": projectId,
                        "username": username,
                        "action": "checkout",
                        "quantity": qty,
                        "timestamp": datetime.utcnow()
                    }
                }
            }
        )
        
        # Update project hardware usage
        mongo.db.projects.update_one(
            {"projectId": projectId},
            {"$inc": {f"hwSets.{hwSetName}": qty}}
        )
        
        mongo.close()
        return True
    except Exception as e:
        print(f"Error checking out hardware: {e}")
        mongo.close()
        return False

def checkInHW(projectId, hwSetName, qty, username):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        # Check project's current usage
        project = mongo.db.projects.find_one({"projectId": projectId})
        if not project:
            mongo.close()
            return False
        
        current_usage = project.get('hwSets', {}).get(hwSetName, 0)
        if current_usage < qty:
            mongo.close()
            return False
        
        # Update hardware availability
        mongo.db.hardware.update_one(
            {"hwName": hwSetName},
            {
                "$inc": {"availability": qty},
                "$push": {
                    "checkout_history": {
                        "projectId": projectId,
                        "username": username,
                        "action": "checkin",
                        "quantity": qty,
                        "timestamp": datetime.utcnow()
                    }
                }
            }
        )
        
        # Update project hardware usage
        new_usage = current_usage - qty
        if new_usage == 0:
            mongo.db.projects.update_one(
                {"projectId": projectId},
                {"$unset": {f"hwSets.{hwSetName}": ""}}
            )
        else:
            mongo.db.projects.update_one(
                {"projectId": projectId},
                {"$set": {f"hwSets.{hwSetName}": new_usage}}
            )
        
        mongo.close()
        return True
    except Exception as e:
        print(f"Error checking in hardware: {e}")
        mongo.close()
        return False

def getInventory():
    mongo = MongoDatabase()
    if not mongo.connect():
        return {}
    
    try:
        hw_sets = mongo.db.hardware.find({})
        inventory = {}
        for hw in hw_sets:
            hw['_id'] = str(hw['_id'])
            inventory[hw['hwName']] = hw
        mongo.close()
        return inventory
    except Exception as e:
        print(f"Error getting inventory: {e}")
        mongo.close()
        return {}

def getDetailedCheckoutHistory(projectId):
    mongo = MongoDatabase()
    if not mongo.connect():
        return []
    
    try:
        # Get checkout history from hardware collection
        hw_sets = mongo.db.hardware.find({}, {"hwName": 1, "checkout_history": 1})
        history = []
        
        for hw_set in hw_sets:
            for record in hw_set.get('checkout_history', []):
                if record.get('projectId') == projectId:
                    history.append({
                        'hwSetName': hw_set['hwName'],
                        'username': record['username'],
                        'action': record['action'],
                        'quantity': record['quantity'],
                        'timestamp': record['timestamp']
                    })
        
        # Sort by timestamp, most recent first
        history.sort(key=lambda x: x['timestamp'], reverse=True)
        mongo.close()
        return history
    except Exception as e:
        print(f"Error getting checkout history: {e}")
        mongo.close()
        return []

def validateProjectMembership(username, projectId):
    mongo = MongoDatabase()
    if not mongo.connect():
        return False
    
    try:
        project = mongo.db.projects.find_one({"projectId": projectId})
        mongo.close()
        if project and username in project.get('users', []):
            return True
        return False
    except Exception as e:
        print(f"Error validating project membership: {e}")
        mongo.close()
        return False

def getLiveAvailability():
    mongo = MongoDatabase()
    if not mongo.connect():
        return {}
    
    try:
        hw_sets = mongo.db.hardware.find({}, {"hwName": 1, "capacity": 1, "availability": 1})
        availability = {}
        
        for hw in hw_sets:
            availability[hw['hwName']] = {
                'capacity': hw['capacity'],
                'availability': hw['availability'],
                'in_use': hw['capacity'] - hw['availability'],
                'timestamp': datetime.utcnow().isoformat()
            }
        
        mongo.close()
        return availability
    except Exception as e:
        print(f"Error getting live availability: {e}")
        mongo.close()
        return {}