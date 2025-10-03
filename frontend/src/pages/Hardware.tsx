import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Download, Upload } from 'lucide-react';

interface HardwareSet {
  name: string;
  totalCapacity: number;
  available: number;
  checkedOutByProject: Record<string, number>;
}

export default function Hardware() {
  const { user, currentProject } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hwSets, setHwSets] = useState<{ hwSet1: HardwareSet; hwSet2: HardwareSet }>({
    hwSet1: {
      name: 'HWSet1',
      totalCapacity: 100,
      available: 100,
      checkedOutByProject: {}
    },
    hwSet2: {
      name: 'HWSet2',
      totalCapacity: 100,
      available: 100,
      checkedOutByProject: {}
    }
  });

  const [checkoutAmounts, setCheckoutAmounts] = useState({ hwSet1: '', hwSet2: '' });
  const [checkinAmounts, setCheckinAmounts] = useState({ hwSet1: '', hwSet2: '' });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'checkout' | 'checkin';
    hwSet: 'hwSet1' | 'hwSet2';
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (!user || !currentProject) {
      navigate('/dashboard');
      return;
    }

    const storedHwSets = localStorage.getItem('hwSets');
    if (storedHwSets) {
      setHwSets(JSON.parse(storedHwSets));
    }
  }, [user, currentProject, navigate]);

  const saveHwSets = (newHwSets: typeof hwSets) => {
    setHwSets(newHwSets);
    localStorage.setItem('hwSets', JSON.stringify(newHwSets));
  };

  const handleCheckoutRequest = (hwSet: 'hwSet1' | 'hwSet2') => {
    const amount = parseInt(checkoutAmounts[hwSet]);
    
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (amount > hwSets[hwSet].available) {
      toast({
        title: 'Insufficient hardware',
        description: `Only ${hwSets[hwSet].available} units available`,
        variant: 'destructive',
      });
      return;
    }

    setConfirmDialog({ open: true, action: 'checkout', hwSet, amount });
  };

  const handleCheckinRequest = (hwSet: 'hwSet1' | 'hwSet2') => {
    const amount = parseInt(checkinAmounts[hwSet]);
    const currentCheckedOut = hwSets[hwSet].checkedOutByProject[currentProject!.projectId] || 0;
    
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (amount > currentCheckedOut) {
      toast({
        title: 'Invalid check-in',
        description: `You can only check in up to ${currentCheckedOut} units`,
        variant: 'destructive',
      });
      return;
    }

    setConfirmDialog({ open: true, action: 'checkin', hwSet, amount });
  };

  const executeAction = () => {
    if (!confirmDialog || !currentProject) return;

    const { action, hwSet, amount } = confirmDialog;
    const newHwSets = { ...hwSets };
    const projectId = currentProject.projectId;

    if (action === 'checkout') {
      newHwSets[hwSet].available -= amount;
      newHwSets[hwSet].checkedOutByProject[projectId] = 
        (newHwSets[hwSet].checkedOutByProject[projectId] || 0) + amount;
      
      toast({
        title: 'Hardware checked out',
        description: `Successfully checked out ${amount} units from ${hwSets[hwSet].name}`,
      });
      
      setCheckoutAmounts({ ...checkoutAmounts, [hwSet]: '' });
    } else {
      newHwSets[hwSet].available += amount;
      newHwSets[hwSet].checkedOutByProject[projectId] -= amount;
      
      if (newHwSets[hwSet].checkedOutByProject[projectId] === 0) {
        delete newHwSets[hwSet].checkedOutByProject[projectId];
      }
      
      toast({
        title: 'Hardware checked in',
        description: `Successfully checked in ${amount} units to ${hwSets[hwSet].name}`,
      });
      
      setCheckinAmounts({ ...checkinAmounts, [hwSet]: '' });
    }

    saveHwSets(newHwSets);
    setConfirmDialog(null);
  };

  const renderHardwareCard = (hwSet: 'hwSet1' | 'hwSet2') => {
    const data = hwSets[hwSet];
    const checkedOutByProject = data.checkedOutByProject[currentProject?.projectId || ''] || 0;

    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent" />
            {data.name}
          </CardTitle>
          <CardDescription>Hardware resource management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold text-foreground mt-1">{data.totalCapacity}</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-success mt-1">{data.available}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent-soft border border-accent/20">
              <p className="text-sm text-muted-foreground">Your Checkout</p>
              <p className="text-2xl font-bold text-accent mt-1">{checkedOutByProject}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-3">
              <Label htmlFor={`checkout-${hwSet}`}>Checkout Quantity</Label>
              <div className="flex gap-2">
                <Input
                  id={`checkout-${hwSet}`}
                  type="number"
                  min="1"
                  value={checkoutAmounts[hwSet]}
                  onChange={(e) => setCheckoutAmounts({ ...checkoutAmounts, [hwSet]: e.target.value })}
                  placeholder="Enter quantity"
                />
                <Button onClick={() => handleCheckoutRequest(hwSet)} className="min-w-[120px]">
                  <Download className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor={`checkin-${hwSet}`}>Check-in Quantity</Label>
              <div className="flex gap-2">
                <Input
                  id={`checkin-${hwSet}`}
                  type="number"
                  min="1"
                  value={checkinAmounts[hwSet]}
                  onChange={(e) => setCheckinAmounts({ ...checkinAmounts, [hwSet]: e.target.value })}
                  placeholder="Enter quantity"
                />
                <Button onClick={() => handleCheckinRequest(hwSet)} variant="secondary" className="min-w-[120px]">
                  <Upload className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">Hardware Manager</h1>
          <p className="text-muted-foreground">
            Current Project: <span className="text-foreground font-medium">{currentProject.projectName}</span>
            {' '}(ID: {currentProject.projectId})
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {renderHardwareCard('hwSet1')}
          {renderHardwareCard('hwSet2')}
        </div>
      </div>

      {confirmDialog && (
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm {confirmDialog.action === 'checkout' ? 'Check Out' : 'Check In'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {confirmDialog.action === 'checkout' ? 'check out' : 'check in'}{' '}
                <span className="font-semibold">{confirmDialog.amount}</span> units {confirmDialog.action === 'checkout' ? 'from' : 'to'}{' '}
                {hwSets[confirmDialog.hwSet].name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeAction}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
