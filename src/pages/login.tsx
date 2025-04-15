
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Navigate } from 'react-router-dom';

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const { login, isAuthenticated, isLoading, role } = useAuth();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (role === 'student') return <Navigate to="/student/dashboard" />;
    if (role === 'instructor') return <Navigate to="/instructor/dashboard" />;
    if (role === 'secretary') return <Navigate to="/secretary/dashboard" />;
  }

  const onSubmit = async (data: FormValues) => {
    await login(data.email, data.password);
  };

  return (
    <AuthLayout
      title="University Exam Management"
      description="Login to access your account"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@university.edu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default LoginPage;
