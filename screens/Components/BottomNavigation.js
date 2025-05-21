
import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableWithoutFeedback, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Custom TabBarLabel component (same as original)
const TabBarLabel = ({ focused, label }) => (
  <Text style={{ color: focused ? '#000' : '#999', fontSize: 12, marginTop: 4 }}>
    {label}
  </Text>
);

const BottomNavigation = ({ page }) => {
  const [activeTab, setActiveTab] = useState(page);
  const navigation = useNavigation();

  const tabs = [
    { 
      name: 'Home', 
      action: 'HomeScreen',
      activeIcon: require('../../assets/icons/ic_selected_home.png'),
      inactiveIcon: require('../../assets/icons/ic_unselected_home.png')
    },
    { 
      name: 'My Booking', 
      action: 'Mybooking',
      activeIcon: require('../../assets/icons/ic_selected_booking.png'),
      inactiveIcon: require('../../assets/icons/ic_unselected_booking.png')
    },
    { 
      name: 'Shop', 
      action: 'Shop',
      activeIcon: require('../../assets/icons/ic_selected_shop.png'),
      inactiveIcon: require('../../assets/icons/ic_unselected_shop.png')
    },
    { 
      name: 'User', 
      action: 'User',
      activeIcon: require('../../assets/icons/ic_selected_profile.png'),
      inactiveIcon: require('../../assets/icons/ic_unselected_profile.png')
    },
  ];

  const menuClick = (tab) => {
    setActiveTab(tab.name);
    navigation.navigate(tab.action, { name: 'Vorn Makara' });
  };

  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab) => (
        <TouchableWithoutFeedback 
          key={tab.name}
          onPress={() => menuClick(tab)}
        >
          <View style={styles.tabButton}>
            <View style={activeTab === tab.name ? styles.activeTabIconContainer : null}>
              <Image 
                source={activeTab === tab.name ? tab.activeIcon : tab.inactiveIcon} 
                style={styles.icon} 
              />
            </View>
            <TabBarLabel focused={activeTab === tab.name} label={tab.name} />
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 80,
    paddingBottom: 5,
    paddingTop: 10,
    backgroundColor: 'rgba(243,243,243,255)',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%'
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  activeTabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000'
  }
});

export default BottomNavigation;