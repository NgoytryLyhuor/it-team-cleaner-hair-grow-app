import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
    Dimensions,
    ImageBackground,
    Image,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './Components/CustomText';
import { StorageContext } from '../contexts/StorageContext';
import http from '../services/http';

const { width } = Dimensions.get('window');

const Points = ({ navigation, route }) => {
    const { userDetail } = useContext(StorageContext);
    const [activeTab, setActiveTab] = useState('History');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabTextRefs = useRef({});
    const [tabWidths, setTabWidths] = useState({ History: 0, Earned: 0, Used: 0 });
    const [tabPositions, setTabPositions] = useState({});
    const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!userDetail) {
            navigation.replace('Login');
            return;
        }
    }, [userDetail, navigation]);

    useEffect(() => {
        if (!userDetail) {
            return;
        }
        fetchTransactions();
    }, [userDetail]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            // Simulate loading delay to show skeleton
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await http.get('/credit-transactions');
            if (response.data && response.data.data) {
                // Transform the API data to match your display format
                const transformedData = response.data.data.map(item => ({
                    id: item.id,
                    type: item.type || 'Transaction',
                    date: new Date(item.created_at).toLocaleDateString('en-GB').replace(/\//g, '/'),
                    points: Math.abs(item.value),
                    isPositive: item.value > 0,
                    subtext: item.log || null,
                }));
                setTransactions(transformedData);
            }
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPoints = () => {
        if (activeTab === 'History') {
            return transactions;
        } else if (activeTab === 'Earned') {
            return transactions.filter(item => item.isPositive);
        } else if (activeTab === 'Used') {
            return transactions.filter(item => !item.isPositive);
        }
        return [];
    };

    const handleTabChange = (tab) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setActiveTab(tab);
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
        });

        Animated.timing(tabIndicatorPosition, {
            toValue: tabPositions[tab],
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const measureTab = (tab, event) => {
        const { width, x } = event.nativeEvent.layout;
        tabTextRefs.current[tab]?.measure((fx, fy, w, h, px, py) => {
            setTabWidths(prev => ({ ...prev, [tab]: w }));
            setTabPositions(prev => ({ ...prev, [tab]: x + (width - w) / 2 }));
        });
    };

    useEffect(() => {
        const allMeasured = Object.values(tabPositions).length === 3 &&
            Object.values(tabPositions).every(pos => pos !== undefined);
        if (allMeasured) {
            Animated.timing(tabIndicatorPosition, {
                toValue: tabPositions['History'],
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    }, [tabPositions]);

    // Render skeleton for points card
    const renderSkeletonPointsCard = () => (
        <View style={styles.skeletonPointsCard}>
            <View style={styles.skeletonCardContent}>
                <View style={{ width: '100%' }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                        <View style={styles.skeletonMembershipTitle} />
                        <View style={styles.skeletonLogoImage} />
                    </View>
                    <View style={styles.pointsRow}>
                        <View style={styles.skeletonCrownIcon} />
                        <View>
                            <View style={styles.skeletonPointsValue} />
                            <View style={styles.skeletonEquivalentText} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    // Render skeleton for points item
    const renderSkeletonPointsItem = () => (
        <View style={styles.skeletonPointsItemCard}>
            <View style={styles.pointsItemLeft}>
                <View style={styles.skeletonPointsItemType} />
                <View style={styles.skeletonPointsItemSubtext} />
                <View style={styles.skeletonPointsItemDate} />
            </View>
            <View style={styles.skeletonPointsItemValue} />
        </View>
    );

    // Render skeleton loader list
    const renderSkeletonList = () => (
        <ScrollView
            style={styles.pointsListScrollContainer}
            contentContainerStyle={styles.pointsListContentContainer}
            showsVerticalScrollIndicator={false}
        >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                <View key={item} style={{ marginBottom: 12 }}>
                    {renderSkeletonPointsItem()}
                </View>
            ))}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 40 : 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Points</CustomText>
                <View style={styles.rightHeaderPlaceholder} />
            </View>

            {/* Points Card - Show skeleton while loading */}
            {isLoading ? renderSkeletonPointsCard() : (
                <View style={styles.pointsCard}>
                    <ImageBackground
                        source={require('../assets/images/points_banner_bg.png')}
                        style={styles.cardBackground}
                        imageStyle={styles.cardBackgroundImage}
                    >
                        <View style={styles.cardContent}>
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                                >
                                    <CustomText style={styles.membershipTitle}>MEMBERSHIP POINTS</CustomText>
                                    <Image
                                        source={require('../assets/logo_long.png')}
                                        style={styles.logoImage}
                                    />
                                </View>
                                <View style={styles.pointsRow}>
                                    <Image
                                        source={require('../assets/icons/ic_crown.png')}
                                        style={styles.crownIcon}
                                    />
                                    <View>
                                        <CustomText style={styles.pointsValue}>
                                            {userDetail?.credit?.toFixed(2) || '0.00'}
                                        </CustomText>
                                        <CustomText style={styles.equivalentText}>
                                            Equivalent to ${(userDetail?.credit * 0.015).toFixed(2)}
                                        </CustomText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            )}

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {['History', 'Earned', 'Used'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={styles.tab}
                        onPress={() => handleTabChange(tab)}
                        onLayout={(event) => measureTab(tab, event)}
                    >
                        <CustomText
                            ref={ref => tabTextRefs.current[tab] = ref}
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}
                        >
                            {tab}
                        </CustomText>
                    </TouchableOpacity>
                ))}

                {/* Animated Tab Indicator */}
                <Animated.View
                    style={[
                        styles.activeTabIndicator,
                        {
                            left: tabIndicatorPosition,
                            width: tabWidths[activeTab] || 0,
                        }
                    ]}
                />
            </View>

            {/* Scrollable Points List */}
            {isLoading ? (
                renderSkeletonList()
            ) : (
                <ScrollView
                    style={styles.pointsListScrollContainer}
                    contentContainerStyle={styles.pointsListContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}>
                        {filteredPoints().length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIconContainer}>
                                    <View style={styles.documentIcon}>
                                        <View style={styles.documentContent}>
                                            <View style={styles.documentLine1} />
                                            <View style={styles.documentLineGroup}>
                                                <View style={styles.documentLine2} />
                                                <View style={styles.documentLine2} />
                                            </View>
                                            <View style={styles.documentLineGroup}>
                                                <View style={styles.documentLine3} />
                                                <View style={styles.documentLine3} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.magnifierContainer}>
                                        <View style={styles.magnifierCircle}>
                                            <View style={styles.magnifierHandle} />
                                        </View>
                                    </View>
                                </View>
                                <CustomText style={styles.emptyTitle}>No Points Transactions</CustomText>
                                <CustomText style={styles.emptyText}>No transactions found for this category.</CustomText>
                                <TouchableOpacity style={styles.reloadButton} onPress={fetchTransactions}>
                                    <CustomText style={styles.reloadButtonText}>Reload</CustomText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            filteredPoints().map((item, index) => (
                                <Animated.View
                                    key={item.id}
                                    style={[
                                        styles.pointsItemCard,
                                        {
                                            transform: [{
                                                translateY: new Animated.Value(0).interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [(index * 5), 0]
                                                })
                                            }]
                                        }
                                    ]}
                                    entering={Animated.timing({
                                        duration: 300 + (index * 70),
                                        useNativeDriver: true
                                    })}
                                >
                                    <View style={styles.pointsItemLeft}>
                                        <CustomText style={styles.pointsItemType}>{item.type}</CustomText>
                                        {item.subtext && <CustomText style={styles.pointsItemSubtext}>{item.subtext}</CustomText>}
                                        <CustomText style={styles.pointsItemDate}>{item.date}</CustomText>
                                    </View>
                                    <CustomText style={[
                                        styles.pointsItemValue,
                                        item.isPositive ? styles.pointsPositive : styles.pointsNegative
                                    ]}>
                                        {item.isPositive
                                            ? `+${item.points.toFixed(1)}`
                                            : `-${item.points.toFixed(1)}`
                                        }
                                    </CustomText>
                                </Animated.View>
                            ))
                        )}
                    </Animated.View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Gray background like Shop page
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        height: 93,
        backgroundColor: '#000',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 1,
        // Shadow for header
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 15,
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 15,
        fontFamily: 'Nunito_800ExtraBold',
    },
    rightHeaderPlaceholder: {
        width: 40,
    },
    pointsCard: {
        height: 148,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 15,
        marginHorizontal: 15,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    cardBackgroundImage: {
        borderRadius: 15,
    },
    cardContent: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
    },
    membershipTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        letterSpacing: 0.5,
        fontFamily: 'Nunito_800ExtraBold',
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    crownIcon: {
        width: 26,
        height: 26,
        marginRight: 10,
        tintColor: '#FFFFFF',
    },
    pointsValue: {
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: 'Nunito_800ExtraBold',
    },
    equivalentText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginTop: 5,
        opacity: 0.9,
        fontFamily: 'Nunito_800ExtraBold',
    },
    logoImage: {
        width: 80,
        height: 33,
        resizeMode: 'contain',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
        backgroundColor: 'transparent',
        paddingHorizontal: 15,
        marginTop: -5.5
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTabText: {
        color: '#000',
        fontFamily: 'Nunito_600SemiBold',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'Nunito_500Medium',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: '#000',
    },
    pointsListScrollContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    pointsListContentContainer: {
        paddingBottom: 40,
    },
    pointsItemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        height: 84
    },
    pointsItemLeft: {
        flexDirection: 'column',
    },
    pointsItemType: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Nunito_800ExtraBold',
    },
    pointsItemSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
        fontFamily: 'Nunito_400Regular',
    },
    pointsItemDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        fontFamily: 'Nunito_400Regular',
    },
    pointsItemValue: {
        fontSize: 16,
        fontFamily: 'Nunito_600SemiBold',
    },
    pointsPositive: {
        color: '#4CAF50',
    },
    pointsNegative: {
        color: '#F44336',
    },

    // Skeleton loader styles
    skeletonPointsCard: {
        height: 148,
        borderRadius: 15,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 15,
        marginHorizontal: 15,
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    skeletonCardContent: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    skeletonMembershipTitle: {
        width: 120,
        height: 14,
        backgroundColor: '#D1D1D1',
        borderRadius: 7,
    },
    skeletonLogoImage: {
        width: 80,
        height: 33,
        backgroundColor: '#D1D1D1',
        borderRadius: 5,
    },
    skeletonCrownIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#D1D1D1',
        marginRight: 10,
    },
    skeletonPointsValue: {
        width: 100,
        height: 25,
        backgroundColor: '#D1D1D1',
        borderRadius: 7,
        marginBottom: 5,
    },
    skeletonEquivalentText: {
        width: 120,
        height: 14,
        backgroundColor: '#D1D1D1',
        borderRadius: 7,
        marginTop: 5,
    },
    skeletonPointsItemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        height: 84
    },
    skeletonPointsItemType: {
        width: 100,
        height: 16,
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        marginBottom: 4,
    },
    skeletonPointsItemSubtext: {
        width: 150,
        height: 12,
        backgroundColor: '#E5E5E5',
        borderRadius: 6,
        marginTop: 4,
    },
    skeletonPointsItemDate: {
        width: 80,
        height: 12,
        backgroundColor: '#E5E5E5',
        borderRadius: 6,
        marginTop: 5,
    },
    skeletonPointsItemValue: {
        width: 50,
        height: 16,
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
    },

    // Empty state styles
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        marginBottom: 30,
        position: 'relative',
    },
    documentIcon: {
        position: 'absolute',
        top: 15,
        left: 35,
        width: 50,
        height: 60,
        backgroundColor: '#E8EBF2',
        borderRadius: 4,
        padding: 8,
    },
    documentContent: {
        flex: 1,
    },
    documentLine1: {
        width: '100%',
        height: 8,
        backgroundColor: '#C5CAD6',
        borderRadius: 2,
        marginBottom: 8,
    },
    documentLineGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    documentLine2: {
        width: '45%',
        height: 6,
        backgroundColor: '#C5CAD6',
        borderRadius: 2,
    },
    documentLine3: {
        width: '30%',
        height: 6,
        backgroundColor: '#C5CAD6',
        borderRadius: 2,
    },
    magnifierContainer: {
        position: 'absolute',
        bottom: 10,
        right: 25,
    },
    magnifierCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#C5CAD6',
        borderWidth: 8,
        borderColor: '#E8EBF2',
    },
    magnifierHandle: {
        position: 'absolute',
        bottom: -12,
        right: -12,
        width: 20,
        height: 5,
        backgroundColor: '#C5CAD6',
        transform: [{ rotate: '45deg' }],
    },
    emptyTitle: {
        fontSize: 18,
        color: '#2C394B',
        marginBottom: 12,
        fontFamily: 'Nunito_700Bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#7B8591',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
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
});

export default Points;