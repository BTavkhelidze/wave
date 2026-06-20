import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '../schema/LoginShcema';

// import { Input } from "../../src/components/ui/input";
// import { Label } from "../../src/components/ui/label";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../src/components/ui/form";

// import { Button } from '../../src/components/ui/button';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify';

function Login() {
  // Use form setup
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast({ title: 'Success', description: 'Logged in!' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='max-w-md mx-auto mt-10 p-6 bg-gray-400 rounded-xl shadow-md '>
      <h2 className='text-2xl font-bold mb-6'>Login</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='example@gmail.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='••••••••' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full'>
            Log In
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Login;
