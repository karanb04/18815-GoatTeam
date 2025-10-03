import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FolderPlus, LogIn as LoginIcon, Folder } from 'lucide-react';

interface Project {
  projectId: string;
  projectName: string;
  description: string;
  createdBy: string;
}

export default function Dashboard() {
  const { user, setProject } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    projectId: '',
    projectName: '',
    description: ''
  });
  const [accessProjectId, setAccessProjectId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const userProjects = storedProjects.filter((p: Project) => p.createdBy === user.email);
    setProjects(userProjects);
  }, [user, navigate]);

  const validateNewProject = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newProject.projectId.trim()) newErrors.projectId = 'Project ID is required';
    if (!newProject.projectName.trim()) newErrors.projectName = 'Project name is required';
    
    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (allProjects.find((p: Project) => p.projectId === newProject.projectId.trim())) {
      newErrors.projectId = 'Project ID already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNewProject()) return;

    const project: Project = {
      projectId: newProject.projectId.trim(),
      projectName: newProject.projectName.trim(),
      description: newProject.description.trim(),
      createdBy: user!.email
    };

    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    allProjects.push(project);
    localStorage.setItem('projects', JSON.stringify(allProjects));
    
    setProjects([...projects, project]);
    setProject({ projectId: project.projectId, projectName: project.projectName });
    
    toast({
      title: 'Project created successfully!',
      description: `${project.projectName} is ready to use.`,
    });

    setNewProject({ projectId: '', projectName: '', description: '' });
    setErrors({});
    navigate('/hardware');
  };

  const handleAccessProject = (e: React.FormEvent) => {
    e.preventDefault();

    const allProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = allProjects.find((p: Project) => p.projectId === accessProjectId.trim());

    if (!project) {
      setErrors({ access: 'Project not found' });
      return;
    }

    setProject({ projectId: project.projectId, projectName: project.projectName });
    toast({
      title: 'Project accessed successfully!',
      description: `Logged into ${project.projectName}`,
    });
    
    setAccessProjectId('');
    setErrors({});
    navigate('/hardware');
  };

  const handleProjectClick = (project: Project) => {
    setProject({ projectId: project.projectId, projectName: project.projectName });
    navigate('/hardware');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2">Project Dashboard</h1>
          <p className="text-muted-foreground">
            Create new projects or access existing ones to manage hardware resources
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-accent" />
                Create New Project
              </CardTitle>
              <CardDescription>
                Start a new project to manage hardware allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input
                    id="projectId"
                    value={newProject.projectId}
                    onChange={(e) => setNewProject({ ...newProject, projectId: e.target.value })}
                    placeholder="e.g., PRJ-001"
                    aria-invalid={!!errors.projectId}
                  />
                  {errors.projectId && (
                    <p className="text-sm text-destructive">{errors.projectId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProject.projectName}
                    onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                    placeholder="e.g., ML Training Pipeline"
                    aria-invalid={!!errors.projectName}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-destructive">{errors.projectName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LoginIcon className="h-5 w-5 text-accent" />
                Access Existing Project
              </CardTitle>
              <CardDescription>
                Enter a project ID to access and manage its resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessProjectId">Project ID</Label>
                  <Input
                    id="accessProjectId"
                    value={accessProjectId}
                    onChange={(e) => setAccessProjectId(e.target.value)}
                    placeholder="Enter project ID"
                    aria-invalid={!!errors.access}
                  />
                  {errors.access && (
                    <p className="text-sm text-destructive">{errors.access}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  <LoginIcon className="h-4 w-4 mr-2" />
                  Access Project
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {projects.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-accent" />
                Your Projects
              </CardTitle>
              <CardDescription>
                Click on a project to access it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {projects.map((project) => (
                  <button
                    key={project.projectId}
                    onClick={() => handleProjectClick(project)}
                    className="p-4 border rounded-lg hover:bg-accent-soft hover:border-accent transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{project.projectName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">ID: {project.projectId}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                        )}
                      </div>
                      <Folder className="h-5 w-5 text-accent ml-4" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
