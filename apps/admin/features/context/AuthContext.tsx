import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, ReactNode } from 'react';
import { fetchCurrentUser, loginUser, logoutUser, type AuthUser } from '../auth/api/auth';
import type { IData } from '../interface/interface';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextValue = {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  login: (credential: IData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = async (credential: IData) => {
    await loginUser(credential);
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const logout = async () => {
    await logoutUser();

    queryClient.setQueryData<AuthUser | null>(['auth', 'me'], null);

    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
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
