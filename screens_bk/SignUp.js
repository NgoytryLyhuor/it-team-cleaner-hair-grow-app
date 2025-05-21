import React, { useState, useContext, useEffect, useRef } from 'react';
import http from '../services/http';
import {
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import { StorageContext } from '../contexts/StorageContext';

export default function SignUp() {
  // Original state variables
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('other');
  const [contactNumber, setContactNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { getUserDetail } = useContext(StorageContext);
  const navigation = useNavigation();

  // Animation values
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const backButtonAnimation = useRef(new Animated.Value(0)).current;
  const headingAnimation = useRef(new Animated.Value(0)).current;
  const subheadingAnimation = useRef(new Animated.Value(0)).current;
  const formFieldAnimations = {
    firstName: useRef(new Animated.Value(0)).current,
    lastName: useRef(new Animated.Value(0)).current,
    email: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
    gender: useRef(new Animated.Value(0)).current,
    contactNumber: useRef(new Animated.Value(0)).current,
  };
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;
  const signInLinkAnimation = useRef(new Animated.Value(0)).current;
  const termsAnimation = useRef(new Animated.Value(0)).current;

  // Run animations when component mounts
  useEffect(() => {
    const animationSequence = [
      // Header animations (0-500ms)
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backButtonAnimation, {
        toValue: 1,
        duration: 300,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Welcome text animations (400-700ms)
      Animated.timing(headingAnimation, {
        toValue: 1,
        duration: 400,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(subheadingAnimation, {
        toValue: 1,
        duration: 400,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Form fields animations (600-1500ms)
      Animated.timing(formFieldAnimations.firstName, {
        toValue: 1,
        duration: 400,
        delay: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFieldAnimations.lastName, {
        toValue: 1,
        duration: 400,
        delay: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFieldAnimations.email, {
        toValue: 1,
        duration: 400,
        delay: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFieldAnimations.password, {
        toValue: 1,
        duration: 400,
        delay: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFieldAnimations.gender, {
        toValue: 1,
        duration: 400,
        delay: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formFieldAnimations.contactNumber, {
        toValue: 1,
        duration: 400,
        delay: 1100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Progress indicator animation (1400-1600ms)
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 300,
        delay: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Button and links animations (1500-1800ms)
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 400,
        delay: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(signInLinkAnimation, {
        toValue: 1,
        duration: 400,
        delay: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(termsAnimation, {
        toValue: 1,
        duration: 400,
        delay: 1700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ];

    // Start all animations in parallel
    Animated.parallel(animationSequence).start();
  }, []);

  // Animation styles
  const logoStyle = {
    opacity: logoAnimation,
    transform: [
      { scale: logoAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }
    ]
  };

  const backButtonStyle = {
    opacity: backButtonAnimation,
    transform: [
      { translateX: backButtonAnimation.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }
    ]
  };

  const headingStyle = {
    opacity: headingAnimation,
    transform: [
      { translateY: headingAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
    ]
  };

  const subheadingStyle = {
    opacity: subheadingAnimation,
    transform: [
      { translateY: subheadingAnimation.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }
    ]
  };

  const createFormFieldStyle = (animation) => ({
    opacity: animation,
    transform: [
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
    ]
  });

  const progressStyle = {
    opacity: progressAnimation,
    transform: [
      { scale: progressAnimation.interpolate({ 
          inputRange: [0, 0.5, 1], 
          outputRange: [0.95, 1.05, 1] 
        }) 
      }
    ]
  };

  const buttonStyle = {
    opacity: buttonAnimation,
    transform: [
      { scale: buttonAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }
    ]
  };

  const signInLinkStyle = {
    opacity: signInLinkAnimation
  };

  const termsStyle = {
    opacity: termsAnimation
  };

  // Original functions
  const validateFields = () => {
    let newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!gender) newErrors.gender = 'Please select gender';

    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{8,}$/.test(contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateFields()) return;

    setLoading(true);

    const postData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      gender,
      mobile: contactNumber,
    };

    try {
      const res = await http.post('/register', postData);
      const data = res.data;

      if (data.status) {
        await AsyncStorage.setItem('token', data.data.token);
        await getUserDetail(data.data);
        navigation.navigate('HomeScreen');
      }
    } catch (error) {
      if (error.response) {
        const data = error.response.data;
        Toast.error(data.message);
      } else {
        Toast.error('Something went wrong. Please try again.');
        console.error('Network or unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    // Small delay to ensure keyboard is fully dismissed
    setTimeout(() => {
      handleSignUp();
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 , paddingBottom:10}}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView className="pb-5">
          <StatusBar backgroundColor="#000" barStyle="light-content" />
          <View className="h-[120px] bg-black flex-row justify-center items-center px-5">
            <Animated.View style={backButtonStyle} className="absolute left-5 top-[35%]">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back-ios" size={22} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={logoStyle} className="items-center space-y-3 mb-5">
              <Image className="w-40 h-20" source={require('../assets/logo_long.png')} resizeMode="contain" />
            </Animated.View>
          </View>
        </SafeAreaView>

        <View className="px-6 pt-6 rounded-t-3xl bg-white -mt-10">
          <Animated.Text style={headingStyle} className="text-2xl mb-1 text-center font-medium">Welcome To Grow Tokyo!</Animated.Text>
          <Animated.Text style={subheadingStyle} className="text-gray-500 mb-6 text-center text-sm">
            Create Your Account For Better Experience
          </Animated.Text>

          {/* First Name */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.firstName)}>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={text => {
                setFirstName(text);
                setErrors(prev => ({ ...prev, firstName: '' }));
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 text-black"
              placeholderTextColor="#aaa"
              style={{ marginBottom: errors.firstName ? 4 : 16 }}
              editable={!loading}
            />
            {errors.firstName && <Text className="text-red-500 text-sm mb-4">{errors.firstName}</Text>}
          </Animated.View>

          {/* Last Name */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.lastName)}>
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={text => {
                setLastName(text);
                setErrors(prev => ({ ...prev, lastName: '' }));
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 text-black"
              placeholderTextColor="#aaa"
              style={{ marginBottom: errors.lastName ? 4 : 16 }}
              editable={!loading}
            />
            {errors.lastName && <Text className="text-red-500 text-sm mb-4">{errors.lastName}</Text>}
          </Animated.View>

          {/* Email */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.email)}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setErrors(prev => ({ ...prev, email: '' }));
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 text-black"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ marginBottom: errors.email ? 4 : 16 }}
              editable={!loading}
            />
            {errors.email && <Text className="text-red-500 text-sm mb-4">{errors.email}</Text>}
          </Animated.View>

          {/* Password */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.password)}>
            <View className="relative" style={{ marginBottom: errors.password ? 4 : 16 }}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                className="border border-gray-300 rounded-xl px-4 py-3 pr-10 text-black"
                placeholderTextColor="#aaa"
                secureTextEntry={!passwordVisible}
                editable={!loading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setPasswordVisible(!passwordVisible)}
                disabled={loading}
              >
                {passwordVisible ? (
                  <Feather name="eye" size={20} color="gray" />
                ) : (
                  <Feather name="eye-off" size={20} color="gray" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-red-500 text-sm mb-4">{errors.password}</Text>}
          </Animated.View>

          {/* Gender Radio Buttons */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.gender)}>
            <Text className="text-black mb-2">Gender</Text>
            <View className="flex-row justify-between mb-4">
              {['male', 'female', 'other'].map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setGender(option);
                    setErrors(prev => ({ ...prev, gender: '' }));
                  }}
                  className="flex-row items-center p-3"
                  disabled={loading}
                >
                  <View className={`w-5 h-5 rounded-full border ${gender === option ? 'border-black' : 'border-gray-400'} items-center justify-center mr-2`}>
                    {gender === option && <View className="w-3 h-3 rounded-full bg-black" />}
                  </View>
                  <Text className={`${gender === option ? 'text-black' : 'text-gray-600'} capitalize`}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && <Text className="text-red-500 text-sm mb-4">{errors.gender}</Text>}
          </Animated.View>

          {/* Contact Number */}
          <Animated.View style={createFormFieldStyle(formFieldAnimations.contactNumber)}>
            <TextInput
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={text => {
                setContactNumber(text);
                setErrors(prev => ({ ...prev, contactNumber: '' }));
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 text-black"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              style={{ marginBottom: errors.contactNumber ? 4 : 16 }}
              editable={!loading}
            />
            {errors.contactNumber && <Text className="text-red-500 text-sm mb-4">{errors.contactNumber}</Text>}
          </Animated.View>

          <Animated.Text style={progressStyle} className="font-bold text-black text-right mb-4">1/15</Animated.Text>

          {/* Sign Up Button */}
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`bg-black py-3 rounded-xl shadow-md mb-4 mt-4 flex-row justify-center items-center ${loading ? 'opacity-90' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" className="mr-2" />
                  <Text className="text-white text-center font-bold text-lg">Processing...</Text>
                </>
              ) : (
                <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View style={signInLinkStyle} className="flex-row justify-center mt-2 mb-4">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text className={`font-bold underline ${loading ? 'text-gray-400' : 'text-black'}`}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Terms and Conditions */}
          <Animated.View style={termsStyle} className="flex-row justify-center mt-2">
            <Text className="text-gray-500">By signing up you agree to our </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text className={`font-bold ${loading ? 'text-gray-400' : 'text-black'}`}>Terms & Conditions</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
