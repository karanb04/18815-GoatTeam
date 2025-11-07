# Import necessary libraries and modules
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Import custom modules for database interactions
from . import mongoDatabase as mongoDB
import os

# Initialize a new Flask web application
app = Flask(__name__, static_folder='../client/build', static_url_path='/')

# Configure CORS for React frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})


# Initialize databases
def init_all_dbs():
    mongoDB.init_db()

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Always serve index.html for React routing
        return send_from_directory(app.static_folder, 'index.html')

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if mongoDB.loginUser(username, password):
        return jsonify({'success': True, 'user': {'username': username}})
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Route for the main page
@app.route('/main')
def mainPage():
    username = request.args.get('username')
    projects = mongoDB.getUserProjects(username)
    return jsonify({'projects': projects})

# Route for joining a project
@app.route('/join_project', methods=['POST'])
def join_project():
    data = request.get_json()
    username = data.get('username')
    projectId = data.get('projectId')
    
    # Check if project exists
    project = mongoDB.queryProject(projectId)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Add user to project and project to user
    if mongoDB.joinProject(username, projectId):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Failed to join project'}), 400

# Route for adding a new user
@app.route('/add_user', methods=['POST'])
def add_user():
    print("Received registration request")
    data = request.get_json()
    print(f"Data received: {data}")
    username = data.get('username')
    password = data.get('password')
    
    if mongoDB.addUser(username, password):
        print("User created successfully")
        return jsonify({'success': True})
    
    print("User creation failed")
    return jsonify({'error': 'User already exists'}), 409

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
def get_user_projects_list():
    data = request.get_json()
    username = data.get('username')
    
    projects = mongoDB.getUserProjects(username)
    project_details = []
    
    for projectId in projects:
        project = mongoDB.queryProject(projectId)
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
    username = data.get('username')
    
    if mongoDB.createProject(projectName, projectId, description, username):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Project ID already exists'}), 409

# Route for getting project information
@app.route('/get_project_info', methods=['POST'])
def get_project_info():
    data = request.get_json()
    projectId = data.get('projectId')
    
    project = mongoDB.queryProject(projectId)
    if project:
        return jsonify(project)
    
    return jsonify({'error': 'Project not found'}), 404

# Route for getting all hardware names
@app.route('/get_all_hw_names', methods=['POST'])
def get_all_hw_names():
    hw_names = mongoDB.getAllHwNames()
    return jsonify({'hardware_names': hw_names})

# Route for getting hardware information
@app.route('/get_hw_info', methods=['POST'])
def get_hw_info():
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    
    hw_set = mongoDB.queryHardwareSet(hwSetName)
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
    username = data.get('username')
    
    if mongoDB.checkOutHW(projectId, hwSetName, qty, username):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Insufficient hardware or invalid request'}), 400

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
def check_in():
    data = request.get_json()
    projectId = data.get('projectId')
    hwSetName = data.get('hwSetName')
    qty = data.get('qty')
    username = data.get('username')
    
    if mongoDB.checkInHW(projectId, hwSetName, qty, username):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Cannot check in more than checked out'}), 400

# Route for creating a new hardware set
@app.route('/create_hardware_set', methods=['POST'])
def create_hardware_set():
    data = request.get_json()
    hwSetName = data.get('hwSetName')
    capacity = data.get('capacity')
    
    if mongoDB.createHardwareSet(hwSetName, capacity):
        return jsonify({'success': True})
    
    return jsonify({'error': 'Hardware set already exists'}), 409

# Route for checking the inventory of projects
@app.route('/api/inventory', methods=['GET'])
def check_inventory():
    # Get all hardware sets and their current usage
    inventory = mongoDB.getInventory()
    return jsonify({'inventory': inventory})

# Main entry point for the application
if __name__ == '__main__':
    init_all_dbs()
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 4321)))
