import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  username: string;
}

interface Project {
  projectId: string;
  projectName: string;
}

interface AuthContextType {
  user: User | null;
  currentProject: Project | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, username: string, password: string) => boolean;
  logout: () => void;
  setProject: (project: Project | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedProject = localStorage.getItem('currentProject');
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedProject) setCurrentProject(JSON.parse(storedProject));
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const userData = { email: foundUser.email, username: foundUser.username };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = (email: string, username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === email || u.username === username)) {
      return false;
    }
    
    const newUser = { email, username, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentProject(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentProject');
  };

  const setProject = (project: Project | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project));
    } else {
      localStorage.removeItem('currentProject');
    }
  };

  return (
    <AuthContext.Provider value={{ user, currentProject, login, register, logout, setProject }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
