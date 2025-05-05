// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal, FlatList, Image, ScrollView } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// import api from '../api/api';
// import { useRoute } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function Item2Screen({ navigation }) {
//   const [selectedItem, setSelectedItem] = useState('');
//   const [isPickerVisible, setPickerVisible] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [modalVisible, setModalVisible] = useState(false);
//   const [districtModalVisible, setDistrictModalVisible] = useState(false);
//   const [genderModalVisible, setGenderModalVisible] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const route = useRoute();
//   const [categoryModalVisible, setCategoryModalVisible] = useState(false); 
//   const restaurantId = route.params?.id;
//  const [formDataId, setFormDataId] = useState(''); // Исправлено имя
  
  
//   const { user, token } = useSelector((state) => state.auth);
//   const [isLoading, setIsLoading] = useState(false);
//    const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL; 
//  // const BASE_URL = 'https://26d8-85-117-96-82.ngrok-free.app';

//   // Обновлённый массив с русскими названиями
//   const items = [
//     'Ресторан', 'Одежда', 'Транспорт', 'Тамада', 'Программа',
//     'Традиционные подарки', 'Цветы', 'Торты', 'Алкоголь', 'Товары',
//   ];


//   // Маппинг русских названий на английские для URL и API
//   const entityTypeMap = {
//     'Ресторан': 'restaurant',
//     'Одежда': 'clothing',
//     'Транспорт': 'transport',
//     'Тамада': 'tamada',
//     'Программа': 'program',
//     'Традиционные подарки': 'traditionalgift',
//     'Цветы': 'flowers',
//     'Торты': 'cake',
//     'Алкоголь': 'alcohol',
//     'Товары': 'goods',
//   };

//     const categoryOptions = [
//     'Деньги',
//     'Бытовая техника',
//     'Посуда и кухонные принадлежности',
//     'Текстиль для дома',
//     'Мебель и элементы интерьера',
//     'Подарки для отдыха и путешествий',
//     'Электроника и гаджеты',
//     'Подарки для хобби и увлечений',
//     'Символические и романтические подарки',
//     'Сертификаты и подписки',
//     'Алкоголь и гастрономия',
//     'Традиционные подарки',
//   ];
//   const cuisineOptions = ['Русская', 'Итальянская', 'Азиатская', 'Французская', 'Американская'];
//   const districtOptions = ['Медеуский', 'Бостандыкский', 'Алмалинский', 'Ауэзовский', 'Наурызбайский', 'Алатауский', 'Жетысуйский', 'За пределами Алматы'];
//   const genderOptions = ['мужской', 'женский'];

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev,
//        [field]: value }));
//   };

//   const formatPhoneNumber = (input) => {
//     let cleaned = input.replace(/[^\d+]/g, '');
//     if (cleaned.startsWith('+')) cleaned = '+' + cleaned.replace(/\+/g, '');
//     if (!cleaned.startsWith('+7')) cleaned = '+7' + cleaned.replace(/^\+?\d*/g, '');
//     const digits = cleaned.slice(2, 12);
//     let formatted = '+7';
//     if (digits.length > 0) formatted += ' (' + digits.slice(0, 3);
//     if (digits.length > 3) formatted += ') ' + digits.slice(3, 6);
//     if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
//     if (digits.length > 8) formatted += '-' + digits.slice(8, 10);
//     return formatted;
//   };

//   const handlePhoneChange = (text) => {
//     const formattedPhone = formatPhoneNumber(text);
//     handleInputChange('phone', formattedPhone);
//   };

//   const pickFile = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       Alert.alert('Ошибка', 'Требуется разрешение для доступа к галерее');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setSelectedFiles([...selectedFiles, ...result.assets]);
//     }
//   };

//   const removeFile = (uri) => {
//     setSelectedFiles(selectedFiles.filter(file => file.uri !== uri));
//   };

