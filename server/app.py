# Import necessary libraries and modules
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import custom modules for database interactions
import usersDatabase as usersDB
import projectsDatabase as projectsDB
import hardwareDatabase as hardwareDB

# Initialize a new Flask web application
app = Flask(__name__)
CORS(app)

# Initialize databases
def init_all_dbs():
    usersDB.init_db()
    projectsDB.init_db()
    hardwareDB.init_db()

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    userId = data.get('userId')
    password = data.get('password')
    
    if usersDB.login(None, username, userId, password):
        return jsonify({'success': True, 'user': {'username': username, 'userId': userId}})
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Route for the main page
@app.route('/main')
def mainPage():
    userId = request.args.get('userId')
    projects = usersDB.getUserProjectsList(None, userId)
    return jsonify({'projects': projects})

# Route for joining a project
@app.route('/join_project', methods=['POST'])
def join_project():
    data = request.get_json()
    userId = data.get('userId')
    projectId = data.get('projectId')
    
    # Check if project exists
    project = projectsDB.queryProject(None, projectId)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Add user to project and project to user
    if projectsDB.addUser(None, projectId, userId) and usersDB.joinProject(None, userId, projectId):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Failed to join project'}), 400

# Route for adding a new user
@app.route('/add_user', methods=['POST'])
def add_user():
    print("Received registration request")
    data = request.get_json()
    print(f"Data received: {data}")
    username = data.get('username')
    userId = data.get('userId')
    password = data.get('password')
    
    if usersDB.addUser(None, username, userId, password):
        print("User created successfully")
        return jsonify({'success': True})
    
    print("User creation failed")
    return jsonify({'error': 'User already exists'}), 409

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
def get_user_projects_list():
    data = request.get_json()
    userId = data.get('userId')
    
    projects = usersDB.getUserProjectsList(None, userId)
    project_details = []
    
    for projectId in projects:
        project = projectsDB.queryProject(None, projectId)
        if project:
            project_details.append(project)
    
    return jsonify({'projects': project_details})

# Route for creating a new project
@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.get_json()
    projectName = data.get('projectName')
    projectId = data.get('projectId')
    description = data.get('description', '')
    userId = data.get('userId')
    
    if projectsDB.createProject(None, projectName, projectId, description):
        # Add creator to project
        projectsDB.addUser(None, projectId, userId)
        usersDB.joinProject(None, userId, projectId)
        return jsonify({'success': True})
    
    return jsonify({'error': 'Project ID already exists'}), 409

# Route for getting project information
@app.route('/get_project_info', methods=['POST'])
def get_project_info():
    data = request.get_json()
    projectId = data.get('projectId')
    
    project = projectsDB.queryProject(None, projectId)
    if project:
        return jsonify(project)
    
    return jsonify({'error': 'Project not found'}), 404

# Route for getting all hardware names
@app.route('/get_all_hw_names', methods=['POST'])
def get_all_hw_names():
    hw_names = hardwareDB.getAllHwNames(None)
    return jsonify({'hardware_names': hw_names})

# Route for getting hardware information
@app.route('/get_hw_info', methods=['POST'])
def get_hw_info():
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    
    hw_set = hardwareDB.queryHardwareSet(None, hwSetName)
    if hw_set:
        return jsonify(hw_set)
    
    return jsonify({'error': 'Hardware set not found'}), 404

# Route for checking out hardware
@app.route('/check_out', methods=['POST'])
def check_out():
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')
    
    if projectsDB.checkOutHW(None, projectId, hwSetName, qty, userId):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Insufficient hardware or invalid request'}), 400

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
def check_in():
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    userId = data.get('userId')
    
    if projectsDB.checkInHW(None, projectId, hwSetName, qty, userId):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Cannot check in more than checked out'}), 400

# Route for creating a new hardware set
@app.route('/create_hardware_set', methods=['POST'])
def create_hardware_set():
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    capacity = data.get('capacity')
    
    if hardwareDB.createHardwareSet(None, hwSetName, capacity):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Hardware set already exists'}), 409

# Route for checking the inventory of projects
@app.route('/api/inventory', methods=['GET'])
def check_inventory():
    # Get all hardware sets and their current usage
    hw_names = hardwareDB.getAllHwNames(None)
    inventory = {}
    
    for hw_name in hw_names:
        hw_set = hardwareDB.queryHardwareSet(None, hw_name)
        inventory[hw_name] = hw_set
    
    return jsonify({'inventory': inventory})

# Main entry point for the application
if __name__ == '__main__':
    init_all_dbs()
    app.run(debug=True, host='0.0.0.0', port=5000)