import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Image,
  TouchableWithoutFeedback,
  RefreshControl,
  Dimensions
} from 'react-native';
import http from '../services/http';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Accordion from 'react-native-collapsible/Accordion';
import StepHeader from './Components/StepHeader';
import * as Animatable from 'react-native-animatable';
import CheckBox from 'react-native-check-box';
import { useFocusEffect } from '@react-navigation/native';
import Loading from './Components/Loading';
import { Toast } from 'toastify-react-native';
import BookingStepHeader from './Components/BookingStepHeader';

const { height } = Dimensions.get("window");

export default function Service({ navigation, route }) {
  const { branch, staff } = route.params;
  // console.log(branch,staff)
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [employeeServiceList, setEmployeeServiceList] = useState([]);
  const [activeSections, setActiveSections] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});

  const animRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (animRef.current) {
        animRef.current.fadeInUp(500);
      }
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchData();
    }, 1000);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await http.get(`/employee-service-list?branch_id=${branch?.id}`);
      if (response.data.status) {
        setEmployeeServiceList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load branches', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderHeader = (section, index, isActive) => {
    return (
      <Animatable.View
        duration={300}
        delay={index * 50}
        animation={{
          from: {
            opacity: 0,
            translateY: 20,
            backgroundColor: '#fff', // Initial background
            marginBottom: 8 // Initial margin
          },
          to: {
            opacity: 1,
            translateY: 0,
            backgroundColor: '#fff', // Animated background
            marginBottom: isActive ? 0 : 8 // Animated margin
          }
        }}
        useNativeDriver={false} // Needed for background color animation
        style={{
          paddingHorizontal: 12,
          paddingVertical: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        <Text className="flex-1 text-gray" style={{ fontWeight: '800', fontSize: 14 }}>
          {section?.category.name}
        </Text>

        <Animatable.View
          duration={300}
          easing="ease-out"
          animation={{
            from: { rotate: '0deg' },
            to: { rotate: isActive ? '180deg' : '0deg' },
          }}
          useNativeDriver
        >
          <Icon name="keyboard-arrow-down" size={24} color={isActive ? '#000' : '#555'} />
        </Animatable.View>
      </Animatable.View>
    );
  };

  const renderContent = (section, _, isActive) => (
    <View
      key={isActive ? 'active' : 'inactive'}
    >
      {section?.services.map((service, idx) => (
        <Pressable onPress={() => toggleSelection(service.id)} key={service.id}>
          <Animatable.View
            animation='zoomIn'
            delay={idx * 10} // delay each item progressively
            useNativeDriver
            className="flex-row items-center bg-white p-5 py-3 rounded-b-lg shadow-lg"
          >
            <Image style={{ width: 50, height: 50 }} source={{ uri: service.service_image }} className="mr-5 rounded-lg" />
            <View className="flex-1">
              <Text style={{ fontSize: 13 }} className="font-semibold">{service.name}</Text>
              <Text className="text-sm text-gray-600">{service.description}</Text>
            </View>
            <CheckBox
              style={{ marginLeft: 8 }}
              onClick={() => toggleSelection(service.id)}
              isChecked={selectedItems[service.id] || false}
            />
          </Animatable.View>
        </Pressable>
      ))}
    </View>
  );

  const nextScreen = () => {
    const selectedServices = [];

    employeeServiceList.forEach(category => {
      const matched = category.services.filter(service => selectedItems[service.id]);
      selectedServices.push(...matched);
    });

    if (selectedServices.length > 0) {
      const postData = {
        branch: branch,
        staff: staff,
        services: selectedServices,
      };
      navigation.navigate('DateTime', postData);
    } else {
      Toast.warn('Please select a service!');
    }

    // console.log(selectedServices);
  };

  return (
    <View className="flex-1 pb-[100px] bg-white/10">
      <SafeAreaView className="bg-black"></SafeAreaView>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <BookingStepHeader title={branch?.name ? branch.name.length > 25 ? `${branch.name.slice(0, 25)}...` : branch.name : ''} height={height * 0.14}/>

      <StepHeader type="service" />

      {
        loading ? (
          <Loading />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View className="py-4 mb-2">
              <Text className="font-bold text-lg text-center">{staff?.full_name}'s Services</Text>
            </View>
            <Animatable.View ref={animRef}>
              <Animatable.View
                animation="fadeInUp"
                duration={700}
              >
                <Accordion
                  className="rounded-lg"
                  sections={employeeServiceList}
                  activeSections={activeSections}
                  renderHeader={renderHeader}
                  renderContent={renderContent}
                  onChange={setActiveSections}
                  expandMultiple={true}
                  sectionContainerStyle={{ marginBottom: 10 }}
                  touchableComponent={TouchableWithoutFeedback}
                />
              </Animatable.View>
            </Animatable.View>
          </ScrollView>
        )
      }

      <View className="h-[100px] bg-black rounded-t-[20px] flex-row justify-between items-center px-5 absolute bottom-0 w-full">
        <Text className="text-white font-bold text-lg">{staff?.full_name}</Text>
        <Pressable
          className="bg-white text-black text-center font-black text-[15px] py-4 rounded-lg shadow-lg"
          onPress={nextScreen}
          style={{ paddingHorizontal: 30 }}
        >
          <Text className="text-center">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