//   const uploadFiles = async (entityType, entityId) => {
//     const entityTypeLower = entityTypeMap[entityType];
//     console.log('6 entityTypeLower= ', entityTypeLower);
//     console.log('7 Starting file upload for:', entityTypeLower, 'ID:', entityId);

//     for (const file of selectedFiles) {
//       console.log('File name:', file.uri.split('/').pop(), 'File URI:', file.uri, 'Type:', file.type);

//       const formData = new FormData();
//       formData.append('file', {
//         uri: file.uri,
//         type: file.type === 'image' ? 'image/jpeg' : 'video/mp4',
//         name: file.uri.split('/').pop(),
//       });

//       console.log('8 formdata', formData);
//       try {
//         const response = await axios.post(
//           `${BASE_URL}/api/${entityTypeLower}/${entityId}/files`,
//           formData, // Исправлено
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//         );
//         console.log(`File ${file.uri} uploaded successfully:`, response.data);
//       } catch (error) {
//         console.error('File upload error:', error.response?.data || error.message);
//         throw new Error('Ошибка загрузки файла');
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     console.log('1 Сохранение стартовало');
//     console.log('2 User from Redux:', user);
//     console.log('3 User ID:', user.id, 'Type:', typeof user.id);
//     console.log('4 Token:', token);
//     console.log('5 Selected Item:', selectedItem);
  
//     if (!token) {
//       Alert.alert('Ошибка', 'Пожалуйста, войдите в систему');
//       navigation.navigate('Login');
//       return;
//     }
  
//     if (!selectedItem) {
//       Alert.alert('Ошибка', 'Выберите тип объекта');
//       return;
//     }
  
//     try {
//       setIsLoading(true);
//       let response;
//       let entityId;
  
//       const entityTypeLower = entityTypeMap[selectedItem]; // Преобразуем русское название в английское для URL
  
//       // Собираем данные и отправляем запрос в зависимости от типа объекта
//       switch (selectedItem) {
//         case 'Ресторан':
//           if (!formData.name || !formData.capacity) {
//             throw new Error('Заполните обязательные поля: Название и Вместимость');
//           }
//           const restaurantData = {
//             name: formData.name,
//             capacity: formData.capacity,
//             cuisine: formData.cuisine || '',
//             averageCost: formData.averageCost || '',
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             supplier_id: user.id,
//           };
//           response = await api.createRestaurant(restaurantData);
//           entityId = response.data.id; // Предполагаем, что сервер возвращает id
//           break;
  
//         case 'Одежда':
//           if (!formData.storeName || !formData.itemName) {
//             throw new Error('Заполните обязательные поля: Наименование магазина и Наименование товара');
//           }
//           const clothingData = {
//             storeName: formData.storeName,
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             gender: formData.gender || '',
//             itemName: formData.itemName,
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createClothing(clothingData);
//           entityId = response.data.id;
//           break;
  
//         case 'Транспорт':
//           if (!formData.salonName || !formData.carName) {
//             throw new Error('Заполните обязательные поля: Наименование салона и Наименование авто');
//           }
//           const transportData = {
//             salonName: formData.salonName,
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             carName: formData.carName,
//             color: formData.color || '',
//             brand: formData.brand || '',
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createTransport(transportData);
//           entityId = response.data.id;
//           break;
  
//         case 'Тамада':
//           if (!formData.name) {
//             throw new Error('Заполните обязательное поле: Имя/Псевдоним');
//           }
//           const tamadaData = {
//             name: formData.name,
//             portfolio: formData.portfolio || '',
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createTamada(tamadaData);
//           entityId = response.data.id;
//           break;
  
//         case 'Программа':
//           if (!formData.teamName) {
//             throw new Error('Заполните обязательное поле: Название команды');
//           }
//           const programData = {
//             teamName: formData.teamName,
//             cost: formData.cost || '',
//             type: formData.type || '',
//             supplier_id: user.id,
//           };
//           response = await api.createProgram(programData);
//           entityId = response.data.id;
//           break;
  
