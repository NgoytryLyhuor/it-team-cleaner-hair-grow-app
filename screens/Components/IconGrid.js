import React from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomText from './CustomText';
import { Image } from 'expo-image';

const screenWidth = Dimensions.get('window').width;
const boxSize = (screenWidth - 70) / 3;

const dashboard_menu_coupon = require('../../assets/icons/dashboard_menu_coupon.png');
const dashboard_menu_referral = require('../../assets/icons/dashboard_menu_referral.png');
const dashboard_menu_points = require('../../assets/icons/dashboard_menu_points.png');
const dashboard_menu_fbecsite = require('../../assets/icons/dashboard_menu_fbecsite.png');
const dashboard_menu_inquiry = require('../../assets/icons/dashboard_menu_inquiry.png');
const dashboard_menu_notifications = require('../../assets/icons/dashboard_menu_notifications.png');

const menuItems = [
  { id: '1', title: 'Points', image: dashboard_menu_points, action: 'Points' },
  { id: '2', title: 'Referral', image: dashboard_menu_referral, action: 'Referral' },
  { id: '3', title: 'Coupon', image: dashboard_menu_coupon, action: 'Coupon' },
  { id: '4', title: 'Product', image: dashboard_menu_fbecsite, action: 'Shop' },
  { id: '5', title: 'Inquiry', image: dashboard_menu_inquiry, action: 'Inquiry' },
  { id: '6', title: 'Notifications', image: dashboard_menu_notifications, action: 'Notifications' }
];

const IconGrid = ({ openModal }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {menuItems.map((item) => (
          <Pressable
            onPress={
              item.action === 'Inquiry'
                ? openModal
                : () => navigation.navigate(item.action)
            }
            key={item.id}
            style={styles.menuItem}
          >
            <Image 
              style={styles.menuIcon} 
              source={item.image} 
              contentFit="contain"
            />
            <CustomText style={styles.menuText}>
              {item.title}
            </CustomText>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: boxSize,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: '#333',
  },
});

export default IconGrid;