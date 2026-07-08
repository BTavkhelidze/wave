import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, ReactNode } from 'react';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  type LoginCredentials,
  type User,
} from '../auth/api/auth';

type AuthProviderProps = {
  children: ReactNode;
};

const authQueryKey = ['auth', 'me'] as const;

const AuthContext = createContext<
  | {
      user: User | null | undefined;
      isLoading: boolean;
      login: (credentials: LoginCredentials) => Promise<void>;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (credentials: LoginCredentials) => {
    await loginUser(credentials);
    const currentUser = await fetchCurrentUser();

    queryClient.setQueryData(authQueryKey, currentUser);
  };

  const logout = async () => {
    await logoutUser();

    queryClient.setQueryData(authQueryKey, null);
    queryClient.removeQueries({ queryKey: authQueryKey });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within provider');

  return ctx;
};