//         case 'Традиционные подарки':
//           if (!formData.salonName || !formData.itemName) {
//             throw new Error('Заполните обязательные поля: Наименование салона и Наименование товара');
//           }
//           const traditionalGiftData = {
//             salonName: formData.salonName,
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             itemName: formData.itemName,
//             type: formData.type || '',
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createTraditionalGift(traditionalGiftData);
//           entityId = response.data.id;
//           break;
  
//         case 'Цветы':
//           if (!formData.salonName || !formData.flowerName) {
//             throw new Error('Заполните обязательные поля: Наименование салона и Наименование цветов');
//           }
//           const flowersData = {
//             salonName: formData.salonName,
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             flowerName: formData.flowerName,
//             flowerType: formData.flowerType || '',
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createFlowers(flowersData);
//           entityId = response.data.id;
//           break;
  
//         case 'Торты':
//           if (!formData.name) {
//             throw new Error('Заполните обязательное поле: Наименование салона');
//           }
//           const cakeData = {
//             name: formData.name,
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             cakeType: formData.cakeType || '',
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createCake(cakeData);
//           entityId = response.data.id;
//           break;
  
//         case 'Алкоголь':
//           if (!formData.alcoholName || !formData.category) {
//             throw new Error('Заполните обязательные поля: Наименование и Категория');
//           }
//           const alcoholData = {
//             salonName: formData.salonName || '',
//             address: formData.address || '',
//             phone: formData.phone || '',
//             district: formData.district || '',
//             alcoholName: formData.alcoholName,
//             category: formData.category,
//             cost: formData.cost || '',
//             supplier_id: user.id,
//           };
//           response = await api.createAlcohol(alcoholData);
//           entityId = response.data.id;
//           break;
  
//         case 'Товары':
//           if (!formData.category || !formData.item_name) {
//             throw new Error('Заполните обязательные поля: Категория и Название товара');
//           }
//           const goodsData = {
//             category: formData.category,
//             item_name: formData.item_name,
//             description: formData.description || '',
//             cost: formData.cost || '',
//             specs: formData.specs || {}, // Передаем specs как объект JSON
//             supplier_id: user.id,
//           };
//           response = await api.createGood(goodsData);
//           entityId = response.data.data.id; // Предполагаем структуру ответа для goods
//           setFormDataId(response.data.data.id);
//           break;
  
//         default:
//           throw new Error('Тип объекта не поддерживается для создания');
//       }
  
//       // Загрузка файлов, если они выбраны
//       if (selectedFiles.length > 0) {
//         console.log('Selected Files:', selectedFiles);
//         await uploadFiles(selectedItem, entityId);
//       }
  
