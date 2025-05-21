import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    Animated,
    Platform,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StorageContext } from '../contexts/StorageContext';
import { Share as RNShare } from 'react-native';
import http from '../services/http';
import * as Clipboard from 'expo-clipboard';
import CustomText from './Components/CustomText';

const { width, height } = Dimensions.get('window');

// Skeleton loader
const SkeletonLoader = ({ width, height, style }) => {
    return (
        <View style={[{
            width,
            height,
            backgroundColor: '#e1e1e1',
            borderRadius: 4,
            overflow: 'hidden',
        }, style]}>
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }} />
        </View>
    );
};

const ReferralScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { userDetail } = useContext(StorageContext);
    const [copied, setCopied] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [rewardHistory, setRewardHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const referralCode = userDetail?.referral_code || '';

    useEffect(() => {
        if (!userDetail) {
            navigation.replace('Login');
            return;
        }
        fetchReferralHistory();
    }, [userDetail]);

    const fetchReferralHistory = async () => {
        if (!userDetail) return;

        try {
            if (!refreshing) setIsLoading(true);
            const response = await http.get('/referral-transactions');

            const transformedData = response.data.data.map((item) => ({
                id: item.id,
                date: new Date(item.created_at).toLocaleDateString('en-GB').replace(/\//g, '/'),
                points: item.points || 0,
                referredUser: item.referred_user_name || 'Unknown User',
            }));

            setRewardHistory(transformedData);
            setError(null);
        } catch (error) {
            setError('Failed to load referral history');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchReferralHistory();
    };

    const copyToClipboard = async () => {
        if (!referralCode) return;
        await Clipboard.setStringAsync(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareReferralCode = async () => {
        if (!referralCode) return;
        try {
            await RNShare.share({
                message: `Use my referral code ${referralCode} to get a discount on your first appointment!`,
            });
        } catch (error) {
            console.error('Error sharing referral code:', error);
        }
    };

    const openHowItWorks = () => {
        setShowHowItWorks(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    };

    const closeHowItWorks = () => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
        Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start(() =>
            setShowHowItWorks(false)
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Referral</CustomText>
                <View style={{ width: 28 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.cardOverlap}>
                    <View style={styles.codeContainer}>
                        {isLoading ? (
                            <>
                                <SkeletonLoader width={150} height={14} style={{ marginBottom: 10 }} />
                                <SkeletonLoader width={200} height={32} style={{ marginBottom: 20, borderRadius: 0 }} />
                                <View style={styles.buttonContainer}>
                                    <SkeletonLoader width={(width - 72) / 2} height={47} style={{ borderRadius: 8 }} />
                                    <SkeletonLoader width={(width - 72) / 2} height={47} style={{ borderRadius: 8 }} />
                                </View>
                                <View style={[styles.inviteInfo, { marginTop: 25 }]}>
                                    <SkeletonLoader width={32} height={32} style={{ borderRadius: 16 }} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
                                        <SkeletonLoader width="40%" height={14} />
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <CustomText style={styles.codeLabel}>YOUR REFERRAL CODE</CustomText>
                                <CustomText style={styles.codeText}>{referralCode || 'Not Available'}</CustomText>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.copyButton, !referralCode && styles.disabledButton]}
                                        onPress={copyToClipboard}
                                        activeOpacity={0.7}
                                        disabled={!referralCode}
                                    >
                                        <Ionicons name="copy-outline" size={20} color={referralCode ? '#333' : '#ccc'} />
                                        <CustomText style={[styles.copyButtonText, !referralCode && styles.disabledText]}>
                                            {copied ? 'Copied!' : 'Copy Code'}
                                        </CustomText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.shareButton, !referralCode && styles.disabledButton]}
                                        onPress={shareReferralCode}
                                        activeOpacity={0.7}
                                        disabled={!referralCode}
                                    >
                                        <Ionicons name="share-social-outline" size={20} color={referralCode ? '#fff' : '#ccc'} />
                                        <CustomText style={[styles.shareButtonText, !referralCode && styles.disabledText]}>Share</CustomText>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inviteInfo}>
                                    <Image source={require('../assets/icons/referral_reward.png')} style={styles.crownIcon} />
                                    <View style={styles.inviteTextContainer}>
                                        <CustomText style={styles.inviteText}>Invite new customers to get points</CustomText>
                                        <TouchableOpacity onPress={openHowItWorks}>
                                            <CustomText style={styles.howItWorksText}>How it works?</CustomText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Reward History */}
                <View style={styles.historyContainer}>
                    <CustomText style={styles.historyTitle}>Reward History</CustomText>

                    {isLoading ? (
                        <View style={styles.historySkeletonContainer}>
                            {[...Array(3)].map((_, index) => (
                                <View key={index} style={styles.historyItemSkeleton}>
                                    <View>
                                        <SkeletonLoader width={160} height={18} style={{ marginBottom: 8 }} />
                                        <SkeletonLoader width={120} height={14} style={{ marginBottom: 6 }} />
                                        <SkeletonLoader width={100} height={14} />
                                    </View>
                                    <SkeletonLoader width={60} height={18} />
                                </View>
                            ))}
                        </View>
                    ) : error ? (
                        <View style={styles.emptyState}>
                            <Image source={require('../assets/icons/empty_lottie.gif')} style={styles.emptyIcon} />
                            <CustomText style={styles.emptyText}>{error}</CustomText>
                        </View>
                    ) : rewardHistory.length === 0 ? (
                        <View style={styles.emptyState}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                            >
                                <Image source={require('../assets/icons/empty_lottie.gif')} style={styles.emptyIcon} />
                                <CustomText style={styles.emptyText}>No Transaction Found</CustomText>
                            </ScrollView>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                            {rewardHistory.map((item) => (
                                <View key={item.id} style={styles.historyItem}>
                                    <View style={styles.historyItemLeft}>
                                        <CustomText style={styles.historyItemType}>Referral Reward</CustomText>
                                        <CustomText style={styles.historyItemSubtext}>Referred: {item.referredUser}</CustomText>
                                        <CustomText style={styles.historyItemDate}>{item.date}</CustomText>
                                    </View>
                                    <CustomText style={styles.historyItemPoints}>+{item.points.toFixed(1)}</CustomText>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* How it works Modal */}
            {showHowItWorks && (
                <TouchableWithoutFeedback onPress={closeHowItWorks}>
                    <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                        <TouchableWithoutFeedback>
                            <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
                                <View style={styles.modalHeader}>
                                    <CustomText style={styles.modalTitle}>How it works?</CustomText>
                                    <TouchableOpacity onPress={closeHowItWorks}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.modalContent}>
                                    <View style={styles.stepRow}>
                                        <Image source={require('../assets/icons/ic_send_2.png')} style={styles.stepIcon} />
                                        <CustomText style={styles.stepText}>Share your referral code to your friends.</CustomText>
                                    </View>
                                    <View style={styles.stepRow}>
                                        <Image source={require('../assets/icons/ic_percentage_square.png')} style={styles.stepIcon} />
                                        <CustomText style={styles.stepText}>Your friends book an appointment and apply your code to receive a discount.</CustomText>
                                    </View>
                                    <View style={styles.stepRow}>
                                        <Image source={require('../assets/icons/ic_crown.png')} style={styles.stepIcon} />
                                        <CustomText style={styles.stepText}>After your friend's booking is completed, you will receive points as a reward.</CustomText>
                                    </View>
                                    <View style={styles.noteContainer}>
                                        <CustomText style={styles.noteText}>Each referral code can only be used once per person.</CustomText>
                                    </View>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 70,
        backgroundColor: '#000',
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        zIndex: 1,
    },
    backButton: {
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#fff',
        marginTop: 15,
    },
    content: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'visible',
        marginTop: -20,
    },
    cardOverlap: {
        marginTop: -20,
        paddingHorizontal: 16,
        paddingTop: 10,
        zIndex: 2,
    },
    codeContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
        marginTop: 7,
        height: 235,
    },
    codeLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
        marginTop: -10,
        fontFamily: 'Nunito_400Regular',
    },
    codeText: {
        fontSize: 28,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
        letterSpacing: 1,
        marginBottom: 17,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#000',
        height: 47,
        flex: 1,
        marginRight: 10,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#001C3D',
        borderRadius: 8,
        height: 47,
        flex: 1,
        marginLeft: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
    copyButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Nunito_500Medium',
    },
    shareButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Nunito_500Medium',
    },
    disabledText: {
        color: '#ccc',
    },
    inviteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
        width: '100%',
    },
    crownIcon: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    inviteTextContainer: {
        flex: 1,
    },
    inviteText: {
        fontSize: 15,
        fontFamily: 'Nunito_500Medium',
        color: '#333',
    },
    howItWorksText: {
        fontSize: 14,
        color: '#000',
        textDecorationLine: 'underline',
        marginTop: 2,
        fontFamily: 'Nunito_500Medium',
    },
    historyContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginTop: 10,
    },
    historyTitle: {
        fontSize: 15,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
        marginBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historySkeletonContainer: {
        flex: 1,
    },
    historyItemSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        width: 140,
        height: 140,
        marginBottom: 15,
        // marginTop: 40,
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'Nunito_400Regular',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    historyItemLeft: {
        flexDirection: 'column',
    },
    historyItemType: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Nunito_800ExtraBold',
    },
    historyItemSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
        fontFamily: 'Nunito_400Regular',
    },
    historyItemDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        fontFamily: 'Nunito_400Regular',
    },
    historyItemPoints: {
        fontSize: 16,
        color: '#4CAF50',
        fontFamily: 'Nunito_600SemiBold',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 99,
    },
    modalContainer: {
        backgroundColor: '#FFEDED',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        maxHeight: height * 0.8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#333',
    },
    modalContent: {
        paddingVertical: 20,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    stepIcon: {
        width: 25,
        height: 25,
        marginRight: 15,
    },
    stepText: {
        fontSize: 16,
        flex: 1,
        fontFamily: 'Nunito_400Regular',
    },
    noteContainer: {
        backgroundColor: '#FFECD6',
        padding: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#FF8C08',
        borderStyle: 'dashed',
        marginTop: 10,
        marginBottom: 40,
    },
    noteText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'Nunito_400Regular',
    },
});

export default ReferralScreen;





