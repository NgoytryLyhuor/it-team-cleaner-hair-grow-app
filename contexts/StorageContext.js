import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import http from '../services/http';

const StorageContext = createContext();

const StorageProvider = ({ children }) => {
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Load cached user (for immediate access)
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedUser) {
          const data = JSON.parse(storedUser);
          getUserDetail(data);
        }
      } catch (err) {
        console.error('Error initializing user data:', err);
      }
    };

    initialize(); // Run once on app start
  }, []);

  const logout = async () => {
    try {
      setUserDetail(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDetail = async (data) => {
    try {
      const res = await http.get('/user-detail?id=' + data?.id);
      if (res.data.status) {
        setUserDetail(res.data.data);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      setUserDetail(null);
      console.error('Fetch user failed:', err);
    }
    return null;
  };

  return (
    <StorageContext.Provider value={{ userDetail, setUserDetail, logout, getUserDetail }}>
      {children}
    </StorageContext.Provider>
  );
};

export { StorageContext, StorageProvider };
