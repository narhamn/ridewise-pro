import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShuttle } from '@/contexts/ShuttleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const DriverLogin = () => {
  const [email, setEmail] = useState('budi@shuttle.com');
  const [password, setPassword] = useState('password');
  const { login } = useShuttle();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, 'driver');
    navigate('/driver');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🚛</div>
          <CardTitle>Login Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Masuk sebagai Driver</Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary">← Kembali</Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverLogin;
