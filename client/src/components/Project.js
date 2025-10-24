
import { useState } from 'react';

function Project({ project, onSelect, isSelected, onCheckout, onCheckin, hardwareInfo, user }) {
  const [checkoutData, setCheckoutData] = useState({});
  const [checkinData, setCheckinData] = useState({});

  const handleCheckout = async (hwSetName) => {
    const qty = parseInt(checkoutData[hwSetName] || 0);
    if (qty > 0) {
      const success = await onCheckout(project.projectId, hwSetName, qty, user.username);
      if (success) {
        setCheckoutData({...checkoutData, [hwSetName]: ''});
      }
    }
  };

  const handleCheckin = async (hwSetName) => {
    const qty = parseInt(checkinData[hwSetName] || 0);
    if (qty > 0) {
      const success = await onCheckin(project.projectId, hwSetName, qty, user.username);
      if (success) {
        setCheckinData({...checkinData, [hwSetName]: ''});
      }
    }
  };

  return (
    <div className={`project-card ${isSelected ? 'selected' : ''}`}>
      <div className="project-header" onClick={() => onSelect(project)}>
        <h4>{project.projectName}</h4>
        <p>ID: {project.projectId}</p>
        {project.description && <p className="description">{project.description}</p>}
        <div className="project-hardware">
          <strong>Hardware Usage:</strong>
          {Object.keys(project.hwSets || {}).length === 0 ? (
            <span> None</span>
          ) : (
            Object.entries(project.hwSets || {}).map(([hwName, qty]) => (
              <span key={hwName}> {hwName}: {qty}</span>
            ))
          )}
        </div>
      </div>

      {isSelected && (
        <div className="project-details">
          <div className="project-users">
            <strong>Project Members:</strong>
            {project.users && project.users.length > 0 ? (
              <ul>
                {project.users.map((username, index) => (
                  <li key={index}>{username}</li>
                ))}
              </ul>
            ) : (
              <span> No members</span>
            )}
          </div>

          <div className="hardware-management">
            <h5>Hardware Management</h5>
            <div className="hardware-actions">
              {hardwareInfo && hardwareInfo.map((hw) => (
                <div key={hw.hwName} className="hardware-item">
                  <div className="hardware-info">
                    <span className="hw-name">{hw.hwName}</span>
                    <span className="hw-availability">Available: {hw.availability}</span>
                    <span className="hw-project-usage">
                      Project Usage: {project.hwSets?.[hw.hwName] || 0}
                    </span>
                  </div>
                  
                  <div className="hardware-controls">
                    <div className="checkout-section">
                      <label>Checkout:</label>
                      <input
                        type="number"
                        min="1"
                        max={hw.availability}
                        value={checkoutData[hw.hwName] || ''}
                        onChange={(e) => setCheckoutData({
                          ...checkoutData,
                          [hw.hwName]: e.target.value
                        })}
                        placeholder="Qty"
                      />
                      <button 
                        onClick={() => handleCheckout(hw.hwName)}
                        disabled={!checkoutData[hw.hwName] || checkoutData[hw.hwName] <= 0 || checkoutData[hw.hwName] > hw.availability}
                      >
                        Checkout
                      </button>
                    </div>
                    
                    <div className="checkin-section">
                      <label>Checkin:</label>
                      <input
                        type="number"
                        min="1"
                        max={project.hwSets?.[hw.hwName] || 0}
                        value={checkinData[hw.hwName] || ''}
                        onChange={(e) => setCheckinData({
                          ...checkinData,
                          [hw.hwName]: e.target.value
                        })}
                        placeholder="Qty"
                      />
                      <button 
                        onClick={() => handleCheckin(hw.hwName)}
                        disabled={
                          !checkinData[hw.hwName] || 
                          checkinData[hw.hwName] <= 0 || 
                          checkinData[hw.hwName] > (project.hwSets?.[hw.hwName] || 0)
                        }
                      >
                        Checkin
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;