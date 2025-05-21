import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
} from 'react-native';
import React, { useState } from 'react';

const { width } = Dimensions.get('window');

const InquiryModal = ({ modalVisible, closeModal, socialMedia, appCountry }) => {
  const [selectedApp, setSelectedApp] = useState(null);

  const handleSelect = () => {
    if (!selectedApp || !socialMedia) {
      console.warn('No app selected or social media data missing');
      setSelectedApp(null);
      closeModal();
      return;
    }

    let url = null;
    if (selectedApp === 'telegram') {
      url = socialMedia?.telegram_chanel;
    } else if (selectedApp === 'facebook') {
      url = socialMedia?.facebook_link;
    } else if (selectedApp === 'zalo') {
      url = 'https://zalo.me/0931542264';
    }

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.warn('Failed to open URL:', err);
      });
    } else {
      console.warn('Invalid URL for', selectedApp);
    }

    setSelectedApp(null);
    closeModal();
  };

  const handleClose = () => {
    setSelectedApp(null);
    closeModal();
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
        accessibilityLabel="Inquiry Modal"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 justify-center items-center bg-black/40 w-full">
            <TouchableWithoutFeedback>
              <View
                className="bg-white rounded-2xl overflow-hidden"
                style={{ width: width * 0.8 }}
              >
                <Text style={{ fontFamily: 'Nunito_800ExtraBold' }} className="text-xl text-black bg-gray-100 px-5 py-3">
                  Inquiry
                </Text>

                <Text style={{ fontFamily: 'Nunito_400Regular' }} className="py-3 px-5">
                  Please select the app you want to chat with us.
                </Text>

                <View className="flex-row justify-between mt-5 px-5 gap-2">
                  <TouchableOpacity
                    style={{ display: appCountry?.code == 'vn' ? '' : 'none' }}
                    accessibilityLabel="Select Zalo"
                    className={`flex-1 bg-white rounded-xl ${selectedApp === 'zalo' ? 'border-black border-2' : ''
                      }`}
                    onPress={() => setSelectedApp('zalo')}
                  >
                    <View className="p-6 h-[100px] bg-gray-100 flex justify-center items-center rounded-xl">
                      <Image
                        resizeMode="contain"
                        className="h-full"
                        source={require('../../assets/icons/ic_zalo.png')}
                      />
                      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1">Zalo</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ display: appCountry?.code == 'kh' ? '' : 'none' }}
                    accessibilityLabel="Select Telegram"
                    className={`flex-1 bg-white rounded-xl ${selectedApp === 'telegram' ? 'border-black border-2' : ''
                      }`}
                    onPress={() => setSelectedApp('telegram')}
                  >
                    <View className="p-6 h-[100px] bg-gray-100 flex justify-center items-center rounded-xl">
                      <Image
                        resizeMode="contain"
                        className="h-full"
                        source={require('../../assets/icons/ic_telegram.png')}
                      />
                      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1">Telegram</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityLabel="Select Facebook"
                    className={`flex-1 bg-white rounded-xl ${selectedApp === 'facebook' ? 'border-black border-2' : ''
                      }`}
                    onPress={() => setSelectedApp('facebook')}
                  >
                    <View className="p-6 h-[100px] bg-gray-100 flex justify-center items-center rounded-xl">
                      <Image
                        resizeMode="contain"
                        className="h-full"
                        source={require('../../assets/icons/ic_facebook_colored.png')}
                      />
                      <Text style={{ fontFamily: 'Nunito_700Bold' }} className="mt-1">Facebook</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className={`rounded-lg mx-5 mt-10 mb-5 px-5 py-3 ${selectedApp === null ? 'bg-gray-300' : 'bg-black'
                    }`}
                  onPress={handleSelect}
                  disabled={selectedApp === null}
                  accessibilityLabel="Confirm Selection"
                >
                  <Text
                    style={{ fontFamily: 'Nunito_600SemiBold' }}
                    className={`text-center ${selectedApp === null ? 'text-black' : 'text-white'
                      }`}
                  >
                    Select
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default InquiryModal;

const styles = StyleSheet.create({});