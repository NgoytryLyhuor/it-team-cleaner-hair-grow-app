import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Animated,
    FlatList,
    StatusBar,
    ImageBackground
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomText from '../screens/Components/CustomText';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const textOpacity = useRef(new Animated.Value(1)).current;

    const slides = [
        {
            id: '1',
            image: require('../assets/walk_img_1.png'),
            title: 'Earn Points by completing services',
            subtitle: 'Loyalty Points Program for Exclusive Discounts! growTokyo',
            buttonText: 'Next',
        },
        {
            id: '2',
            image: require('../assets/walk_img_2.png'),
            title: 'Get coupon for discount',
            subtitle: "Don't miss out on the chance to save big on your favorite services",
            buttonText: 'Next',
        },
        {
            id: '3',
            image: require('../assets/walk_img_3.png'),
            title: 'Book & Manage your bookings',
            subtitle: "Turn on notification and we'll remind you when your booking is coming",
            buttonText: 'Get Started',
        },
    ];

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            handleSkip()
        }
    };

    const handleSkip = () => {
        navigation.replace('HomeScreen');
    };

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(offsetX / width);
                if (newIndex !== currentIndex) {
                    Animated.timing(textOpacity, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }).start(() => {
                        setCurrentIndex(newIndex);
                        Animated.timing(textOpacity, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }).start();
                    });
                }
            }
        }
    );

    const renderSlideItem = ({ item }) => (
        <View style={styles.slideContainer}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ImageBackground
                source={require('../assets/bg_pattern.png')}
                style={[styles.header]}
                resizeMode="cover"
            >
                <View style={styles.headerContent}>
                    <Image
                        source={require('../assets/logo_long.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity onPress={handleSkip} style={[styles.skipButton, { paddingTop: insets.top + 20 }]}
>
                        <CustomText style={styles.skipText}>Skip</CustomText>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <View style={[styles.content]}>
                <View style={styles.sliderContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={slides}
                        renderItem={renderSlideItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                </View>

                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    <CustomText style={styles.title}>{slides[currentIndex].title}</CustomText>
                    <CustomText style={styles.subtitle}>{slides[currentIndex].subtitle}</CustomText>
                </Animated.View>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => {
                        const inputRange = [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ];

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 20, 8],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    flatListRef.current?.scrollToIndex({ index, animated: true });
                                }}
                                activeOpacity={0.7}
                            >
                                <Animated.View
                                    style={[
                                        styles.dot,
                                        {
                                            width: dotWidth,
                                            opacity,
                                            backgroundColor: index === currentIndex ? '#000' : '#D9D9D9',
                                        },
                                    ]}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <CustomText style={styles.buttonText}>
                        {slides[currentIndex].buttonText}
                    </CustomText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        backgroundColor: '#000',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        width: '100%',
        height: height * 0.11
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height * 0.11,
        // backgroundColor: '#fff'
    },
    logo: {
        width: width * 0.3,
        height: '100%',
        resizeMode: 'contain'
    },
    skipButton: {
        position: 'absolute',
        top: 10,
        right: 20,
    },
    skipText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    sliderContainer: {
        flex: 1,
    },
    slideContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        height: height * 0.5
    },
    image: {
        width: '90%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 20,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight:'bold'
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    footer: {
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: width - 80,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
    },
});

export default WelcomeScreen;
