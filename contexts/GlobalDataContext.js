import React, { createContext, useState, useEffect } from 'react';
import http from '../services/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Create Context
const GlobalDataContext = createContext();

// Create Provider
const GlobalDataProvider = ({ children }) => {
  const [coupon, setCoupon] = useState('');
  const [appCountry, setAppCountry] = useState(null);
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [successfullyModalVisible, setSuccessfullyModalVisible] = useState(false);

  useEffect(() => {
    getDashboardDetail();
    getAppCountry();
    getSocialMedia();
    // initialize(); // Run once on app start
  }, []);

  const getAppCountry = async () => {

    try {
      // Step 1: Load cached user (for immediate access)
      const country = await AsyncStorage.getItem('country');
      if (country) {
        setAppCountry(JSON.parse(country))
      }

    } catch (err) {
      console.error('Error initializing user data:', err);
    }

  };

  const getDashboardDetail = async () => {
    try {
      const response = await http.get('/dashboard-detail');
      if (response.data.status) {
        setDashboardDetail(response.data?.data);
      }
    } catch (error) {
      console.error('Failed to load branches', error);
    } 
  };

  const getSocialMedia = async () => {
    try {
      const response = await http.get('/social');
      setSocialMedia(response.data);
    } catch (error) {
      console.error('Failed to load branches', error);
    } 
  };

  return (
    <GlobalDataContext.Provider value={{
      dashboardDetail,
      socialMedia,
      coupon,
      setCoupon,
      successfullyModalVisible,
      setSuccessfullyModalVisible,
      appCountry,
      setAppCountry
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export { GlobalDataContext, GlobalDataProvider };
