import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
    Dimensions,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LanguageScreen = ({ navigation }) => {

    const handleLanguage = () => {
        // Navigate to Language screen
        // navigation.navigate('LanguageScreen');
    };

    const handleCountry = () => {
        // Navigate to Country screen
        // navigation.navigate('CountryScreen');
    };

    const handleChangePassword = () => {
        // Navigate to Change Password screen
        // navigation.navigate('ChangePasswordScreen');
    };

    const handleDeleteAccount = () => {
        // Navigate to Delete Account screen
        // navigation.navigate('DeleteAccountScreen');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 10 }]}>
                <TouchableOpacity
                    onPress={() => {
                        // Alternative approach that's more reliable
                        navigation.pop();
                    }}
                    style={[styles.backButton, { zIndex: 10 }]} // slight zIndex increase
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="chevron-back"
                        size={25}
                        color="#fff"
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Language</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.settingsContainer}>
                    <TouchableOpacity
                        style={styles.settingCard}
                        activeOpacity={0.8}
                        onPress={handleLanguage}
                    >
                        <View style={styles.settingInfo}>
                            <Image 
                                source={require('../assets/flags/ic_us.png')} 
                                style={styles.settingIcon} 
                            />
                            <Text style={styles.settingName}>English</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingCard}
                        activeOpacity={0.8}
                        onPress={handleCountry}
                    >
                        <View style={styles.settingInfo}>
                            <Image 
                                source={require('../assets/flags/ic_km.png')} 
                                style={styles.settingIcon} 
                            />
                            <Text style={styles.settingName}>Khmer</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingCard}
                        activeOpacity={0.8}
                        onPress={handleChangePassword}
                    >
                        <View style={styles.settingInfo}>
                            <Image 
                                source={require('../assets/flags/ic_vi.png')} 
                                style={styles.settingIcon} 
                            />
                            <Text style={styles.settingName}>Vietnamese</Text>
                        </View>
                    </TouchableOpacity>
                    
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 20,
        height: 95,
        backgroundColor: '#000',
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        zIndex: 1
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginTop: 27,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginTop: 20,
        marginLeft: -30,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 15,
        marginTop: -15,
    },
    settingsContainer: {
        marginTop: 10,
    },
    settingCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingName: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        fontWeight: 'bold',
    },
    settingIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});

export default LanguageScreen;