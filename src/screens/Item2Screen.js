
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Modal, FlatList, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#007AFF',
  secondary: '#FF9500',
  textPrimary: '#1C2526',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
  border: '#E5E7EB',
  error: '#EF4444',
  label: '#FFFFFF',
};

export default function Item2Screen({ navigation }) {
  const [selectedItem, setSelectedItem] = useState('');
  const [isItemModalVisible, setItemModalVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const route = useRoute();
  const [formDataId, setFormDataId] = useState('');
  const { user, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  const items = [
    'Ресторан', 'Одежда', 'Транспорт', 'Тамада', 'Программа',
    'Традиционные подарки', 'Цветы', 'Торты', 'Алкоголь', 'Товары', 'Ювелирные изделия',
    // 'Аренда технического оборудования', 'Типография',
  ];

  const entityTypeMap = {
    'Ресторан': 'restaurant',
    'Одежда': 'clothing',
    'Транспорт': 'transport',
    'Тамада': 'tamada',
    'Программа': 'program',
    'Традиционные подарки': 'traditionalgift',
    'Цветы': 'flowers',
    'Торты': 'cake',
    'Алкоголь': 'alcohol',
    'Товары': 'goods',
    'Ювелирные изделия': 'jewelry',
    'Аренда технического оборудования': 'technical-equipment-rental',
    'Типография': 'typography',
  };

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
    'Ювелирные изделия',
    'Аренда технического оборудования',
     'Типография'

  ];
  const cuisineOptions = ['Русская', 'Итальянская', 'Азиатская', 'Французская', 'Американская'];
  const districtOptions = ['Медеуский', 'Бостандыкский', 'Алмалинский', 'Ауэзовский', 'Наурызбайский', 'Алатауский', 'Жетысуйский', 'За пределами Алматы'];
  const genderOptions = ['мужской', 'женский'];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    handleInputChange('phone', formattedPhone);
  };

  const handleSubmitEditing = () => {
    // Keyboard.dismiss();
  };

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
    const entityTypeLower = entityTypeMap[entityType];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: file.uri.split('/').pop(),
      });

      try {
        await axios.post(
          `${BASE_URL}/api/${entityTypeLower}/${entityId}/files`,
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

  const getEntityId = (response) => {
    console.log('response= ',response.data)
    return response.data.id || response.data.data?.id || null;
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Ошибка', 'Пожалуйста, войдите в систему');
      navigation.navigate('Login');
      return;
    }

    if (!selectedItem) {
      Alert.alert('Ошибка', 'Выберите тип объекта');
      return;
    }

    try {
      setIsLoading(true);
      let response;
      let entityId;

      const entityTypeLower = entityTypeMap[selectedItem];

      switch (selectedItem) {
        case 'Ресторан':
          if (!formData.name || !formData.capacity) {
            throw new Error('Заполните обязательные поля: Название и Вместимость');
          }
          response = await api.createRestaurant({
            name: formData.name,
            capacity: formData.capacity,
            cuisine: formData.cuisine || '',
            averageCost: formData.averageCost || '',
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            supplier_id: user.id,
          });
          console.log('API response for Restaurant:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Одежда':
          if (!formData.storeName || !formData.itemName) {
            throw new Error('Заполните обязательные поля: Наименование магазина и Наименование товара');
          }
          response = await api.createClothing({
            storeName: formData.storeName,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            gender: formData.gender || '',
            itemName: formData.itemName,
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Clothing:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Транспорт':
          if (!formData.salonName || !formData.carName) {
            throw new Error('Заполните обязательные поля: Наименование салона и Наименование авто');
          }
          response = await api.createTransport({
            salonName: formData.salonName,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            carName: formData.carName,
            color: formData.color || '',
            brand: formData.brand || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Transport:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Тамада':
          if (!formData.name) {
            throw new Error('Заполните обязательное поле: Имя/Псевдоним');
          }
          response = await api.createTamada({
            name: formData.name,
            portfolio: formData.portfolio || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Tamada:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Программа':
          if (!formData.teamName) {
            throw new Error('Заполните обязательное поле: Название команды');
          }
          response = await api.createProgram({
            teamName: formData.teamName,
            cost: formData.cost || '',
            type: formData.type || '',
            supplier_id: user.id,
          });
          console.log('API response for Program:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Традиционные подарки':
          if (!formData.salonName || !formData.itemName) {
            throw new Error('Заполните обязательные поля: Наименование салона и Наименование товара');
          }
          response = await api.createTraditionalGift({
            salonName: formData.salonName,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            itemName: formData.itemName,
            type: formData.type || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Traditional Gift:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Цветы':
          if (!formData.salonName || !formData.flowerName) {
            throw new Error('Заполните обязательные поля: Наименование салона и Наименование цветов');
          }
          response = await api.createFlowers({
            salonName: formData.salonName,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            flowerName: formData.flowerName,
            flowerType: formData.flowerType || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Flowers:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Торты':
          if (!formData.name) {
            throw new Error('Заполните обязательное поле: Наименование салона');
          }
          response = await api.createCakes({
            name: formData.name,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            cakeType: formData.cakeType || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Cakes:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Алкоголь':
          if (!formData.alcoholName || !formData.category) {
            throw new Error('Заполните обязательные поля: Наименование и Категория');
          }
          response = await api.createAlcohol({
            salonName: formData.salonName || '',
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            alcoholName: formData.alcoholName,
            category: formData.category,
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Alcohol:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        case 'Товары':
          if (!formData.category || !formData.item_name) {
            throw new Error('Заполните обязательные поля: Категория и Название товара');
          }
          response = await api.createGoods({
            category: formData.category,
            item_name: formData.item_name,
            description: formData.description || '',
            cost: formData.cost || '',
            specs: formData.specs || {},
            supplier_id: user.id,
          });
          console.log('API response for Goods:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          setFormDataId(entityId);
          break;

        case 'Ювелирные изделия':
          if (!formData.storeName || !formData.itemName) {
            throw new Error('Заполните обязательные поля: Наименование магазина и Наименование товара');
          }
          response = await api.createJewelry({
            storeName: formData.storeName,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            itemName: formData.itemName,
            material: formData.material || '',
            type: formData.type || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          console.log('API response for Jewelry:', response.data);
          entityId = getEntityId(response);
          if (!entityId) throw new Error('Не удалось получить ID объекта');
          break;

        // case 'Аренда технического оборудования':
        //   if (!formData.companyName) {
        //     throw new Error('Заполните обязательное поле: Название компании');
        //   }
        //   const trimmedLink = formData.link ? formData.link.trim() : '';
        //   response = await api.createTechnicalEquipmentRental({
        //     companyName: formData.companyName,
        //     phone: formData.phone || '',
        //     link: trimmedLink,
        //     supplier_id: user.id,
        //   });
        //   console.log('API response for Technical Equipment Rental:', response.data);
        //   entityId = getEntityId(response);
        //   if (!entityId) throw new Error('Не удалось получить ID объекта');
        //   break;

        // case 'Типография':
        //   if (!formData.companyName) {
        //     throw new Error('Заполните обязательное поле: Название компании');
        //   }
        //   const trimmedTypographyLink = formData.link ? formData.link.trim() : '';
        //   response = await api.createTypography({
        //     companyName: formData.companyName,
        //     phone: formData.phone || '',
        //     link: trimmedTypographyLink,
        //     supplier_id: user.id,
        //   });
        //   console.log('API response for Typography:', response.data);
        //   entityId = getEntityId(response);
        //   if (!entityId) throw new Error('Не удалось получить ID объекта');
        //   break;

        default:
          throw new Error('Тип объекта не поддерживается для создания');
      }

      if (selectedFiles.length > 0) {
        await uploadFiles(selectedItem, entityId);
      }

      Alert.alert('Успех', `${selectedItem} успешно создан${selectedFiles.length > 0 ? ' с файлами' : ''}!`);
      setFormData({});
      setSelectedFiles([]);
      navigation.goBack();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Ошибка', error.message || error.response?.data?.error || 'Не удалось создать объект');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.fileItem}>
      <Image source={{ uri: item.uri }} style={styles.filePreview} />
      <TouchableOpacity onPress={() => removeFile(item.uri)} style={styles.removeButton}>
        <Icon name="delete" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderItemType = ({ item }) => {
    console.log('Rendering item:', item);
    return (
      <TouchableOpacity
        style={styles.itemTypeButton}
        onPress={() => {
          setSelectedItem(item);
          setItemModalVisible(false);
          setFormData({});
        }}
      >
        <Icon name={getIconForItem(item)} size={24} color={COLORS.primary} style={styles.itemTypeIcon} />
        <Text style={styles.itemTypeText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderOption = (option, field, setModalVisible) => (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => {
        handleInputChange(field, option);
        setModalVisible(false);
      }}
    >
      <Text style={styles.optionText}>{option}</Text>
    </TouchableOpacity>
  );

  const getIconForItem = (item) => {
    switch (item) {
      case 'Ресторан': return 'restaurant';
      case 'Одежда': return 'checkroom';
      case 'Транспорт': return 'directions-car';
      case 'Тамада': return 'mic';
      case 'Программа': return 'event';
      case 'Традиционные подарки': return 'card-giftcard';
      case 'Цветы': return 'local-florist';
      case 'Торты': return 'cake';
      case 'Алкоголь': return 'local-bar';
      case 'Товары': return 'shopping-bag';
      case 'Ювелирные изделия': return 'diamond';
      case 'Аренда технического оборудования': return 'settings';
      case 'Типография': return 'print';
      default: return 'category';
    }
  };

  const renderForm = () => {
    switch (selectedItem) {
      case 'Ресторан':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название:</Text>
              <TextInput
                style={styles.input}
                placeholder="Название"
                value={formData.name || ''}
                onChangeText={(value) => handleInputChange('name', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вместимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вместимость"
                value={formData.capacity || ''}
                onChangeText={(value) => handleInputChange('capacity', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Кухня:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.selectText}>{formData.cuisine || 'Выберите кухню'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите кухню</Text>
                  <ScrollView style={styles.optionList}>
                    {cuisineOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'cuisine', setModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Средний чек:</Text>
              <TextInput
                style={styles.input}
                placeholder="Средний чек"
                value={formData.averageCost || ''}
                onChangeText={(value) => handleInputChange('averageCost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        );
      case 'Одежда':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование магазина:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование магазина"
                value={formData.storeName || ''}
                onChangeText={(value) => handleInputChange('storeName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Пол:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setGenderModalVisible(true)}>
                <Text style={styles.selectText}>{formData.gender || 'Выберите пол'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={genderModalVisible} transparent={true} animationType="fade" onRequestClose={() => setGenderModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите пол</Text>
                  <ScrollView style={styles.optionList}>
                    {genderOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'gender', setGenderModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setGenderModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование товара"
                value={formData.itemName || ''}
                onChangeText={(value) => handleInputChange('itemName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Транспорт':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование салона"
                value={formData.salonName || ''}
                onChangeText={(value) => handleInputChange('salonName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование авто:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование авто"
                value={formData.carName || ''}
                onChangeText={(value) => handleInputChange('carName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Цвет:</Text>
              <TextInput
                style={styles.input}
                placeholder="Цвет"
                value={formData.color || ''}
                onChangeText={(value) => handleInputChange('color', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Марка:</Text>
              <TextInput
                style={styles.input}
                placeholder="Марка"
                value={formData.brand || ''}
                onChangeText={(value) => handleInputChange('brand', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Тамада':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Имя/Псевдоним:</Text>
              <TextInput
                style={styles.input}
                placeholder="Имя/Псевдоним"
                value={formData.name || ''}
                onChangeText={(value) => handleInputChange('name', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>О себе:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вставьте ссылку"
                value={formData.portfolio || ''}
                onChangeText={(value) => handleInputChange('portfolio', value)}
                multiline
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Программа':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название команды:</Text>
              <TextInput
                style={styles.input}
                placeholder="Название команды"
                value={formData.teamName || ''}
                onChangeText={(value) => handleInputChange('teamName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вид"
                value={formData.type || ''}
                onChangeText={(value) => handleInputChange('type', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Традиционные подарки':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование салона"
                value={formData.salonName || ''}
                onChangeText={(value) => handleInputChange('salonName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование товара"
                value={formData.itemName || ''}
                onChangeText={(value) => handleInputChange('itemName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вид"
                value={formData.type || ''}
                onChangeText={(value) => handleInputChange('type', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Цветы':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование салона"
                value={formData.salonName || ''}
                onChangeText={(value) => handleInputChange('salonName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование цветов:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование цветов"
                value={formData.flowerName || ''}
                onChangeText={(value) => handleInputChange('flowerName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид цветов:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вид цветов"
                value={formData.flowerType || ''}
                onChangeText={(value) => handleInputChange('flowerType', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Торты':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование салона"
                value={formData.name || ''}
                onChangeText={(value) => handleInputChange('name', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Вид торта:</Text>
              <TextInput
                style={styles.input}
                placeholder="Вид торта"
                value={formData.cakeType || ''}
                onChangeText={(value) => handleInputChange('cakeType', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Алкоголь':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование салона:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование салона"
                value={formData.salonName || ''}
                onChangeText={(value) => handleInputChange('salonName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование"
                value={formData.alcoholName || ''}
                onChangeText={(value) => handleInputChange('alcoholName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Категория:</Text>
              <TextInput
                style={styles.input}
                placeholder="Категория"
                value={formData.category || ''}
                onChangeText={(value) => handleInputChange('category', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      case 'Товары':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Категория:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setCategoryModalVisible(true)}>
                <Text style={styles.selectText}>{formData.category || 'Выберите категорию'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={categoryModalVisible} transparent={true} animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите категорию</Text>
                  <ScrollView style={styles.optionList}>
                    {categoryOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'category', setCategoryModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setCategoryModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название товара:</Text>
              <TextInput
                style={styles.input}
                placeholder="Название товара"
                value={formData.item_name || ''}
                onChangeText={(value) => handleInputChange('item_name', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Описание:</Text>
              <TextInput
                style={styles.input}
                placeholder="Описание"
                value={formData.description || ''}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость в тенге"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес магазина:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес магазина"
                value={formData.specs?.address || ''}
                onChangeText={(value) =>
                  handleInputChange('specs', { ...formData.specs, address: value })
                }
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="Телефон (например, +7 (777) 123-45-67)"
                value={formData.specs?.phone || ''}
                onChangeText={(value) =>
                  handleInputChange('specs', { ...formData.specs, phone: value })
                }
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Название магазина:</Text>
              <TextInput
                style={styles.input}
                placeholder="Название магазина"
                value={formData.specs?.storeName || ''}
                onChangeText={(value) =>
                  handleInputChange('specs', { ...formData.specs, storeName: value })
                }
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );

      case 'Ювелирные изделия':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование магазина:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование магазина"
                value={formData.storeName || ''}
                onChangeText={(value) => handleInputChange('storeName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Адрес:</Text>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Телефон:</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (XXX) XXX-XX-XX"
                value={formData.phone || ''}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={18}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Район:</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setDistrictModalVisible(true)}>
                <Text style={styles.selectText}>{formData.district || 'Выберите район'}</Text>
                <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Modal visible={districtModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDistrictModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Выберите район</Text>
                  <ScrollView style={styles.optionList}>
                    {districtOptions.map((option) => (
                      <View key={option}>
                        {renderOption(option, 'district', setDistrictModalVisible)}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Наименование товара:</Text>
              <TextInput
                style={styles.input}
                placeholder="Наименование товара"
                value={formData.itemName || ''}
                onChangeText={(value) => handleInputChange('itemName', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Материал:</Text>
              <TextInput
                style={styles.input}
                placeholder="Материал"
                value={formData.material || ''}
                onChangeText={(value) => handleInputChange('material', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Тип:</Text>
              <TextInput
                style={styles.input}
                placeholder="Тип"
                value={formData.type || ''}
                onChangeText={(value) => handleInputChange('type', value)}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Стоимость:</Text>
              <TextInput
                style={styles.input}
                placeholder="Стоимость"
                value={formData.cost || ''}
                onChangeText={(value) => handleInputChange('cost', value)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );

      // case 'Аренда технического оборудования':
      //   return (
      //     <>
      //       <View style={styles.inputContainer}>
      //         <Text style={styles.inputLabel}>Название компании:</Text>
      //         <TextInput
      //           style={styles.input}
      //           placeholder="Название компании"
      //           value={formData.companyName || ''}
      //           onChangeText={(value) => handleInputChange('companyName', value)}
      //           returnKeyType="done"
      //           onSubmitEditing={handleSubmitEditing}
      //         />
      //       </View>
      //       <View style={styles.inputContainer}>
      //         <Text style={styles.inputLabel}>Телефон:</Text>
      //         <TextInput
      //           style={styles.input}
      //           placeholder="+7 (XXX) XXX-XX-XX"
      //           value={formData.phone || ''}
      //           onChangeText={handlePhoneChange}
      //           keyboardType="phone-pad"
      //           maxLength={18}
      //           returnKeyType="done"
      //           onSubmitEditing={handleSubmitEditing}
      //         />
      //       </View>
      //       <View style={styles.inputContainer}>
      //         <Text style={styles.inputLabel}>Ссылка:</Text>
      //         <TextInput
      //           style={styles.input}
      //           placeholder="https://example.com"
      //           value={formData.link || ''}
      //           onChangeText={(value) => handleInputChange('link', value)}
      //           keyboardType="url"
      //           returnKeyType="done"
      //           onSubmitEditing={handleSubmitEditing}
      //         />
      //       </View>
      //     </>
      //   );
      // case 'Типография':
        // return (
        //   <>
        //     <View style={styles.inputContainer}>
        //       <Text style={styles.inputLabel}>Название компании:</Text>
        //       <TextInput
        //         style={styles.input}
        //         placeholder="Название компании"
        //         value={formData.companyName || ''}
        //         onChangeText={(value) => handleInputChange('companyName', value)}
        //         returnKeyType="done"
        //         onSubmitEditing={handleSubmitEditing}
        //       />
        //     </View>
        //     <View style={styles.inputContainer}>
        //       <Text style={styles.inputLabel}>Телефон:</Text>
        //       <TextInput
        //         style={styles.input}
        //         placeholder="+7 (XXX) XXX-XX-XX"
        //         value={formData.phone || ''}
        //         onChangeText={handlePhoneChange}
        //         keyboardType="phone-pad"
        //         maxLength={18}
        //         returnKeyType="done"
        //         onSubmitEditing={handleSubmitEditing}
        //       />
        //     </View>
        //     <View style={styles.inputContainer}>
        //       <Text style={styles.inputLabel}>Ссылка:</Text>
        //       <TextInput
        //         style={styles.input}
        //         placeholder="https://example.com"
        //         value={formData.link || ''}
        //         onChangeText={(value) => handleInputChange('link', value)}
        //         keyboardType="url"
        //         returnKeyType="done"
        //         onSubmitEditing={handleSubmitEditing}
        //       />
        //     </View>
        //   </>
        // );
      default:
        return <Text style={styles.label}>Выберите тип объекта для создания</Text>;
    }
  };

  console.log('Items for picker:', items);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Создать объект</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Выберите тип объекта:</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setItemModalVisible(true)}>
            <Text style={styles.selectText}>{selectedItem || 'Выберите'}</Text>
            <Icon name="arrow-drop-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Modal visible={isItemModalVisible} transparent={true} animationType="fade" onRequestClose={() => setItemModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Выберите тип объекта</Text>
                <FlatList
                  data={items}
                  renderItem={renderItemType}
                  keyExtractor={(item) => item}
                  style={{ flexGrow: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setItemModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        {renderForm()}
        {selectedItem && (
          <>
            <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
              <Text style={styles.uploadButtonText}>Добавить фото/видео</Text>
            </TouchableOpacity>
            {selectedFiles.length > 0 && (
              <FlatList
                data={selectedFiles}
                renderItem={renderFileItem}
                keyExtractor={(item) => item.uri}
                horizontal
                style={styles.fileList}
              />
            )}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>{isLoading ? 'Создание...' : 'Создать'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginVertical: 20 },
  pickerContainer: { marginHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectText: { fontSize: 16, color: COLORS.textPrimary },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.overlay },
  modalContent: { width: '90%', maxHeight: '90%', backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 16 },
  itemTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 48,
  },
  itemTypeIcon: { marginRight: 12 },
  itemTypeText: { fontSize: 18, color: COLORS.textPrimary, flexShrink: 1, flexWrap: 'wrap' },
  optionButton: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionText: { fontSize: 16, textAlign: 'center', color: COLORS.textPrimary },
  optionList: { maxHeight: 200 },
  closeButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  closeButtonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  inputContainer: { marginHorizontal: 20, marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  uploadButton: { backgroundColor: COLORS.secondary, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 20, marginVertical: 10 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fileList: { marginVertical: 10, paddingHorizontal: 20 },
  fileItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  filePreview: { width: 60, height: 60, borderRadius: 8 },
  removeButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 },
  submitButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginHorizontal: 20, marginVertical: 20 },
  disabledButton: { backgroundColor: '#A5B4FC' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 1 },
});