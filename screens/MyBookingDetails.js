import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
    ActivityIndicator,
    Dimensions,
    Animated,
    Easing // Import Easing for smoother animations,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import http from '../services/http';
import CustomText from './Components/CustomText';

const { height } = Dimensions.get('window');

const MyBookingDetails = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const bookingId = route.params;

    const [bookingDetails, setBookingDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Animation refs for each section
    const animValues = {
        myInfo: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        timeSlot: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        location: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        stylist: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        services: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        note: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
        cancelButton: {
            opacity: useRef(new Animated.Value(0)).current,
            translateY: useRef(new Animated.Value(20)).current,
        },
    };

    // Run staggered animations when booking details are loaded
    useEffect(() => {
        if (bookingDetails && !isLoading && !error) {
            const animations = Object.values(animValues).map(anim => (
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ));

            Animated.stagger(100, animations).start();
        }
    }, [bookingDetails, isLoading, error]);

    // Fetch booking details from API
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) {
                setError('Booking ID not Coorg provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await http.get(`/booking-detail?id=${bookingId}`);

                if (response.data && response.data.status) {
                    setBookingDetails(response.data.data);
                } else {
                    setError('Failed to load booking details');
                }
            } catch (err) {
                console.error('Error fetching booking details:', err);
                setError('Error loading booking details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    // Format date for display
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';

        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return `${formattedDate} at ${formattedTime}`;
    };

    // Get status color based on booking status
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#FF3B30';
            default:
                return '#888';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <CustomText style={styles.errorText}>{error}</CustomText>
                    <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={() => navigation.goBack()}
                    >
                        <CustomText style={styles.reloadButtonText}>Go Back</CustomText>
                    </TouchableOpacity>
                </View>
            ) : bookingDetails ? (
                <>
                    {/* Header - Not animated */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <CustomText style={styles.headerTitle}>
                            {bookingDetails ? `#${bookingDetails.id}` : 'Booking Details'}
                        </CustomText>
                    </View>
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* My Information Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.myInfo.opacity,
                                transform: [{ translateY: animValues.myInfo.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>My Information</CustomText>
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <CustomText style={styles.infoLabel}>Name</CustomText>
                                    <CustomText style={styles.infoValue}>{bookingDetails.user_name || 'N/A'}</CustomText>
                                </View>
                                <View style={styles.infoRow}>
                                    <CustomText style={styles.infoLabel}>Contact Number</CustomText>
                                    <CustomText style={styles.infoValue}>{bookingDetails.phone || 'N/A'}</CustomText>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Time Slot Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.timeSlot.opacity,
                                transform: [{ translateY: animValues.timeSlot.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>Time Slot</CustomText>
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <CustomText style={styles.infoLabel}>Date & Time</CustomText>
                                    <CustomText style={styles.infoValue}>
                                        {formatDateTime(bookingDetails.start_date_time)}
                                    </CustomText>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Location Information Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.location.opacity,
                                transform: [{ translateY: animValues.location.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>Location Information</CustomText>
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <CustomText style={styles.infoLabel}>Branch Name</CustomText>
                                    <CustomText style={styles.infoValue}>{bookingDetails.branch_name || 'N/A'}</CustomText>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Stylist Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.stylist.opacity,
                                transform: [{ translateY: animValues.stylist.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>Stylist</CustomText>
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <CustomText style={styles.infoLabel}>Stylist</CustomText>
                                    <CustomText style={styles.infoValue}>{bookingDetails.employee_name || 'Not Assigned'}</CustomText>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Services Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.services.opacity,
                                transform: [{ translateY: animValues.services.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>Services</CustomText>
                            <View style={styles.infoContainer}>
                                {bookingDetails.services && bookingDetails.services.length > 0 ? (
                                    bookingDetails.services.map((service, index) => (
                                        <View key={service.id || index} style={[
                                            styles.serviceRow,
                                            index > 0 && styles.serviceRowDivider
                                        ]}>
                                            <Image
                                                source={
                                                    service.service_image
                                                        ? { uri: service.service_image }
                                                        : require('../assets/icons/default_service.png')
                                                }
                                                style={styles.serviceImage}
                                                defaultSource={require('../assets/icons/default_service.png')}
                                            />
                                            <View style={styles.serviceInfo}>
                                                <CustomText style={styles.serviceTitle}>{service.service_name}</CustomText>
                                                <CustomText style={styles.serviceDetail}>
                                                    Duration: {service.duration_min} min
                                                </CustomText>
                                                {service.service_price > 0 && (
                                                    <CustomText style={styles.servicePrice}>
                                                        ${service.service_price}
                                                    </CustomText>
                                                )}
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <CustomText style={styles.noServicesText}>No services found</CustomText>
                                )}
                            </View>
                        </Animated.View>

                        {/* Note Section */}
                        <Animated.View
                            style={{
                                opacity: animValues.note.opacity,
                                transform: [{ translateY: animValues.note.translateY }],
                            }}
                        >
                            <CustomText style={styles.sectionTitle}>Service Note</CustomText>
                            <View style={styles.infoContainer}>
                                <CustomText style={styles.noteText}>{bookingDetails.note || 'N/A'}</CustomText>
                            </View>
                        </Animated.View>

                        {/* Cancel Button */}
                        {bookingDetails.status?.toLowerCase() === 'pending' && (
                            <Animated.View
                                イン style={{
                                    opacity: animValues.cancelButton.opacity,
                                    transform: [{ translateY: animValues.cancelButton.translateY }],
                                }}
                            >
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => navigation.navigate('Mybooking')}
                                >
                                    <CustomText style={styles.cancelButtonText}>Cancel Appointment</CustomText>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Space at bottom for better scrolling */}
                        <View style={styles.bottomSpace} />
                    </ScrollView>
                </>
            ) : (
                <View style={styles.errorContainer}>
                    <CustomText style={styles.errorText}>No booking data found</CustomText>
                </View>
            )
            }
        </View >
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
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#000',
        height: height * 0.12,
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        zIndex: 1
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 42
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontFamily: 'Nunito_800ExtraBold',
        marginTop: 25,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Nunito_400Regular',
    },
    reloadButton: {
        backgroundColor: '#000',
        paddingHorizontal: 45,
        paddingVertical: 12,
        borderRadius: 25,
    },
    reloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Nunito_500Medium',
        color: '#666',
        marginBottom: 10,
        marginTop: 10,
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Nunito_400Regular',
    },
    infoValue: {
        fontSize: 13,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
    },
    serviceRowDivider: {
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#ddd',
    },
    serviceInfo: {
        marginLeft: 12,
        flex: 1,
    },
    serviceTitle: {
        fontSize: 14,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
        marginBottom: 4,
    },
    serviceDetail: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Nunito_400Regular',
    },
    servicePrice: {
        fontSize: 13,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
        marginTop: 4,
    },
    noServicesText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Nunito_400Regular',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 10,
    },
    noteText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Nunito_400Regular',
        lineHeight: 20,
    },
    cancelButton: {
        backgroundColor: '#F0E6FF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    cancelButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Nunito_700Bold',
    },
    bottomSpace: {
        height: 80,
    },
});

export default MyBookingDetails;    