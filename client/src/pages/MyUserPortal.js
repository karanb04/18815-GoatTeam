import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyUserPortal() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [navigate]);

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
        <div className="dashboard">
          <h2>Dashboard</h2>
          <div className="dashboard-cards">
            <div className="card">
              <h3>Projects</h3>
              <p>Manage your projects</p>
              <button disabled>Coming Soon</button>
            </div>
            <div className="card">
              <h3>Hardware</h3>
              <p>Check out/in hardware</p>
              <button disabled>Coming Soon</button>
            </div>
            <div className="card">
              <h3>Inventory</h3>
              <p>View hardware status</p>
              <button disabled>Coming Soon</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyUserPortal;