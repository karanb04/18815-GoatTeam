
function Project({ project, onSelect }) {
  return (
    <div className="project-card" onClick={() => onSelect(project)}>
      <h4>{project.projectName}</h4>
      <p>ID: {project.projectId}</p>
      {project.description && <p>{project.description}</p>}
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
  );
}

export default Project;