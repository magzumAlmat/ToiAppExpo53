import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, loginSuccess, setError, setLoading } from '../store/authSlice';
import api from '../api/api';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  primary: '#FF6F61',
  white: '#FFFFFF',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    dispatch(startLoading());
    console.log('Login attempt:', { email, password }, 'link--------', process.env.EXPO_PUBLIC_API_baseURL);
    try {
      const loginResponse = await api.login({ email, password });
      console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
      const authToken = loginResponse.data.token;

      await SecureStore.setItemAsync('token', authToken);
      console.log('Token saved to SecureStore:', authToken);

      api.setToken(authToken);

      const userResponse = await api.getUser();
      console.log('Get user response:', JSON.stringify(userResponse.data, null, 2));

      dispatch(loginSuccess({ user: userResponse.data, token: authToken }));
      // Remove navigation.navigate('Authenticated') as isAuthenticated will handle it
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      dispatch(setError(error.response?.data?.error || 'Ошибка входа'));
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось войти');
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      console.log('Checking stored token...');
      dispatch(setLoading(true));
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        console.log('Stored token found:', storedToken);

        if (storedToken) {
          api.setToken(storedToken);
          const userResponse = await api.getUser();
          console.log('User data from token:', JSON.stringify(userResponse.data, null, 2));

          dispatch(loginSuccess({ user: userResponse.data, token: storedToken }));
          // Remove navigation.navigate('Authenticated')
        } else {
          console.log('No token found, staying on Login screen');
        }
      } catch (err) {
        console.error('Token validation error:', err.response?.data || err.message);
        dispatch(setError('Войдите в личный кабинет'));
        await SecureStore.deleteItemAsync('token');
        console.log('Token removed from SecureStore due to invalidity');
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkToken();
  }, [dispatch]);

  return (
    <LinearGradient
      colors={['#F1EBDD', '#897066']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <Image
        source={require('../../assets/footer.png')}
        style={styles.footerPattern}
      />

      <Text style={styles.title}>Вход</Text>

      <View style={styles.iconContainer}>
        <MaterialIcons name="person" size={40} color="#5A4032" />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholderTextColor="#B0BEC5"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#B0BEC5"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#5A4032"
            />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <TouchableOpacity style={styles.loginButtonContainer} onPress={handleLogin}>
        <LinearGradient
          colors={['#D3C5B7', '#A68A6E']}
          style={styles.loginButtonGradient}
        >
          <Text style={styles.loginButtonText}>Вход</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPattern: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '20%',
    zIndex: 1,
    resizeMode: 'cover',
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 40,
    zIndex: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    zIndex: 2,
  },
  inputContainer: {
    width: '80%',
    zIndex: 2,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 15,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  error: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  loginButtonContainer: {
    marginTop: 20,
    marginBottom: 30,
    zIndex: 2,
  },
  loginButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5A4032',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  linksContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#5A4032',
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
});