//       Alert.alert('Успех', `${selectedItem} успешно создан${selectedFiles.length > 0 ? ' с файлами' : ''}!`);
//       setFormData({});
//       setSelectedFiles([]);
//       navigation.goBack();
//     } catch (error) {
//       console.error('Ошибка:', error.response?.data || error.message);
//       Alert.alert('Ошибка', error.message || error.response?.data?.error || 'Не удалось создать объект');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderFileItem = ({ item }) => (
//     <View style={styles.fileItem}>
//       <Image source={{ uri: item.uri }} style={styles.filePreview} />
//       <TouchableOpacity onPress={() => removeFile(item.uri)} style={styles.removeButton}>
//         <Text style={styles.removeButtonText}>Удалить</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderForm = () => {
//     switch (selectedItem) {
//       case 'Ресторан':
//         return (
//           <>
//             <TextInput style={styles.input} placeholder="Название" value={formData.name || ''} onChangeText={(value) => handleInputChange('name', value)} />
//             <TextInput style={styles.input} placeholder="Вместимость" value={formData.capacity || ''} onChangeText={(value) => handleInputChange('capacity', value)} />
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Кухня:</Text>
//               <TouchableOpacity style={styles.cuisineButton} onPress={() => setModalVisible(true)}>
//                 <Text style={styles.cuisineText}>{formData.cuisine || 'Выберите кухню'}</Text>
//               </TouchableOpacity>
//             </View>
//             <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <Text style={styles.modalTitle}>Выберите кухню</Text>
//                   <Picker selectedValue={formData.cuisine} onValueChange={(value) => { handleInputChange('cuisine', value); setModalVisible(false); }} style={styles.modalPicker}>
//                     <Picker.Item label="Выберите кухню" value="" />
//                     {cuisineOptions.map((option) => <Picker.Item key={option} label={option} value={option} />)}
//                   </Picker>
//                   <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//                     <Text style={styles.closeButtonText}>Закрыть</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Modal>
//             <TextInput style={styles.input} placeholder="Средний чек" value={formData.averageCost || ''} onChangeText={(value) => handleInputChange('averageCost', value)} keyboardType="numeric" />
//             <TextInput style={styles.input} placeholder="Адрес" value={formData.address || ''} onChangeText={(value) => handleInputChange('address', value)} />
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Телефон:</Text>
//               <TextInput style={styles.input} placeholder="+7 (XXX) XXX-XX-XX" value={formData.phone || ''} onChangeText={handlePhoneChange} keyboardType="phone-pad" maxLength={18} />
//             </View>
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Район:</Text>
//               <TouchableOpacity style={styles.cuisineButton} onPress={() => setDistrictModalVisible(true)}>
//                 <Text style={styles.cuisineText}>{formData.district || 'Выберите район'}</Text>
//               </TouchableOpacity>
//             </View>
//             <Modal visible={districtModalVisible} transparent={true} animationType="slide" onRequestClose={() => setDistrictModalVisible(false)}>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <Text style={styles.modalTitle}>Выберите район</Text>
//                   <Picker selectedValue={formData.district} onValueChange={(value) => { handleInputChange('district', value); setDistrictModalVisible(false); }} style={styles.modalPicker}>
//                     <Picker.Item label="Выберите район" value="" />
//                     {districtOptions.map((option) => <Picker.Item key={option} label={option} value={option} />)}
//                   </Picker>
//                   <TouchableOpacity style={styles.closeButton} onPress={() => setDistrictModalVisible(false)}>
//                     <Text style={styles.closeButtonText}>Закрыть</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Modal>
//           </>
//         );
//         case 'Одежда':
//           return (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Наименование магазина"
//                 value={formData.storeName || ''}
//                 onChangeText={(value) => handleInputChange('storeName', value)}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Адрес"
//                 value={formData.address || ''}
//                 onChangeText={(value) => handleInputChange('address', value)}
//               />
//               <View style={styles.inputContainer}>
//                 <Text style={styles.inputLabel}>Телефон:</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="+7 (XXX) XXX-XX-XX"
//                   value={formData.phone || ''}
//                   onChangeText={handlePhoneChange}
//                   keyboardType="phone-pad"
//                   maxLength={18}
//                 />
//               </View>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Район"
//                 value={formData.district || ''}
//                 onChangeText={(value) => handleInputChange('district', value)}
//               />
//               <View style={styles.inputContainer}>
//                 <Text style={styles.inputLabel}>Пол:</Text>
//                 <TouchableOpacity
//                   style={styles.cuisineButton}
//                   onPress={() => setGenderModalVisible(true)}
//                 >
//                   <Text style={styles.cuisineText}>
//                     {formData.gender || 'Выберите пол'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//               <Modal
//                 visible={genderModalVisible}
//                 transparent={true}
//                 animationType="slide"
//                 onRequestClose={() => setGenderModalVisible(false)}
//               >
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.modalContent}>
//                     <Text style={styles.modalTitle}>Выберите пол</Text>
//                     <Picker
//                       selectedValue={formData.gender}
//                       onValueChange={(value) => {
//                         handleInputChange('gender', value);
//                         setGenderModalVisible(false);
//                       }}
//                       style={styles.modalPicker}
//                     >
//                       <Picker.Item label="Выберите пол" value="" />
//                       {genderOptions.map((option) => (
//                         <Picker.Item key={option} label={option} value={option} />
//                       ))}
//                     </Picker>
//                     <TouchableOpacity
//                       style={styles.closeButton}
//                       onPress={() => setGenderModalVisible(false)}
//                     >
//                       <Text style={styles.closeButtonText}>Закрыть</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Наименование товара"
//                 value={formData.itemName || ''}
//                 onChangeText={(value) => handleInputChange('itemName', value)}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Стоимость"
//                 value={formData.cost || ''}
//                 onChangeText={(value) => handleInputChange('cost', value)}
//                 keyboardType="numeric"
//               />
//             </>
//           );
//           case 'Транспорт':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование салона"
//                   value={formData.salonName || ''}
//                   onChangeText={(value) => handleInputChange('salonName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Адрес"
//                   value={formData.address || ''}
//                   onChangeText={(value) => handleInputChange('address', value)}
//                 />
//               <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Телефон:</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="+7 (XXX) XXX-XX-XX"
//                     value={formData.phone || ''}
//                     onChangeText={handlePhoneChange}
//                     keyboardType="phone-pad"
//                     maxLength={18}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Район"
//                   value={formData.district || ''}
//                   onChangeText={(value) => handleInputChange('district', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование авто"
//                   value={formData.carName || ''}
//                   onChangeText={(value) => handleInputChange('carName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Цвет"
//                   value={formData.color || ''}
//                   onChangeText={(value) => handleInputChange('color', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Марка"
//                   value={formData.brand || ''}
//                   onChangeText={(value) => handleInputChange('brand', value)}
//                 />
//                       <TextInput
//                         style={styles.input}
//                         placeholder="Стоимость"
//                         value={formData.cost || ''}
//                         onChangeText={(value) => handleInputChange('cost', value)}
//                         keyboardType="numeric"
//                       />
//               </>
//             );
//           case 'Тамада':
//             return (
//               <>
//                  <TextInput
//                 style={styles.input}
//                 placeholder="Имя/Псевдоним"
//                 value={formData.name || ''}
//                 onChangeText={(value) => handleInputChange('name', value)}
//               />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Портфолио"
//                   value={formData.portfolio || ''}
//                   onChangeText={(value) => handleInputChange('portfolio', value)}
//                   multiline
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//               </>
//             );
//           case 'Программа':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Название команды"
//                   value={formData.teamName || ''}
//                   onChangeText={(value) => handleInputChange('teamName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Вид"
//                   value={formData.type || ''}
//                   onChangeText={(value) => handleInputChange('type', value)}
//                 />
//               </>
//             );
//           case 'Традиционные подарки':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование салона"
//                   value={formData.salonName || ''}
//                   onChangeText={(value) => handleInputChange('salonName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Адрес"
//                   value={formData.address || ''}
//                   onChangeText={(value) => handleInputChange('address', value)}
//                 />
//                  <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Телефон:</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="+7 (XXX) XXX-XX-XX"
//                     value={formData.phone || ''}
//                     onChangeText={handlePhoneChange}
//                     keyboardType="phone-pad"
//                     maxLength={18}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Район"
//                   value={formData.district || ''}
//                   onChangeText={(value) => handleInputChange('district', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование товара"
//                   value={formData.itemName || ''}
//                   onChangeText={(value) => handleInputChange('itemName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Вид"
//                   value={formData.type || ''}
//                   onChangeText={(value) => handleInputChange('type', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//               </>
//             );
//           case 'Цветы':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование салона"
//                   value={formData.salonName || ''}
//                   onChangeText={(value) => handleInputChange('salonName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Адрес"
//                   value={formData.address || ''}
//                   onChangeText={(value) => handleInputChange('address', value)}
//                 />
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Телефон:</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="+7 (XXX) XXX-XX-XX"
//                     value={formData.phone || ''}
//                     onChangeText={handlePhoneChange}
//                     keyboardType="phone-pad"
//                     maxLength={18}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Район"
//                   value={formData.district || ''}
//                   onChangeText={(value) => handleInputChange('district', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование цветов"
//                   value={formData.flowerName || ''}
//                   onChangeText={(value) => handleInputChange('flowerName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Вид цветов"
//                   value={formData.flowerType || ''}
//                   onChangeText={(value) => handleInputChange('flowerType', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//               </>
//             );
//           case 'Торты':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование салона"
//                   value={formData.name || ''}
//                   onChangeText={(value) => handleInputChange('name', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Адрес"
//                   value={formData.address || ''}
//                   onChangeText={(value) => handleInputChange('address', value)}
//                 />
//                  <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Телефон:</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="+7 (XXX) XXX-XX-XX"
//                     value={formData.phone || ''}
//                     onChangeText={handlePhoneChange}
//                     keyboardType="phone-pad"
//                     maxLength={18}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Район"
//                   value={formData.district || ''}
//                   onChangeText={(value) => handleInputChange('district', value)}
//                 />
                
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Вид торта"
//                   value={formData.cakeType || ''}
//                   onChangeText={(value) => handleInputChange('cakeType', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//               </>
//             );
//           case 'Алкоголь':
//             return (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование салона"
//                   value={formData.salonName || ''}
//                   onChangeText={(value) => handleInputChange('salonName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Адрес"
//                   value={formData.address || ''}
//                   onChangeText={(value) => handleInputChange('address', value)}
//                 />
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Телефон:</Text>
//                   <TextInput
//                     style={styles.input}
//                     placeholder="+7 (XXX) XXX-XX-XX"
//                     value={formData.phone || ''}
//                     onChangeText={handlePhoneChange}
//                     keyboardType="phone-pad"
//                     maxLength={18}
//                   />
//                 </View>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Район"
//                   value={formData.district || ''}
//                   onChangeText={(value) => handleInputChange('district', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Наименование"
//                   value={formData.alcoholName || ''}
//                   onChangeText={(value) => handleInputChange('alcoholName', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Категория"
//                   value={formData.category || ''}
//                   onChangeText={(value) => handleInputChange('category', value)}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Стоимость"
//                   value={formData.cost || ''}
//                   onChangeText={(value) => handleInputChange('cost', value)}
//                   keyboardType="numeric"
//                 />
//               </>
//             );
            
          



