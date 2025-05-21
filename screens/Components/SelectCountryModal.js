import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import React, { useState , useContext} from 'react';
import { countryList } from '../../constants/constants'; // adjust path if needed
import { GlobalDataContext } from '../../contexts/GlobalDataContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get("window");

const SelectCountryModal = ({ modalVisible, closeModal }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { setAppCountry } = useContext(GlobalDataContext);

  const handleSelect = async () => {
    if (selectedCountry) {
      try {
        // Save to storage
        await AsyncStorage.setItem('country', JSON.stringify(selectedCountry));
        setAppCountry(selectedCountry);
        closeModal();
      } catch (error) {
        console.error('Error setting country:', error);
      }
      // console.log('Selected country:', selectedCountry);
    }
  };

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        // onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback>
          <View className="flex-1 justify-center items-center bg-black/40 w-full">
            <TouchableWithoutFeedback>
              <View
                className="bg-white rounded-2xl overflow-hidden"
                style={{ width: width * 0.8 }}
              >
                <Text className="text-xl text-black font-extrabold bg-gray-100 px-5 py-3">
                  Select Country
                </Text>

                <View className="flex-row justify-between mt-5 px-5 gap-2">
                  {countryList.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      className={`flex-1 bg-white rounded-lg ${selectedCountry?.code === country.code
                          ? 'border-blue-500 border'
                          : 'border-transparent'
                        }`}
                      onPress={() => setSelectedCountry(country)}
                    >
                      <View className="p-5 h-[100px] bg-gray-200 flex justify-center items-center rounded-xl">
                        <Image
                          resizeMode="contain"
                          className="h-full"
                          source={country.icon}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  className={`rounded-lg mx-5 mt-5 mb-5 px-5 py-2 ${selectedCountry === null ? 'bg-gray-300' : 'bg-black'
                    }`}
                  onPress={handleSelect}
                >
                  <Text
                    className={`text-center font-semibold ${selectedCountry === null ? 'text-black' : 'text-white'
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

export default SelectCountryModal;

const styles = StyleSheet.create({});
