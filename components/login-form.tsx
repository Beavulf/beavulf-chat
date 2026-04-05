'use client'

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm(
  { 
    className, 
    onSignUp, 
    onForgot,
    onSuccess, 
    ...props }: 
  React.ComponentPropsWithoutRef<'div'> & 
  {onSignUp: ()=>void, onForgot: ()=>void, onSuccess: ()=>void}
) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signInUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInUser.mutate({email, password},
      { onSuccess: () => onSuccess() }
    );
    setEmail('');
    setPassword('');
    setError(null);
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>Введите свой email и пароль для входа</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <div
                    onClick={onForgot}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline cursor-pointer"
                  >
                    Забыли пароль?
                  </div>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={signInUser.isPending}>
                {signInUser.isPending ? 'Вход...' : 'Войти'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Не зарегистрированы?{' '}
              <div onClick={onSignUp} className="underline underline-offset-4 cursor-pointer">
                Регистрация
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