//                   case 'Товары':
//         return (
//           <>
//           <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Категория:</Text>
//               <TouchableOpacity style={styles.cuisineButton} onPress={() => setCategoryModalVisible(true)}>
//                 <Text style={styles.cuisineText}>{formData.category || 'Выберите категорию'}</Text>
//               </TouchableOpacity>
//             </View>
//             <Modal visible={categoryModalVisible} transparent={true} animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   <Text style={styles.modalTitle}>Выберите категорию</Text>
//                   <Picker
//                     selectedValue={formData.category}
//                     onValueChange={(value) => {
//                       handleInputChange('category', value);
//                       setCategoryModalVisible(false);
//                     }}
//                     style={styles.modalPicker}
//                   >
//                     <Picker.Item label="Выберите категорию" value="" />
//                     {categoryOptions.map((option) => (
//                       <Picker.Item key={option} label={option} value={option} />
//                     ))}
//                   </Picker>
//                   <TouchableOpacity style={styles.closeButton} onPress={() => setCategoryModalVisible(false)}>
//                     <Text style={styles.closeButtonText}>Закрыть</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Modal>
//             <TextInput
//               style={styles.input}
//               placeholder="Название товара"
//               value={formData.item_name || ''}
//               onChangeText={(value) => handleInputChange('item_name', value)}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Описание"
//               value={formData.description || ''}
//               onChangeText={(value) => handleInputChange('description', value)}
//               multiline
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Стоимость в тенге"
//               value={formData.cost || ''}
//               onChangeText={(value) => handleInputChange('cost', value)}
//             />


