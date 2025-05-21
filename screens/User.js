import React, { useState, useContext, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    ScrollView,
    Modal,
    Animated,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import http from '../services/http';
import { StorageContext } from '../contexts/StorageContext';
import BottomNavigation from './Components/BottomNavigation';
import Constants from 'expo-constants';
import { useWindowDimensions } from 'react-native';
import CustomText from './Components/CustomText'; // Make sure to import CustomText

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const version = Constants.expoConfig?.version || 'N/A';

export default function User({ navigation }) {
    const { userDetail, logout } = useContext(StorageContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState(null);
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();

    // Dynamic header calculations
    const isSmallDevice = height < 700;
    const avatarSize = isSmallDevice ? 80 : 100;
    const headerPadding = isSmallDevice ? 15 : 25;
    const headerTitleSize = isSmallDevice ? 16 : 18;
    const headerRadius = Math.min(17, Math.round(width * 0.045));

    const showLogoutModal = () => {
        setModalVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const hideLogoutModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
        });
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            setLogoutError(null);

            const response = await http.get('/logout_2');
            if (response?.data?.status) {
                logout(); // Clear user session/token
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen' }],
                }); // More secure than navigate
            } else {
                setLogoutError('Logout failed. Please try again.');
            }

        } catch (error) {
            if (error.response) {
                console.error('Logout error (response):', error.response.data);
            } else if (error.request) {
                console.error('Logout error (request):', error.request);
            } else {
                console.error('Logout error (message):', error.message);
            }
            setLogoutError('Failed to logout. Please try again.');
        } finally {
            setIsLoggingOut(false);
            hideLogoutModal();
        }
    };

    const handleSignIn = () => {
        navigation.navigate('Login');
    };

    function SettingItem({ icon, title, subtitle, action, isLogout = false, isSignIn = false }) {
        return (
            <TouchableOpacity
                onPress={() => action === 'logout' ? showLogoutModal() : action === 'signin' ? handleSignIn() : navigation.navigate(action)}
                style={[styles.optionItem, (isLogout || isSignIn) && { marginTop: 1 }]}
            >
                <View style={styles.optionIconContainer}>
                    <Ionicons
                        name={icon}
                        size={22}
                    />
                </View>
                <View style={styles.optionTextContainer}>
                    <CustomText style={styles.optionTitle}>
                        {title}
                    </CustomText>
                    <CustomText style={styles.optionDescription}>
                        {subtitle}
                    </CustomText>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Dynamic Profile Header Section */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: Platform.OS === 'ios' ? insets.top : Math.max(10, insets.top),
                        paddingBottom: headerPadding,
                        borderBottomLeftRadius: headerRadius,
                        borderBottomRightRadius: headerRadius,
                    }
                ]}
            >
                <CustomText style={[styles.headerTitle, { fontSize: headerTitleSize }]}>Profile</CustomText>

                {userDetail && (
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: userDetail.profile_image }}
                                style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.editIconContainer,
                                    {
                                        width: isSmallDevice ? 24 : 28,
                                        height: isSmallDevice ? 24 : 28,
                                        borderRadius: isSmallDevice ? 12 : 14
                                    }
                                ]}
                                onPress={() => navigation.navigate('EditProfileScreen')}
                            >
                                <Ionicons name="pencil" size={isSmallDevice ? 12 : 14} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <CustomText style={[styles.userName, { fontSize: isSmallDevice ? 16 : 18 }]}>
                            {userDetail?.first_name} {userDetail?.last_name}
                        </CustomText>
                        <CustomText style={styles.userEmail}>{userDetail?.email}</CustomText>
                    </View>
                )}
            </View>

            {/* Profile Options */}
            <ScrollView style={styles.content}>
                <SettingItem
                    action="Setting"
                    icon="settings-outline"
                    title="Setting"
                    subtitle="Change Password, Language, Country, Delete Account"
                />
                <SettingItem
                    action="SocialMedie"
                    icon="information-circle-outline"
                    title="Social Media"
                    subtitle="Facebook, Instagram"
                />
                <SettingItem
                    action="AboutApp"
                    icon="help-circle-outline"
                    title="About App"
                    subtitle="About, Privacy Policy, T&C"
                />

                {userDetail ? (
                    <SettingItem
                        action="logout"
                        icon="log-out-outline"
                        title="Logout"
                        subtitle="Logout your account"
                        isLogout={true}
                    />
                ) : (
                    <SettingItem
                        action="signin"
                        icon="log-in-outline"
                        title="Sign In"
                        subtitle="Sign in to your account"
                        isSignIn={true}
                    />
                )}

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <CustomText style={styles.versionText}>v{version}</CustomText>
                </View>
            </ScrollView>

            {/* Logout Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideLogoutModal}
                animationType="none"
            >
                <Animated.View
                    style={[
                        styles.modalOverlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.modalBackground}
                        activeOpacity={1}
                        onPress={hideLogoutModal}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.modalContainer}>
                                <CustomText style={styles.modalTitle}>Oh No, You Are Leaving!</CustomText>
                                <CustomText style={styles.modalText}>Do you want to logout?</CustomText>

                                {logoutError && (
                                    <CustomText style={styles.errorText}>{logoutError}</CustomText>
                                )}

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.noButton}
                                        onPress={hideLogoutModal}
                                        disabled={isLoggingOut}
                                    >
                                        <CustomText style={styles.noButtonText}>No</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.yesButton}
                                        onPress={handleLogout}
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <CustomText style={styles.yesButtonText}>Yes</CustomText>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>

            <BottomNavigation page='User' />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingHorizontal: 20,
        backgroundColor: '#000',
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        marginBottom: 20,
        fontFamily: 'Nunito_800ExtraBold',
        textAlign: 'center',
    },
    profileContainer: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    loginButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Nunito_600SemiBold',
    },
    avatar: {
        backgroundColor: '#E0E0E0',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 5,
        right: 0,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    userName: {
        color: '#FFFFFF',
        marginBottom: 5,
        marginTop: 13,
        fontFamily: 'Nunito_700Bold',
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 13,
        color: '#AAAAAA',
        fontFamily: 'Nunito_400Regular',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    optionItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    optionIconContainer: {
        marginRight: 15,
        width: 24,
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 14,
        color: '#333333',
        marginBottom: 3,
        fontFamily: 'Nunito_600SemiBold',
    },
    optionDescription: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Nunito_400Regular',
    },
    versionContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    versionText: {
        fontSize: 14,
        color: '#888888',
        fontFamily: 'Nunito_400Regular',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: Dimensions.get('window').width * 0.8,
        marginTop: -45,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Nunito_700Bold',
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: 'Nunito_400Regular',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Nunito_500Medium',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 5,
    },
    noButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    yesButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    noButtonText: {
        color: '#333',
        fontSize: 15,
        fontFamily: 'Nunito_600SemiBold',
    },
    yesButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'Nunito_600SemiBold',
    },
});