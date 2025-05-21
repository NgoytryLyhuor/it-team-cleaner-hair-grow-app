import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from './CustomText';

const CustomCancelAlert = ({ visible, onClose, onConfirm, bookingId }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.alertContainer}>
                    {/* Alert Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="alert" size={32} color="#000" />
                    </View>

                    {/* Alert Title */}
                    <CustomText style={styles.alertTitle}>
                        Do you want to cancel this booking?
                    </CustomText>

                    {/* Buttons Container */}
                    <View style={styles.buttonsContainer}>
                        {/* No Button */}
                        <TouchableOpacity
                            style={styles.noButton}
                            onPress={onClose}
                        >
                            <Ionicons name="close" size={20} color="#000" />
                            <CustomText style={styles.noButtonText}>No</CustomText>
                        </TouchableOpacity>

                        {/* Yes Button */}
                        <TouchableOpacity
                            style={styles.yesButton}
                            onPress={() => onConfirm(bookingId)}
                        >
                            <Ionicons name="checkmark" size={20} color="#FFF" />
                            <CustomText style={styles.yesButtonText}>Yes</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#D3D3D3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    alertTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    noButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    noButtonText: {
        marginLeft: 8,
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#000',
    },
    yesButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        marginLeft: 8,
        borderRadius: 8,
        backgroundColor: '#000',
    },
    yesButtonText: {
        marginLeft: 8,
        fontFamily: 'Nunito-Bold',
        fontSize: 16,
        color: '#FFF',
    },
});

export default CustomCancelAlert;