//             <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Адрес магазина:</Text>
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Адрес магазина"
//                       value={formData.specs?.address || ''}
//                       onChangeText={(value) =>
//                         handleInputChange('specs', { ...formData.specs, address: value })
//                       }
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Телефон:</Text>
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Телефон (например, +7 (777) 123-45-67)"
//                       value={formData.specs?.phone || ''}
//                       onChangeText={(value) =>
//                         handleInputChange('specs', { ...formData.specs, phone: value })
//                       }
//                       keyboardType="phone-pad"
//                     />
//                   </View>

//                   <View style={styles.inputContainer}>
//                     <Text style={styles.inputLabel}>Название магазина:</Text>
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Название магазина"
//                       value={formData.specs?.storeName || ''}
//                       onChangeText={(value) =>
//                         handleInputChange('specs', { ...formData.specs, storeName: value })
//                       }
//                     />
//                   </View>
           
//           </>
//         );
//             default:
//         return <Text style={styles.label}>Выберите тип объекта для создания</Text>;
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//     <ScrollView >
//       <Text style={styles.title}>Создать объект</Text>
//       <View style={styles.pickerContainer}>
//         <Text style={styles.label}>Выберите тип объекта:</Text>
//         <TouchableOpacity style={styles.roleButton} onPress={() => setPickerVisible(true)}>
//           <Text style={styles.roleText}>{selectedItem || 'Выберите'}</Text>
//         </TouchableOpacity>
//         <Modal visible={isPickerVisible} transparent={true} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <Picker selectedValue={selectedItem} style={styles.picker} onValueChange={(itemValue) => { setSelectedItem(itemValue); setPickerVisible(false); setFormData({}); }}>
//                 <Picker.Item label="Выберите" value="" />
//                 {items.map((item) => <Picker.Item key={item} label={item} value={item} />)}
//               </Picker>
//               <Button title="Закрыть" onPress={() => setPickerVisible(false)} />
//             </View>
//           </View>
//         </Modal>
//       </View>
//       {renderForm()}
//       {selectedItem && (
//         <>
//           <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
//             <Text style={styles.uploadButtonText}>Добавить фото/видео</Text>
//           </TouchableOpacity>
//           {selectedFiles.length > 0 && (
//             <FlatList
//               data={selectedFiles}
//               renderItem={renderFileItem}
//               keyExtractor={(item) => item.uri}
//               horizontal
//               style={styles.fileList}
//             />
//           )}
//           {/* <Button title="Создать" onPress={handleSubmit} disabled={!selectedItem} /> */}
          
