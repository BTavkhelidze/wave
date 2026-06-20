import { QueryClient, useQuery } from '@tanstack/react-query';
import { Children, createContext, useContext, ReactNode } from 'react';
import { fetchCurrentUser, logoutUser } from '../auth/api/auth';

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<
  | {
      user: any;
      isLoading: boolean;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = new QueryClient();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async () => {
    await logoutUser();

    queryClient.setQueryData(['auth', 'me'], null);

    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
