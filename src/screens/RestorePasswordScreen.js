import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/api';

const RestorePasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRestore = async () => {
        if (!email) {
            Alert.alert('Ошибка', 'Пожалуйста, введите ваш Email');
            return;
        }

        setLoading(true);
        try {
            const response = await api.forgotPassword({ email });
            Alert.alert('Успешно', 'Ссылка для сброса пароля отправлена на ваш Email', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            console.error('Restore error:', error);
            const message = error.response?.data?.error || 'Произошла ошибка при отправке письма';
            Alert.alert('Ошибка', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Восстановление пароля</Text>
            <Text style={styles.subtitle}>Введите ваш Email, чтобы получить ссылку для сброса пароля</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleRestore} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Отправить ссылку</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Назад к входу</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#1976d2',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#1976d2',
        fontSize: 16,
    },
});

export default RestorePasswordScreen;