//           <Button
//             title={isLoading ? 'Создание...' : 'Создать'} // Меняем текст кнопки
//             onPress={handleSubmit}
//             disabled={!selectedItem || isLoading} // Отключаем кнопку во время загрузки
//           />
//         </>
//       )}
//     </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, marginBottom:'20%'},
//   title: { fontSize: 24, textAlign: 'center' },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   pickerContainer: { marginBottom: 20 },
//   label: { fontSize: 16, marginBottom: 5 },
//   roleButton: { borderWidth: 1, borderRadius: 5, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0' },
//   roleText: { fontSize: 16 },
//   modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center' },
//   modalContent: { backgroundColor: 'white', marginHorizontal: 20, padding: 40, borderRadius: 10 },
//   picker: { height: 300, width: '100%' },
//   inputContainer: { marginBottom: 10 },
//   inputLabel: { fontSize: 16, color: '#4B5563', marginBottom: 4 },
//   cuisineButton: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, justifyContent: 'center' },
//   cuisineText: { fontSize: 16, color: '#374151' },
//   modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
//   modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12 },
//   modalPicker: { height: 150, color: '#374151' },
//   closeButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#6B7280', paddingVertical: 10, borderRadius: 8, marginTop: 12 },
//   closeButtonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
//   uploadButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center', marginVertical: 10 },
//   uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
//   fileList: { marginVertical: 10 },
//   fileItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
//   filePreview: { width: 50, height: 50, borderRadius: 5 },
//   removeButton: { marginLeft: 10 },
//   removeButtonText: { color: 'red', fontSize: 14 },
// }
// );






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
    'Традиционные подарки', 'Цветы', 'Торты', 'Алкоголь', 'Товары',
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
    // Действие при нажатии кнопки "Готово" на клавиатуре
    // Например, можно вызвать handleSubmit или просто закрыть клавиатуру
    // Keyboard.dismiss(); // Если нужно закрыть клавиатуру
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
        throw new Error('Ошибка загрузки файла');
      }
    }
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
          entityId = response.data.id;
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
          entityId = response.data.id;
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
          entityId = response.data.id;
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
          entityId = response.data.id;
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
          entityId = response.data.id;
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
          entityId = response.data.id;
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
          entityId = response.data.id;
          break;

        case 'Торты':
          if (!formData.name) {
            throw new Error('Заполните обязательное поле: Наименование салона');
          }
          response = await api.createCake({
            name: formData.name,
            address: formData.address || '',
            phone: formData.phone || '',
            district: formData.district || '',
            cakeType: formData.cakeType || '',
            cost: formData.cost || '',
            supplier_id: user.id,
          });
          entityId = response.data.id;
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
          entityId = response.data.id;
          break;

        case 'Товары':
          if (!formData.category || !formData.item_name) {
            throw new Error('Заполните обязательные поля: Категория и Название товара');
          }
          response = await api.createGood({
            category: formData.category,
            item_name: formData.item_name,
            description: formData.description || '',
            cost: formData.cost || '',
            specs: formData.specs || {},
            supplier_id: user.id,
          });
          entityId = response.data.data.id;
          setFormDataId(response.data.data.id);
          break;

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

  const renderItemType = ({ item }) => (
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
              <Text style={styles.inputLabel}>Портфолио:</Text>
              <TextInput
                style={styles.input}
                placeholder="Портфолио"
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
              <Text style={styles.inputLabel}>Стоимость в тенге:</Text>
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
                onChangeText={(value) => handleInputChange('specs', { ...formData.specs, address: value })}
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
                onChangeText={(value) => handleInputChange('specs', { ...formData.specs, phone: value })}
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
                onChangeText={(value) => handleInputChange('specs', { ...formData.specs, storeName: value })}
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
              />
            </View>
          </>
        );
      default:
        return <Text style={styles.label}>Выберите тип объекта для создания</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Создать объект</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Выберите тип объекта:</Text>
          <TouchableOpacity style={styles.roleButton} onPress={() => setItemModalVisible(true)}>
            <Text style={styles.roleText}>{selectedItem || 'Выберите тип'}</Text>
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
                  style={styles.itemList}
                  showsVerticalScrollIndicator={false}
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
              <Icon name="add-photo-alternate" size={20} color={COLORS.background} style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Добавить фото/видео</Text>
            </TouchableOpacity>
            {selectedFiles.length > 0 && (
              <FlatList
                data={selectedFiles}
                renderItem={renderFileItem}
                keyExtractor={(item) => item.uri}
                horizontal
                style={styles.fileList}
                showsHorizontalScrollIndicator={false}
              />
            )}
            <TouchableOpacity
              style={[styles.submitButton, isLoading || !selectedItem ? styles.submitButtonDisabled : {}]}
              onPress={handleSubmit}
              disabled={isLoading || !selectedItem}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.label,
    marginBottom: 8,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.label,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionList: {
    maxHeight: 300,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  itemList: {
    maxHeight: 400,
  },
  itemTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemTypeIcon: {
    marginRight: 12,
  },
  itemTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  fileList: {
    marginVertical: 16,
  },
  fileItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  filePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButton: {
    marginTop: 8,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
});