import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../src/components/ui/form';
import { Input } from '../../src/components/ui/input';
import { useAuth } from '../context/AuthContext';
import { LoginSchema } from './schema/LoginShcema';

type LoginFormValues = z.infer<typeof LoginSchema>;

function Login() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success('Logged in!');
    } catch {
      toast.error('Invalid credentials');
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
                  <Input type='password' placeholder='********' {...field} />
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
