import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import api from '../api/api';
import { Appbar } from 'react-native-paper';

export default function ItemEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const itemId = route.params?.id; // ID объекта для редактирования
  const type = route.params?.type; // Тип объекта (restaurant, goods и т.д.)
  console.log('Принимаю параметры: id=', itemId, 'type=', type);
  const { user, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({});
  const [modalVisible, setModalVisible] = useState({
    cuisine: false,
    district: false,
    gender: false,
    category: false, // Для выбора категории в goods
  });
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  const pickFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Ошибка', 'Требуется разрешение для доступа к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFiles([...selectedFiles, ...result.assets]);
    }
  };

  const removeFile = (uri) => {
    setSelectedFiles(selectedFiles.filter(file => file.uri !== uri));
  };

  const uploadFiles = async (entityType, entityId) => {
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: file.uri.split('/').pop(),
      });

      try {
        await axios.post(
          `${BASE_URL}/api/${entityType}/${entityId}/files`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } catch (error) {
        console.error('File upload error:', error.response?.data || error.response || error);
        throw new Error('Ошибка загрузки файла');
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот файл?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/${type}/${itemId}/files/${fileId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              setFiles(files.filter(file => file.id !== fileId));
              Alert.alert('Успех', 'Файл удален');
            } catch (error) {
              console.error('Error deleting file:', error.response?.data || error.response || error);
              Alert.alert('Ошибка', 'Не удалось удалить файл');
            }
          },
        },
      ]
    );
  };

  const cuisineOptions = ['Русская', 'Итальянская', 'Азиатская', 'Французская', 'Американская'];
  const districtOptions = [
    'Медеуский', 'Бостандыкский', 'Алмалинский', 'Ауэзовский', 'Наурызбайский',
    'Алатауский', 'Жетысуйский', 'За пределами Алматы',
  ];
  const cityOptions = ['Алматы', 'Астана', 'Шымкент'];
  const genderOptions = ['мужской', 'женский'];
  const categoryOptions = [
    'Деньги',
    'Бытовая техника',
    'Посуда и кухонные принадлежности',
    'Текстиль для дома',
    'Мебель и элементы интерьера',
    'Подарки для отдыха и путешествий',
    'Электроника и гаджеты',
    'Подарки для хобби и увлечений',
    'Символические и романтические подарки',
    'Сертификаты и подписки',
    'Алкоголь и гастрономия',
    'Традиционные подарки',
  ];

  const fetchFiles = async (entityType, entityId) => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_baseURL}/api/${entityType}/${entityId}/files`);
      setFiles(response.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setErrorFiles("Ошибка загрузки файлов: " + error.message);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Загрузка данных объекта для редактирования
  useEffect(() => {
    if (itemId && token && type) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          let response;
          switch (type) {
            case 'restaurant': response = await api.getRestaurantById(itemId); break;
            case 'clothing': response = await api.getClothingById(itemId); break;
            case 'transport': response = await api.getTransportById(itemId); break;
            case 'tamada': response = await api.getTamadaById(itemId); break;
            case 'program': response = await api.getProgramById(itemId); break;
            case 'traditionalGift': response = await api.getTraditionalGiftById(itemId); break;
            case 'flowers': response = await api.getFlowersById(itemId); break;
            case 'cake': response = await api.getCakeById(itemId); break;
            case 'alcohol': response = await api.getAlcoholById(itemId); break;
            case 'goods': response = await api.getGoodById(itemId); break;
            case 'jewelry': response = await api.getJewelryById(itemId); break;
            default: throw new Error('Неизвестный тип объекта');
          }
          const itemData = Array.isArray(response.data) ? response.data[0] : response.data;
          console.log(`Данные ${type} с сервера:`, itemData);

          const formattedData = {
            ...Object.keys(itemData).reduce((acc, key) => {
              acc[key] = itemData[key] !== null && itemData[key] !== undefined ? String(itemData[key]) : '';
              return acc;
            }, {}),
            specs: itemData.specs || { address: '', phone: '', storeName: '' }, // Обеспечиваем наличие specs для goods
          };
          setForm(formattedData);
          fetchFiles(type, itemId);
        } catch (error) {
          console.error('Ошибка загрузки данных:', error.response || error);
          alert('Ошибка загрузки: ' + (error.response?.data?.message || error.message));
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [itemId, token, type]);

  const handleChange = (field, value) => {
    if (field === 'specs') {
      setForm((prev) => ({
        ...prev,
        specs: { ...prev.specs, ...value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const formatPhoneNumber = (input) => {
    let cleaned = input.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) cleaned = '+' + cleaned.replace(/\+/g, '');
    if (!cleaned.startsWith('+7')) cleaned = '+7' + cleaned.replace(/^\+?\d*/g, '');
    const digits = cleaned.slice(2, 12);
    let formatted = '+7';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 3);
    if (digits.length > 3) formatted += ') ' + digits.slice(3, 6);
    if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
    if (digits.length > 8) formatted += '-' + digits.slice(8, 10);
    return formatted;
  };

  const handlePhoneChange = (text) => {
    const formattedPhone = formatPhoneNumber(text);
    handleChange('specs', { phone: formattedPhone });
  };

  const handleSave = async () => {
    if (!token) {
      alert('Пожалуйста, войдите в систему');
      navigation.navigate('Login');
      return;
    }

    let formattedForm = { ...form, supplier_id: user.id };
    if (type === 'restaurant') {
      formattedForm.averageCost = parseFloat(form.averageCost) || 0;
      formattedForm.capacity = parseInt(form.capacity, 10) || 0;
    } else if (['clothing', 'tamada', 'program', 'traditionalGift', 'flowers', 'cake', 'alcohol', 'jewelry'].includes(type)) {
      formattedForm.cost = parseFloat(form.cost) || 0;
    } else if (type === 'goods') {
      if (!form.category || !form.item_name) {
        alert('Заполните обязательные поля: Категория и Название товара');
        return;
      }
      formattedForm = {
        category: form.category,
        item_name: form.item_name,
        description: form.description || '',
        cost: parseFloat(form.cost) || 0,
        specs: form.specs || { address: '', phone: '', storeName: '' },
        supplier_id: user.id,
      };
    }

    try {
      setIsLoading(true);
      if (itemId) {
        switch (type) {
          case 'restaurant': await api.updateRestaurant(itemId, formattedForm); break;
          case 'clothing': await api.updateClothing(itemId, formattedForm); break;
          case 'transport': await api.updateTransport(itemId, formattedForm); break;
          case 'tamada': await api.updateTamada(itemId, formattedForm); break;
          case 'program': await api.updateProgram(itemId, formattedForm); break;
          case 'traditionalGift': await api.updateTraditionalGift(itemId, formattedForm); break;
          case 'flowers': await api.updateFlowers(itemId, formattedForm); break;
          case 'cake': await api.updateCake(itemId, formattedForm); break;
          case 'alcohol': await api.updateAlcohol(itemId, formattedForm); break;
          case 'goods': await api.updateGoodById(itemId, formattedForm); break;
          case 'jewelry': await api.updateJewelry(itemId, formattedForm); break;
          default: throw new Error('Неизвестный тип объекта');
        }
        if (selectedFiles.length > 0) {
          await uploadFiles(type, itemId);
        }
        alert(`${type} обновлён!`);
        setSelectedFiles([]);
      } else {
        switch (type) {
          case 'restaurant': await api.createRestaurant(formattedForm); break;
          case 'clothing': await api.createClothing(formattedForm); break;
          case 'transport': await api.createTransport(formattedForm); break;
          case 'tamada': await api.createTamada(formattedForm); break;
          case 'program': await api.createProgram(formattedForm); break;
          case 'traditionalGift': await api.createTraditionalGift(formattedForm); break;
          case 'flowers': await api.createFlowers(formattedForm); break;
          case 'cake': await api.createCake(formattedForm); break;
          case 'alcohol': await api.createAlcohol(formattedForm); break;
          case 'goods': await api.postGoodsData(formattedForm); break;
          default: throw new Error('Неизвестный тип объекта');
        }
        alert(`${type} создан!`);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка запроса:', error.response || error);
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !itemId) {
      alert('Пожалуйста, войдите в систему или выберите объект');
      navigation.navigate('Login');
      return;
    }
    try {
      setIsLoading(true);
      switch (type) {
        case 'restaurant': await api.deleteRestaurant(itemId); break;
        case 'clothing': await api.deleteClothing(itemId); break;
        case 'transport': await api.deleteTransport(itemId); break;
        case 'tamada': await api.deleteTamada(itemId); break;
        case 'program': await api.deleteProgram(itemId); break;
        case 'traditionalGift': await api.deleteTraditionalGift(itemId); break;
        case 'flowers': await api.deleteFlowers(itemId); break;
        case 'cake': await api.deleteCakes(itemId); break;
        case 'alcohol': await api.deleteAlcohol(itemId); break;
        case 'goods': await api.deleteGoodsById(itemId); break;
        case 'jewelry': await api.deleteJewelry(itemId); break;
        default: throw new Error('Неизвестный тип объекта');
      }
      alert(`${type} удалён!`);
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка удаления:', error.response || error);
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const renderMediaSection = () => {
    if (loadingFiles) {
      return <ActivityIndicator size="small" color="#0000ff" />;
    }
    if (errorFiles) {
      return <Text style={styles.errorText}>{errorFiles}</Text>;
    }

    return (
      <View style={styles.mediaSection}>
        <Text style={styles.inputLabel}>Фотографии</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {files.map(item => (
            <View key={item.id} style={styles.carouselItem}>
              <Image source={{ uri: `${BASE_URL}/${item.path}` }} style={styles.media} />
              <TouchableOpacity onPress={() => handleDeleteFile(item.id)} style={styles.deleteIcon}>
                <Icon name="delete" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedFiles.map(item => (
            <View key={item.uri} style={styles.carouselItem}>
              <Image source={{ uri: item.uri }} style={styles.media} />
              <TouchableOpacity onPress={() => removeFile(item.uri)} style={styles.deleteIcon}>
                <Icon name="remove-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={pickFile} style={styles.addButton}>
            <Icon name="add-a-photo" size={24} color="#374151" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderForm = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Загрузка...</Text>;
    }

    switch (type) {
      case 'restaurant':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название:</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Название"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вместимость:</Text>
              <TextInput
                style={styles.input}
                value={form.capacity}
                onChangeText={(text) => handleChange('capacity', text)}
                keyboardType="numeric"
                placeholder="Вместимость"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Кухня:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, cuisine: true })}
              >
                <Text style={styles.cuisineText}>{form.cuisine || 'Выберите кухню'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.cuisine}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, cuisine: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите кухню</Text>
                    <Picker
                      selectedValue={form.cuisine}
                      onValueChange={(value) => {
                        handleChange('cuisine', value);
                        setModalVisible({ ...modalVisible, cuisine: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите кухню" value="" />
                      {cuisineOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, cuisine: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Средний чек:</Text>
              <TextInput
                style={styles.input}
                value={form.averageCost}
                onChangeText={(text) => handleChange('averageCost', text)}
                keyboardType="numeric"
                placeholder="Средний чек"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Город:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, city: true })}
              >
                <Text style={styles.cuisineText}>{form.city || 'Выберите город'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.city}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, city: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите город</Text>
                    <Picker
                      selectedValue={form.city}
                      onValueChange={(value) => {
                        handleChange('city', value);
                        setModalVisible({ ...modalVisible, city: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите город" value="" />
                      {cityOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, city: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </>
        );
      case 'clothing':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование магазина:</Text>
              <TextInput
                style={styles.input}
                value={form.storeName}
                onChangeText={(text) => handleChange('storeName', text)}
                placeholder="Наименование магазина"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Пол:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, gender: true })}
              >
                <Text style={styles.cuisineText}>{form.gender || 'Выберите пол'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.gender}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, gender: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите пол</Text>
                    <Picker
                      selectedValue={form.gender}
                      onValueChange={(value) => {
                        handleChange('gender', value);
                        setModalVisible({ ...modalVisible, gender: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите пол" value="" />
                      {genderOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, gender: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                value={form.itemName}
                onChangeText={(text) => handleChange('itemName', text)}
                placeholder="Наименование товара"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'transport':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                value={form.salonName}
                onChangeText={(text) => handleChange('salonName', text)}
                placeholder="Наименование салона"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование авто:</Text>
              <TextInput
                style={styles.input}
                value={form.carName}
                onChangeText={(text) => handleChange('carName', text)}
                placeholder="Наименование авто"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Цвет:</Text>
              <TextInput
                style={styles.input}
                value={form.color}
                onChangeText={(text) => handleChange('color', text)}
                placeholder="Цвет"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Марка:</Text>
              <TextInput
                style={styles.input}
                value={form.brand}
                onChangeText={(text) => handleChange('brand', text)}
                placeholder="Марка"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'tamada':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Имя/Псевдоним:</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Имя/Псевдоним"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>О себе:</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={form.portfolio}
                onChangeText={(text) => handleChange('portfolio', text)}
                multiline
                placeholder="О себе"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Город:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, city: true })}
              >
                <Text style={styles.cuisineText}>{form.city || 'Выберите город'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.city}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, city: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите город</Text>
                    <Picker
                      selectedValue={form.city}
                      onValueChange={(value) => {
                        handleChange('city', value);
                        setModalVisible({ ...modalVisible, city: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите город" value="" />
                      {cityOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, city: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </>
        );
      case 'program':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название команды:</Text>
              <TextInput
                style={styles.input}
                value={form.teamName}
                onChangeText={(text) => handleChange('teamName', text)}
                placeholder="Название команды"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид:</Text>
              <TextInput
                style={styles.input}
                value={form.type}
                onChangeText={(text) => handleChange('type', text)}
                placeholder="Вид"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Город:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, city: true })}
              >
                <Text style={styles.cuisineText}>{form.city || 'Выберите город'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.city}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, city: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите город</Text>
                    <Picker
                      selectedValue={form.city}
                      onValueChange={(value) => {
                        handleChange('city', value);
                        setModalVisible({ ...modalVisible, city: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите город" value="" />
                      {cityOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, city: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </>
        );
      case 'traditionalGift':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                value={form.salonName}
                onChangeText={(text) => handleChange('salonName', text)}
                placeholder="Наименование салона"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                value={form.itemName}
                onChangeText={(text) => handleChange('itemName', text)}
                placeholder="Наименование товара"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид:</Text>
              <TextInput
                style={styles.input}
                value={form.type}
                onChangeText={(text) => handleChange('type', text)}
                placeholder="Вид"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'flowers':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                value={form.salonName}
                onChangeText={(text) => handleChange('salonName', text)}
                placeholder="Наименование салона"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование цветов:</Text>
              <TextInput
                style={styles.input}
                value={form.flowerName}
                onChangeText={(text) => handleChange('flowerName', text)}
                placeholder="Наименование цветов"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид цветов:</Text>
              <TextInput
                style={styles.input}
                value={form.flowerType}
                onChangeText={(text) => handleChange('flowerType', text)}
                placeholder="Вид цветов"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'cake':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Наименование салона"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид торта:</Text>
              <TextInput
                style={styles.input}
                value={form.cakeType}
                onChangeText={(text) => handleChange('cakeType', text)}
                placeholder="Вид торта"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'alcohol':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                value={form.salonName}
                onChangeText={(text) => handleChange('salonName', text)}
                placeholder="Наименование салона"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование:</Text>
              <TextInput
                style={styles.input}
                value={form.alcoholName}
                onChangeText={(text) => handleChange('alcoholName', text)}
                placeholder="Наименование"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Категория:</Text>
              <TextInput
                style={styles.input}
                value={form.category}
                onChangeText={(text) => handleChange('category', text)}
                placeholder="Категория"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      case 'goods':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Категория:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, category: true })}
              >
                <Text style={styles.cuisineText}>
                  {form.category || 'Выберите категорию'}
                </Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.category}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, category: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите категорию</Text>
                    <Picker
                      selectedValue={form.category}
                      onValueChange={(value) => {
                        handleChange('category', value);
                        setModalVisible({ ...modalVisible, category: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите категорию" value="" />
                      {categoryOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, category: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название товара:</Text>
              <TextInput
                style={styles.input}
                value={form.item_name}
                onChangeText={(text) => handleChange('item_name', text)}
                placeholder="Название товара"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Описание:</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={form.description}
                onChangeText={(text) => handleChange('description', text)}
                multiline
                placeholder="Описание"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость (₸):</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => {
                  const filteredValue = text.replace(/[^0-9.]/g, '');
                  handleChange('cost', filteredValue);
                }}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес магазина:</Text>
              <TextInput
                style={styles.input}
                value={form.specs?.address || ''}
                onChangeText={(text) => handleChange('specs', { address: text })}
                placeholder="Адрес магазина"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.specs?.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название магазина:</Text>
              <TextInput
                style={styles.input}
                value={form.specs?.storeName || ''}
                onChangeText={(text) => handleChange('specs', { storeName: text })}
                placeholder="Название магазина"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ссылка на товар:</Text>
              <TextInput
                style={styles.input}
                value={form.specs?.goodLink || ''}
                onChangeText={(text) => handleChange('specs', { goodLink: text })}
                placeholder="Ссылка на товар"
              />
            </View>

          </>
        );
      case 'jewelry':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование магазина:</Text>
              <TextInput
                style={styles.input}
                value={form.storeName}
                onChangeText={(text) => handleChange('storeName', text)}
                placeholder="Наименование магазина"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(text) => handleChange('address', text)}
                placeholder="Адрес"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', formatPhoneNumber(text))}
                keyboardType="phone-pad"
                maxLength={18}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, district: true })}
              >
                <Text style={styles.cuisineText}>{form.district || 'Выберите район'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.district}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, district: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите район</Text>
                    <Picker
                      selectedValue={form.district}
                      onValueChange={(value) => {
                        handleChange('district', value);
                        setModalVisible({ ...modalVisible, district: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите район" value="" />
                      {districtOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, district: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                value={form.itemName}
                onChangeText={(text) => handleChange('itemName', text)}
                placeholder="Наименование товара"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Материал:</Text>
              <TextInput
                style={styles.input}
                value={form.material}
                onChangeText={(text) => handleChange('material', text)}
                placeholder="Материал"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Тип:</Text>
              <TextInput
                style={styles.input}
                value={form.type}
                onChangeText={(text) => handleChange('type', text)}
                placeholder="Тип"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => handleChange('cost', text)}
                keyboardType="numeric"
                placeholder="Стоимость"
              />
            </View>
          </>
        );
      default:
        return <Text style={styles.noAuthText}>Неизвестный тип объекта. Выберите объект для редактирования.</Text>;
    }
  };

  if (!token) {
    return (
      <View style={styles.noAuthContainer}>
        <Text style={styles.noAuthText}>Пожалуйста, войдите в систему, чтобы продолжить</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Детали" />
      </Appbar.Header>
      <View style={styles.header}>
        <Text style={styles.title}>
          {itemId ? `Редактировать ${type}` : `Создать ${type || 'объект'}`}
        </Text>
      </View>
      <View style={styles.formContainer}>
        {renderMediaSection()}
        {renderForm()}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Сохранение...' : 'Сохранить'}</Text>
        </TouchableOpacity>
        {itemId && (
          <TouchableOpacity
            style={[styles.deleteButton, isLoading && styles.disabledButton]}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Удаление...' : 'Удалить'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { marginBottom: 0 ,backgroundColor: '#F3F4F6'},
  title: { fontSize: 24, fontWeight: 'bold', color: '#F3F4F6', textAlign: 'center' },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputContainer: { marginBottom: 12 },
  inputLabel: { fontSize: 16, color: '#4B5563', marginBottom: 4 },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    color: '#374151',
  },
  cuisineButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
  },
  cuisineText: { fontSize: 16, color: '#374151' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalPicker: { height: 150, color: '#374151' },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  buttonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  noAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  noAuthText: { fontSize: 18, color: '#1F2937', textAlign: 'center', marginBottom: 20 },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  mediaSection: {
    marginBottom: 16,
  },
  carouselItem: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noFilesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  addButton: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});