import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadUser = async () => {
         const token = localStorage.getItem('token');
         if (token) {
            try {
               const response = await api.get('/user/profile');
               setUser(response.data);
            } catch (error) {
               console.error('Error fetching user profile:', error);
               localStorage.removeItem('token');
            }
         }
         setLoading(false);
      };

      loadUser();
   }, []);

   const login = async (username, password) => {
      try {
         const response = await api.post('/auth/login', { username, password });
         localStorage.setItem('token', response.data.token);
         setUser(response.data.user);
         return true;
      } catch (error) {
         console.error('Login error:', error);
         return false;
      }
   };

   const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
   };

   const updateUser = (userData) => {
      setUser(userData);
   };

   return (
      <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);