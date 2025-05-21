import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = ({ children, style, weight = 'regular', italic = false, ...props }) => {
    // Map weight prop to actual font family names
    const fontFamily = () => {
        const base = 'Nunito';
        const weightMap = {
            light: 'Light',
            regular: 'Regular',
            medium: 'Medium',
            semibold: 'SemiBold',
            bold: 'Bold',
            extrabold: 'ExtraBold',
            black: 'Black'
        };

        const styleSuffix = italic ? 'Italic' : '';
        return `${base}-${weightMap[weight] || 'Regular'}${styleSuffix}`;
    };

    return (
        <Text
            style={[styles.baseText, { fontFamily: fontFamily() }, style]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    baseText: {
        // Default text styles if needed
    }
});

export default CustomText;