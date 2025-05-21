import React, { useState, useContext, useEffect } from 'react';
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
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import { StorageContext } from '../contexts/StorageContext';

export default function SignUp() {
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
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
            >
                <SafeAreaView className="pb-5">
                    <StatusBar backgroundColor="#000" barStyle="light-content" />
                    <View className="h-[120px] bg-black flex-row justify-center items-center px-5">
                        <View className="absolute left-5 top-[35%]">
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon name="arrow-back-ios" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View className="items-center space-y-3 mb-5">
                            <Image className="w-40 h-20" source={require('../assets/logo_long.png')} resizeMode="contain" />
                        </View>
                    </View>
                </SafeAreaView>

                <View className="px-6 pt-6 rounded-t-3xl bg-white -mt-10">
                    <Text style={{ fontSize: 20, marginBottom: 4, textAlign: 'center', fontFamily: 'Nunito_600SemiBold' }}>
                        Welcome To Grow Tokyo!
                    </Text>
                    <Text style={{ color: '#6B7280', marginBottom: 24, textAlign: 'center', fontSize: 14, fontFamily: 'Nunito_400Regular' }}>
                        Create Your Account For Better Experience
                    </Text>

                    {/* First Name */}
                    <View>
                        <TextInput
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={text => {
                                setFirstName(text);
                                setErrors(prev => ({ ...prev, firstName: '' }));
                            }}
                            className="border border-gray-300 rounded-xl px-4 py-3 text-black"
                            placeholderTextColor="#aaa"
                            style={{
                                marginBottom: errors.firstName ? 4 : 16,
                                fontFamily: 'Nunito_400Regular'
                            }}
                            editable={!loading}
                        />
                        {errors.firstName && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.firstName}</Text>}
                    </View>

                    {/* Last Name */}
                    <View>
                        <TextInput
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={text => {
                                setLastName(text);
                                setErrors(prev => ({ ...prev, lastName: '' }));
                            }}
                            className="border border-gray-300 rounded-xl px-4 py-3 text-black"
                            placeholderTextColor="#aaa"
                            style={{
                                marginBottom: errors.lastName ? 4 : 16,
                                fontFamily: 'Nunito_400Regular'
                            }}
                            editable={!loading}
                        />
                        {errors.lastName && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.lastName}</Text>}
                    </View>

                    {/* Email */}
                    <View>
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
                            style={{
                                marginBottom: errors.email ? 4 : 16,
                                fontFamily: 'Nunito_400Regular'
                            }}
                            editable={!loading}
                        />
                        {errors.email && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.email}</Text>}
                    </View>

                    {/* Password */}
                    <View>
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
                                style={{ fontFamily: 'Nunito_400Regular' }}
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
                        {errors.password && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.password}</Text>}
                    </View>

                    {/* Gender Radio Buttons */}
                    <View>
                        <Text style={{ color: '#000', marginBottom: 8, fontFamily: 'Nunito_500Medium' }}>Gender</Text>
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
                                    <Text style={{
                                        color: gender === option ? '#000' : '#6B7280',
                                        textTransform: 'capitalize',
                                        fontFamily: 'Nunito_500Medium'
                                    }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.gender && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.gender}</Text>}
                    </View>

                    {/* Contact Number */}
                    <View>
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
                            style={{
                                marginBottom: errors.contactNumber ? 4 : 16,
                                fontFamily: 'Nunito_400Regular'
                            }}
                            editable={!loading}
                        />
                        {errors.contactNumber && <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, fontFamily: 'Nunito_400Regular' }}>{errors.contactNumber}</Text>}
                    </View>

                    <Text style={{ fontWeight: 'bold', color: '#000', textAlign: 'right', fontSize: 12, marginTop: -10 , marginBottom: 16, fontFamily: 'Nunito_800ExtraBold' }}>1/15</Text>

                    {/* Sign Up Button */}
                    <View>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className={`bg-black py-3 rounded-xl shadow-md mb-4 mt-4 flex-row justify-center items-center ${loading ? 'opacity-90' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <ActivityIndicator color="#fff" size="small" className="mr-2" />
                                    <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16, fontFamily: 'Nunito_700Bold' }}>Processing...</Text>
                                </>
                            ) : (
                                <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16, fontFamily: 'Nunito_700Bold' }}>Sign Up</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Link */}
                    <View className="flex-row justify-center mt-2 mb-4">
                        <Text style={{ color: '#6B7280', fontFamily: 'Nunito_400Regular' }}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                            <Text style={{
                                fontWeight: 'bold',
                                textDecorationLine: 'underline',
                                color: loading ? '#9CA3AF' : '#000',
                                fontFamily: 'Nunito_700Bold'
                            }}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms and Conditions */}
                    <View className="flex-row justify-center mt-2">
                        <Text style={{ color: '#6B7280', fontFamily: 'Nunito_400Regular' }}>By signing up you agree to our </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
                            <Text style={{
                                fontWeight: 'bold',
                                color: loading ? '#9CA3AF' : '#000',
                                fontFamily: 'Nunito_700Bold'
                            }}>Terms & Conditions</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}