import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  Modal,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageContext } from '../contexts/StorageContext';
import http from '../services/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';

// Get initial dimensions
const { width, height } = Dimensions.get('window');

const SettingScreen = ({ navigation }) => {
  const { userDetail, setUserDetail } = useContext(StorageContext);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const [screenDimensions, setScreenDimensions] = useState({ width, height });

  // Add listener for dimension changes
  useEffect(() => {
    const dimensionSubscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
    });

    return () => {
      // Clean up subscription when component unmounts
      if (dimensionSubscription?.remove) {
        dimensionSubscription.remove();
      }
    };
  }, []);

  const handleLanguage = () => {
    navigation.navigate('LanguageScreen');
  };

  const handleCountry = () => {
    navigation.navigate('Country');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const openDeleteModal = () => {
    setDeleteModalVisible(true);
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.17, 0.67, 0.83, 0.67),
        useNativeDriver: true
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  const closeDeleteModal = () => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setDeleteModalVisible(false);
    });
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await http.post('delete-account');

      if (response.data.status) {

        // Clear user state
        setUserDetail(null);

        // Remove data from AsyncStorage
        await AsyncStorage.multiRemove(['user', 'token']);

        // Close modal
        closeDeleteModal();

        // Navigate to Home screen
        navigation.navigate('HomeScreen');

        // Show success toast
        Toast.success(response.data.message || 'Account deleted successfully.');

      } else {
        Toast.error(response.data.message || 'Failed to delete account');
      }

    } catch (error) {
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        // Log or toast specific errors (customize this as needed)
        const firstErrorKey = Object.keys(serverErrors)[0];
        const firstErrorMessage = serverErrors[firstErrorKey]?.[0];
        Toast.error(firstErrorMessage || 'Failed to delete account. Please try again.');

      } else {
        Toast.error('An error occurred. Please try again.');
      }
      // Optional: Log full error for dev debugging
      console.error('Account deletion error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.pop()}
          style={[styles.backButton, { zIndex: 10 }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.8}
            onPress={handleLanguage}
          >
            <View style={styles.settingInfo}>
              <Image
                source={require('../assets/icons/ic_app_language.png')}
                style={styles.settingIcon}
              />
              <Text style={styles.settingName}>Language</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            activeOpacity={0.8}
            onPress={handleCountry}
          >
            <View style={styles.settingInfo}>
              <Image
                source={require('../assets/icons/ic_app_language.png')}
                style={styles.settingIcon}
              />
              <Text style={styles.settingName}>Country</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingCard, { display: userDetail ? '' : 'none' }]}
            activeOpacity={0.8}
            onPress={handleChangePassword}
          >
            <View style={styles.settingInfo}>
              <Image
                source={require('../assets/icons/ic_lock.png')}
                style={styles.settingIcon}
              />
              <Text style={styles.settingName}>Change Password</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingCard, { display: userDetail ? '' : 'none' }]}
            activeOpacity={0.8}
            onPress={openDeleteModal}
          >
            <View style={styles.settingInfo}>
              <Image
                source={require('../assets/icons/ic_delete_account.png')}
                style={styles.settingIcon}
              />
              <Text style={styles.settingName}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { width: screenDimensions.width, height: screenDimensions.height }]}
          activeOpacity={1}
          onPress={closeDeleteModal}
        >
          <Animated.View
            style={[
              styles.modalContentContainer,
              { opacity: modalOpacity, width: screenDimensions.width, height: screenDimensions.height }
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => { }} // Empty function to prevent closing when clicking modal content
            >
              <Animated.View style={[
                styles.modalContainer,
                {
                  transform: [{ scale: modalScale }],
                  opacity: modalOpacity,
                  width: screenDimensions.width * 0.85,
                  maxWidth: 500, // Limit max width on larger screens
                  maxHeight: screenDimensions.height * 0.7
                }
              ]}>

                <View style={styles.profileContain}>
                  <Image
                    source={require('../assets/icons/ic_profile_delete.png')}
                    style={styles.settingIcon}
                    width={50}
                    height={50}
                    tintColor='#ff4444'
                  />
                </View>

                <Text style={styles.modalWarning}>
                  Your data will not be able to be restored after the deletion!
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeDeleteModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={confirmDeleteAccount}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 20,
    height: height * 0.11,
    backgroundColor: '#000',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    zIndex: 1
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: 27,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    marginLeft: -30,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    marginTop: -15,
  },
  settingsContainer: {
    marginTop: 10,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingName: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: 'bold',
  },
  profileContain: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE3E3',
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: '#777'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: -40,
    paddingVertical: 30
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  modalContent: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 8,
  },
  modalWarning: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 125,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingScreen;