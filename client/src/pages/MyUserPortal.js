import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Project from '../components/Project';

function MyUserPortal() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hardwareInfo, setHardwareInfo] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showJoinProject, setShowJoinProject] = useState(false);
  const navigate = useNavigate();

  const [newProject, setNewProject] = useState({
    projectName: '',
    projectId: '',
    description: ''
  });

  const [joinProjectId, setJoinProjectId] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserProjects(parsedUser.username);
    fetchHardwareInfo();
  }, [navigate]);

  const fetchUserProjects = async (username) => {
    try {
      const response = await fetch('/get_user_projects_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchHardwareInfo = async () => {
    try {
      const response = await fetch('/get_all_hw_names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const hwDetails = await Promise.all(
          data.hardware_names.map(async (hwName) => {
            const hwResponse = await fetch('/get_hw_info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ hwSetName: hwName }),
            });
            return hwResponse.ok ? await hwResponse.json() : null;
          })
        );
        setHardwareInfo(hwDetails.filter(hw => hw !== null));
      }
    } catch (error) {
      console.error('Error fetching hardware info:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/create_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newProject,
          username: user.username
        }),
      });
      
      if (response.ok) {
        setShowCreateProject(false);
        setNewProject({ projectName: '', projectId: '', description: '' });
        fetchUserProjects(user.username);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create project');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/join_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          projectId: joinProjectId
        }),
      });
      
      if (response.ok) {
        setShowJoinProject(false);
        setJoinProjectId('');
        fetchUserProjects(user.username);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to join project');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleCheckout = async (projectId, hwSetName, qty, username) => {
    try {
      const response = await fetch('/check_out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          hwSetName,
          qty,
          username
        }),
      });
      
      if (response.ok) {
        // Refresh data after successful checkout
        await fetchUserProjects(user.username);
        await fetchHardwareInfo();
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to checkout hardware');
        return false;
      }
    } catch (error) {
      alert('Network error. Please try again.');
      return false;
    }
  };

  const handleCheckin = async (projectId, hwSetName, qty, username) => {
    try {
      const response = await fetch('/check_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          hwSetName,
          qty,
          username
        }),
      });
      
      if (response.ok) {
        // Refresh data after successful checkin
        await fetchUserProjects(user.username);
        await fetchHardwareInfo();
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to checkin hardware');
        return false;
      }
    } catch (error) {
      alert('Network error. Please try again.');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>UT Hardware Portal</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="portal-main">
        <div className="user-management">
            <div className="management-section">
              <h2>User Management</h2>
              
              <div className="action-buttons">
                <button 
                  className="create-btn"
                  onClick={() => setShowCreateProject(true)}
                >
                  Create New Project
                </button>
                <button 
                  className="join-btn"
                  onClick={() => setShowJoinProject(true)}
                >
                  Join Existing Project
                </button>
              </div>

              {showCreateProject && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>Create New Project</h3>
                    <form onSubmit={handleCreateProject}>
                      <div className="form-group">
                        <label>Project Name:</label>
                        <input
                          type="text"
                          value={newProject.projectName}
                          onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Project ID:</label>
                        <input
                          type="text"
                          value={newProject.projectId}
                          onChange={(e) => setNewProject({...newProject, projectId: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        />
                      </div>
                      <div className="modal-buttons">
                        <button type="submit">Create</button>
                        <button type="button" onClick={() => setShowCreateProject(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {showJoinProject && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>Join Existing Project</h3>
                    <form onSubmit={handleJoinProject}>
                      <div className="form-group">
                        <label>Project ID:</label>
                        <input
                          type="text"
                          value={joinProjectId}
                          onChange={(e) => setJoinProjectId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="modal-buttons">
                        <button type="submit">Join</button>
                        <button type="button" onClick={() => setShowJoinProject(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="projects-list">
                <h3>Your Projects</h3>
                {projects.length === 0 ? (
                  <p>No projects found. Create or join a project to get started.</p>
                ) : (
                  <div className="projects-grid">
                    {projects.map((project) => (
                      <Project 
                        key={project.projectId} 
                        project={project} 
                        onSelect={setSelectedProject}
                        isSelected={selectedProject?.projectId === project.projectId}
                        onCheckout={handleCheckout}
                        onCheckin={handleCheckin}
                        hardwareInfo={hardwareInfo}
                        user={user}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}

export default MyUserPortal;