import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
    Dimensions,
    Animated,
    Easing,
    TextInput,
    Modal,
    Image,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    Text
} from 'react-native';
import http from '../services/http';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import defaultProfileImage from '../assets/walk_img_1.png';
import CustomText from './Components/CustomText';
import { StorageContext, } from '../contexts/StorageContext';
import { Toast } from 'toastify-react-native';
const { height } = Dimensions.get('window');

const countries = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AX', name: 'Åland Islands' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'KH', name: 'Cambodia' },
    // Add more countries as needed
];

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
            toValue: (isFocused || value) ? 1 : 0,
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
            outputRange: [0, 5]
        }),
        zIndex: 1,
        fontWeight: animatedIsFocused.interpolate({
            inputRange: [0, 1],
            outputRange: ['400', '500']
        }),
    };

    return (
        <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>
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
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={toggleShowPassword}
                >
                    <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={22}
                        color="#888"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const EditProfileScreen = ({ navigation }) => {
    const { userDetail, setUserDetail } = useContext(StorageContext);
    // console.log(userDetail)
    const [firstName, setFirstName] = useState(userDetail?.first_name);
    const [lastName, setLastName] = useState(userDetail?.last_name);
    const [gender, setGender] = useState(userDetail?.gender);
    const [email, setEmail] = useState(userDetail?.email);
    const [contactNumber, setContactNumber] = useState(userDetail?.mobile);
    const [nationality, setNationality] = useState(userDetail?.nationality);
    const [profileImage, setProfileImage] = useState(userDetail?.profile_image);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);
    const [showCountryPickerModal, setShowCountryPickerModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(countries);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const countrySlideAnim = useRef(new Animated.Value(0)).current;

    const [dateOfBirth, setDateOfBirth] = useState(() => {
        const rawDate = userDetail?.date_of_birth;
        if (!rawDate) return '';

        const date = new Date(rawDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    });

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    }, [searchQuery]);

    function formatDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const handleUpdate = async () => {
        setLoading(true);

        try {
            // Create form data for multipart/form-data request
            const formData = new FormData();

            // Add text fields
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('date_of_birth', formatDate(dateOfBirth));
            formData.append('gender', gender);
            formData.append('email', email);

            // Add profile image if it has been changed
            // Check if the profileImage is different from the original user profile image
            if (profileImage && profileImage !== userDetail?.profile_image) {
                // Check if profileImage is a local URI (new image selected)
                if (profileImage.startsWith('file://') || profileImage.startsWith('content://')) {
                    // Get file name from URI
                    const fileName = profileImage.split('/').pop();

                    // Determine file type
                    const fileType = fileName.endsWith('.png')
                        ? 'image/png'
                        : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
                            ? 'image/jpeg'
                            : 'image/jpg';

                    // Append the image to form data
                    formData.append('profile_image', {
                        uri: profileImage,
                        name: fileName,
                        type: fileType
                    });
                }
            }

            // Make the request with form data
            const res = await http.post('update-profile', formData);

            if (res.data.status) {
                setUserDetail(res.data.data);
                Toast.success('Profile updated successfully!');
            }
        } catch (error) {
            Toast.error('Something went wrong! Please try again.');
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        } finally {
            setLoading(false);
        }

        navigation.goBack();
    };

    const openImagePickerModal = () => {
        setShowImagePickerModal(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeImagePickerModal = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setShowImagePickerModal(false));
    };

    const openCountryPickerModal = () => {
        setShowCountryPickerModal(true);
        Animated.timing(countrySlideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeCountryPickerModal = () => {
        Animated.timing(countrySlideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setShowCountryPickerModal(false));
        setSearchQuery('');
    };

    const pickImage = async (source) => {
        let result;
        if (source === 'gallery') {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        } else if (source === 'camera') {
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        }

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
        closeImagePickerModal();
    };

    const handleDateChange = (event, selectedDate) => {
        console.log(selectedDate)
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
            setDateOfBirth(formattedDate);
        }
    };

    const selectCountry = (countryCode) => {
        const selectedCountry = countries.find(c => c.code === countryCode);
        if (selectedCountry) {
            setNationality(selectedCountry.code);
        }
        closeCountryPickerModal();
    };

    const modalTranslateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0],
    });

    const countryModalTranslateY = countrySlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [600, 0],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.pop()}
                    style={[styles.backButton, { zIndex: 10 }]}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="chevron-back"
                        size={25}
                        color="#fff"
                    />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Edit Profile</CustomText>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImageWrapper}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <Image source={defaultProfileImage} style={styles.profileImage} />
                            )}
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={openImagePickerModal}
                            >
                                <Ionicons name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <View style={styles.inputContainer}>
                    <FloatingLabelInput
                        label="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        error={errors.firstName}
                    />

                    <FloatingLabelInput
                        label="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        error={errors.lastName}
                    />

                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <FloatingLabelInput
                            label="Date of Birth"
                            value={dateOfBirth}
                            editable={false}
                            onPress={() => setShowDatePicker(true)}
                        />
                    </TouchableOpacity>

                    <View style={styles.genderContainer}>
                        <CustomText style={styles.genderLabel}>Gender</CustomText>
                        <View style={styles.radioRow}>
                            {['Male', 'Female', 'Other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.radioOption}
                                    onPress={() => setGender(option)}
                                >
                                    <View style={styles.radioCircle}>
                                        {gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() === option && <View style={styles.radioChecked} />}
                                    </View>
                                    <CustomText style={styles.radioLabel}>{option}</CustomText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <FloatingLabelInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        error={errors.email}
                    />

                    <FloatingLabelInput
                        label="Contact Number"
                        value={contactNumber}
                        onChangeText={setContactNumber}
                        keyboardType="phone-pad"
                        error={errors.contactNumber}
                    />

                    <TouchableOpacity onPress={openCountryPickerModal}>
                        <FloatingLabelInput
                            label="Nationality"
                            value={countries.find(c => c.code === nationality)?.name || ''}
                            editable={false}
                            onPress={openCountryPickerModal}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdate}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color="#fff" size="small" className="mr-2" />
                                <Text className="text-white text-center font-bold text-lg">Processing...</Text>
                            </>
                        ) : (
                            <CustomText style={styles.updateButtonText}>Update</CustomText>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {showDatePicker && (
                <DateTimePicker
                    value={
                        (() => {
                            const [day, month, year] = dateOfBirth.split('/');
                            return new Date(`${year}-${month}-${day}`);
                        })()
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />

            )}

            <Modal
                visible={showImagePickerModal}
                transparent={true}
                animationType="none"
                onRequestClose={closeImagePickerModal}
            >
                <TouchableWithoutFeedback onPress={closeImagePickerModal}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => pickImage('gallery')}
                    >
                        <View style={styles.modalOptionContent}>
                            <Ionicons name="image" size={20} color="#000" />
                            <CustomText style={styles.modalOptionText}>Gallery</CustomText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalOption}
                        onPress={() => pickImage('camera')}
                    >
                        <View style={styles.modalOptionContent}>
                            <Ionicons name="camera" size={20} color="#000" />
                            <CustomText style={styles.modalOptionText}>Camera</CustomText>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </Modal>

            <Modal
                visible={showCountryPickerModal}
                transparent={true}
                animationType="none"
                onRequestClose={closeCountryPickerModal}
            >
                <TouchableWithoutFeedback onPress={closeCountryPickerModal}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.countryModalContent, { transform: [{ translateY: countryModalTranslateY }] }]}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={true}
                        />
                    </View>

                    <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.countryItem}
                                onPress={() => selectCountry(item.code)}
                            >
                                <CustomText style={styles.countryName}>{item.name}</CustomText>
                                {nationality === item.code && (
                                    <Ionicons name="checkmark" size={20} color="#000" />
                                )}
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.countrySeparator} />}
                        style={styles.countryList}
                    />
                </Animated.View>
            </Modal>
        </View>
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
        paddingVertical: 15,
        paddingBottom: 20,
        height: height * 0.12,
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
        fontFamily: 'Nunito-ExtraBold',
    },
    content: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#C7C7C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        fontSize: 30,
        color: '#fff',
        fontFamily: 'Nunito-Bold',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
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
        borderColor: '#fff',
        height: 50,
        paddingTop: 3,
        borderColor: '#C7C7C7'
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
        fontFamily: 'Nunito-Bold',
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
        fontFamily: 'Nunito-Bold',
    },
    genderContainer: {
        marginBottom: 15,
    },
    genderLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
        fontFamily: 'Nunito-Bold',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
        justifyContent: 'space-around'
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#888',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    radioChecked: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
    },
    radioLabel: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Nunito-Bold',
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
        fontFamily: 'Nunito-ExtraBold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    modalOption: {
        paddingVertical: 10,
    },
    modalOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalOptionText: {
        color: '#000',
        fontFamily: 'Nunito-Bold',
        marginLeft: 10,
        marginTop: -3,
        fontSize: 16
    },
    countryModalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 10,
        maxHeight: '80%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        margin: 10,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    countryList: {
        flex: 1,
    },
    countryItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countryName: {
        fontSize: 16,
        color: '#000',
    },
    countrySeparator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
    },
});

export default EditProfileScreen;