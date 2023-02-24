import { useCallback, useContext, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AUTH_TOKEN } from '../pages/_app';
import { AuthContext } from '../pages/_app';

export const useAuth = () => {
  const { userToken, setUserToken } = useContext(AuthContext);
  const { setItem, getItem } = useLocalStorage();

  const addToken = useCallback((token: string) => {
    setUserToken(token);
    setItem(AUTH_TOKEN, JSON.stringify(token));
  }, [setItem, setUserToken]);

  useEffect(() => {
    const token = getItem(AUTH_TOKEN);
    if (token) {
      addToken(JSON.parse(token));
    }
  }, [addToken, getItem]);


  const removeToken = () => {
    setUserToken(null);
    setItem(AUTH_TOKEN, '');
  };

  const login = (token: string) => {
    addToken(token);
  };

  const logout = () => {
    removeToken();
  };

  return { userToken, login, logout, setUserToken };
};
