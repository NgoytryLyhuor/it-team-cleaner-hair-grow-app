import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';

const FirstLoadScreen = ({ navigation }) => {
    // Create an animated value for fade effect
    const fadeAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start a timer for 1.5 seconds
        const timer = setTimeout(() => {
            // Start fade out animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500, // Fade out over 500ms
                useNativeDriver: true,
            }).start(() => {
                // Navigate to HomeScreen after animation completes
                navigation.replace('HomeScreen');
            });
        }, 1000); // 1 second delay before starting fade-out

        // Clear timeout if component unmounts
        return () => clearTimeout(timer);
    }, [navigation, fadeAnim]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Replace with your logo/image */}
            <Image
                source={require('../assets/splash_screen_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6E6', // Match your app's theme
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 250,
        height: 250,
    },
});

export default FirstLoadScreen;