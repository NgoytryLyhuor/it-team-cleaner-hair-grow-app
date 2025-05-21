import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageContext } from '../contexts/StorageContext';
import http from '../services/http';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Toast } from 'toastify-react-native';

const { width } = Dimensions.get('window');

const PlaceholderImage = ({ width, height, text = 'Image', style = {} }) => {
  return (
    <View style={[{
      width,
      height,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4
    }, style]}>
      <Text style={{ color: '#666', fontSize: 12 }}>{text}</Text>
    </View>
  );
};

export default function Login({ route }) {
  const passwordInputRef = useRef(null);
  const { action = '' } = route.params || {};
  const navigation = useNavigation();
  const { getUserDetail } = useContext(StorageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(true);
  const [googleIconLoaded, setGoogleIconLoaded] = useState(true);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleLogin = async () => {
    let newErrors = {};

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      try {
        const res = await http.post('login', { email: email, password: password });

        if (res.data.status) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.setItem('token', res.data.data.api_token);
          await getUserDetail(res.data.data);
          if (action === 'dateTime') {
            navigation.goBack();
          } else {
            navigation.navigate('HomeScreen');
          }
        }
        else {
          Toast.error(res.data.message)
        }
      } catch (error) {
        Toast.error('Something went wrong! Please try again.')
        // console.error(error);
        // setErrors({ general: 'Login failed. Please check your credentials.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordModalVisible(true);
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModalVisible(false);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const emailPlaceholder = 'Email';
  const passwordPlaceholder = 'Password';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Black Header with Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          {logoLoaded ? (
            <Image
              source={require('../assets/logo_long.png')}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setLogoLoaded(false)}
            />
          ) : (
            <PlaceholderImage
              width={width * 0.6}
              height={65}
              text="Logo"
              style={styles.logo}
            />
          )}
        </View>
      </View>

      {/* Main Content - White Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Please login to begin</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={emailPlaceholder}
                placeholderTextColor="#aaaaaa"
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current.focus()}
                blurOnSubmit={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={[
                styles.passwordContainer,
                errors.password && styles.inputError
              ]}>
                <TextInput
                  ref={passwordInputRef}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  placeholder={passwordPlaceholder}
                  placeholderTextColor="#aaaaaa"
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={togglePasswordVisibility}
                  disabled={loading}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off" : "eye"}
                    size={24}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotContainer}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={toggleRememberMe}
                disabled={loading}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxChecked : styles.checkboxUnchecked
                ]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* General Error Message */}
            {errors.general && (
              <Text style={[styles.errorText, styles.generalError]}>{errors.general}</Text>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text className="text-white text-center font-bold text-lg ml-2">Processing...</Text>
                </>
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleSignInButton}
              disabled={loading}
              activeOpacity={0.8}
            >
              {googleIconLoaded ? (
                <Image
                  source={require('../assets/icons/ic_login_google.png')}
                  style={styles.googleIcon}
                  onError={() => setGoogleIconLoaded(false)}
                />
              ) : (
                <View style={styles.googleIconPlaceholder}>
                  <Text style={styles.googleIconPlaceholderText}>G</Text>
                </View>
              )}
              <Text style={styles.googleSignInText}>Sign In With Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.notMemberText}>Not a member?</Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpText}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotPasswordModalVisible}
        onClose={closeForgotPasswordModal}
        email={email}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: '#000',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 30,
  },
  logo: {
    height: 65,
    width: '80%',
  },
  keyboardAvoidingView: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
    marginTop: -10,
    fontWeight: '700',
  },
  subtitleText: {
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 13,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 12,
    letterSpacing: 1,
    backgroundColor: '#fff',
    color: '#333',
    fontWeight: '600',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
  generalError: {
    textAlign: 'center',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 12,
    letterSpacing: 1,
    color: '#333',
    fontWeight: '600',
  },
  visibilityIcon: {
    padding: 10,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 15
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  rememberMeText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '600',
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleSignInButton: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleIconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 10,
  },
  googleIconPlaceholderText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '700',
  },
  googleSignInText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notMemberText: {
    fontSize: 14,
    color: '#666',
  },
  signUpText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
});