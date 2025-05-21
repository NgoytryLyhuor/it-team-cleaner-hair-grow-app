import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const SuccessfullyModal = ({ modalVisible, closeModal }) => {
  return (
    <View>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-black/30 w-full">
            <TouchableWithoutFeedback>
              <Animatable.View
                animation="zoomIn"
                duration={400}
                easing="ease-out"
                className="bg-white rounded-2xl overflow-hidden"
                style={{ width: width * 0.8 }}
              >
                <View className="flex-row justify-center mt-5 px-5 gap-2">
                  <Image
                    source={require('../../assets/icons/ic_booking_success.png')}
                    resizeMode="contain"
                    className="w-[120px] h-[120px]"
                  />
                </View>

                <Text className="px-5 text-center text-lg font-bold">
                  Receive Booking Request!!
                </Text>

                <Text className="py-3 px-5 text-center mb-10">
                  Booking saved successfully
                </Text>
              </Animatable.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default SuccessfullyModal;
