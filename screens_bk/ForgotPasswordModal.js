import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import http from '../services/http';

const ForgotPasswordModal = ({ visible, onClose, email: initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            setEmail(initialEmail);
            // Fade in animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Fade out and reset
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 50,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, initialEmail]);

    const handleCloseWithAnimation = () => {
        // Run fade out animation before closing
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Only close the modal after animation completes
            onClose();
        });
    };

    const handleResetPassword = async () => {
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            try {
                // Replace with your actual API call
                await http.post('forgot-password', { email });
                // Handle success (could show success message before closing)
                handleCloseWithAnimation();
            } catch (error) {
                console.error('Password reset error:', error);
                setErrors({ general: 'An error occurred. Please try again.' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleCloseWithAnimation}
        >
            <Animated.View
                style={[
                    styles.modalOverlay,
                    { opacity: fadeAnim }
                ]}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                            opacity: fadeAnim
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Forgot Password?</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseWithAnimation}
                            disabled={loading}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeading}>Enter your email address</Text>
                        <Text style={styles.modalSubheading}>
                            A reset password link will be sent to the above entered email address
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setErrors({});
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                            {errors.email ? (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            ) : null}
                            {errors.general ? (
                                <Text style={styles.errorText}>{errors.general}</Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            style={[styles.resetButton, loading && styles.disabledButton]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.resetButtonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    modalHeader: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 5,
    },
    modalContent: {
        padding: 20,
    },
    modalHeading: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    modalSubheading: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    resetButton: {
        backgroundColor: '#000',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default ForgotPasswordModal;