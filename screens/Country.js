import React, { useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { countryList } from '../constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalDataContext } from '../contexts/GlobalDataContext';

const { height } = Dimensions.get('window');

export default function Country({ navigation }) {
  const { appCountry, setAppCountry } = useContext(GlobalDataContext);

  const setCountry = async (country) => {
    try {
      await AsyncStorage.setItem('country', JSON.stringify(country));
      setAppCountry(country);
      navigation.goBack();
    } catch (error) {
      console.error('Error setting country:', error);
    }
  };

  function CountryItem({ icon, title, country }) {
    return (
      <TouchableOpacity
        style={styles.countryItem}
        onPress={() => setCountry(country)}
      >
        <View style={styles.countryItemContent}>
          <Image style={styles.countryIcon} source={icon} resizeMode="contain" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
            <Text style={styles.countryItemText}>{title}</Text>
            <MaterialCommunityIcons
              style={{ display: appCountry.code === country.code ? 'flex' : 'none' }}
              name="check"
              size={22}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView style={{ paddingBottom: 20 }}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <View style={styles.header}>
            <Text
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-ios" size={22} color="#fff" />
            </Text>
            <Text style={styles.headerTitle}>Country</Text>
          </View>
          <View style={styles.content}>
            {countryList.map((country) => (
              <CountryItem
                key={country.name}
                icon={country.icon}
                title={country.name}
                country={country}
              />
            ))}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: height * 0.15,
    backgroundColor: '#000',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  countryItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  countryIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});