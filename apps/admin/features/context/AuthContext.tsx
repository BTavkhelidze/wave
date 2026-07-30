import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, ReactNode, useEffect } from 'react';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  type LoginCredentials,
  type User,
} from '../auth/api/auth';
import {
  isAuthRequestError,
  subscribeToSessionExpired,
} from '../../src/shared/api/httpClient';

type AuthProviderProps = {
  children: ReactNode;
};

export const authQueryKey = ['auth', 'me'] as const;

const AuthContext = createContext<
  | {
      user: User | null | undefined;
      isLoading: boolean;
      login: (credentials: LoginCredentials) => Promise<User>;
      logout: () => Promise<void>;
      refreshCurrentUser: () => Promise<User>;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchCurrentUserOrNull,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    return subscribeToSessionExpired(() => {
      void queryClient.cancelQueries({ queryKey: authQueryKey });
      queryClient.setQueryData(authQueryKey, null);
    });
  }, [queryClient]);

  const refreshCurrentUser = async () => {
    const currentUser = await fetchCurrentUser();

    queryClient.setQueryData(authQueryKey, currentUser);

    return currentUser;
  };

  const login = async (credentials: LoginCredentials) => {
    await loginUser(credentials);

    return refreshCurrentUser();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      if (!isAuthRequestError(error)) {
        throw error;
      }
    } finally {
      await queryClient.cancelQueries({ queryKey: authQueryKey });
      queryClient.setQueryData(authQueryKey, null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

async function fetchCurrentUserOrNull(): Promise<User | null> {
  try {
    return await fetchCurrentUser();
  } catch (error) {
    if (isAuthRequestError(error)) {
      return null;
    }

    throw error;
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within provider');

  return ctx;
};
