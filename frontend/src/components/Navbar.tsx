import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Cpu, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>UT Hardware Portal</span>
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/hardware">
              <Button variant="ghost">Hardware</Button>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="text-foreground font-medium">{user.username}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
