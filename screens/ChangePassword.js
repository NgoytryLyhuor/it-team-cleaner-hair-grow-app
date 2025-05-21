import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import http from '../services/http';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './Components/CustomText';
import { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  showPassword,
  toggleShowPassword,
  error,
  editable = true,
  onPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start();
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const labelStyle = {
    position: 'absolute',
    left: 15,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -9],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [13, 10],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#888', isFocused ? '#888' : '#888'],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 5],
    }),
    zIndex: 1,
    fontWeight: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['400', '500'],
    }),
  };

  return (
    <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TouchableWithoutFeedback onPress={onPress}>
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...props}
        />
      </TouchableWithoutFeedback>
      {toggleShowPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPassword}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ChangePassword = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    Keyboard.dismiss(); // Dismiss keyboard on button press
    const newErrors = {};
    if (!oldPassword) newErrors.oldPassword = 'Old password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword === oldPassword) {
      newErrors.newPassword = 'New password must be different from previous ones';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Confirm Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await http.post('change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (response.data.status) {
        await AsyncStorage.setItem('token', response.data.data.api_token);
        Toast.success('Password changed successfully!');
        navigation.goBack();
      } else {
        Toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        if (serverErrors.old_password) {
          Toast.error(serverErrors.old_password[0]);
        } else {
          Toast.error('Failed to change password. Please try again.');
        }
      } else {
        Toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={25} color="#fff" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Change Password</CustomText>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.inputContainer}>
          <FloatingLabelInput
            label="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            showPassword={showOldPassword}
            toggleShowPassword={() => setShowOldPassword(!showOldPassword)}
            error={errors.oldPassword}
          />
          {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}

          <FloatingLabelInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            showPassword={showNewPassword}
            toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
          />
          {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

          <FloatingLabelInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            showPassword={showConfirmPassword}
            toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleChangePassword}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Processing...</Text>
              </>
            ) : (
              <Text style={styles.updateButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 15,
    backgroundColor: '#000',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center', // Add this to ensure icon is centered
    zIndex: 10, // Ensure it's above other elements
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C7C7C7',
    height: 50,
    paddingTop: 3,
  },
  inputWrapperError: {
    borderColor: '#FF4A4A',
  },
  disabledInput: {
    color: '#888',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 13,
    paddingTop: 5,
    fontWeight: 'bold',
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: '#FF4A4A',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
  },
  updateButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePassword;