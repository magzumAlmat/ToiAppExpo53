// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   FlatList,
//   Dimensions,
// } from 'react-native';
// import { Video } from 'expo-av';
// import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
// import { Card, Appbar, Title } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const COLORS = {
//   primary: '#007AFF',
//   secondary: '#FF9500',
//   textPrimary: '#1C2526',
//   textSecondary: '#6B7280',
//   background: '#FFFFFF',
//   overlay: 'rgba(0, 0, 0, 0.6)',
//   border: '#E5E7EB',
//   error: '#EF4444',
// };

// const { width: screenWidth } = Dimensions.get('window');

// const DetailsScreen = ({ route }) => {
//   const { item } = route.params;
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [activeSlide, setActiveSlide] = useState(0);
//   const navigation = useNavigation();

//   const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

//   const fetchFiles = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/${item.type}/${item.id}/files`);
//       setFiles(response.data);
//     } catch (err) {
//       setError('Ошибка загрузки файлов: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const handleScroll = (event) => {
//     const contentOffsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / (screenWidth - 40));
//     setActiveSlide(index);
//   };

//   const renderFileItem = ({ item: file }) => {
//     const fileUrl = `${BASE_URL}/${file.path}`;

//     if (file.mimetype.startsWith('image/')) {
//       return (
//         <TouchableOpacity
//           style={styles.carouselItem}
//           onPress={() => setSelectedImage(fileUrl)}
//           activeOpacity={0.9}
//         >
//           <Image source={{ uri: fileUrl }} style={styles.media} />
//           {/* <Text style={styles.caption}>{file.name}</Text> */}
//         </TouchableOpacity>
//       );
//     } else if (file.mimetype === 'video/mp4') {
//       return (
//         <View style={styles.carouselItem}>
//           <Video
//             source={{ uri: fileUrl }}
//             style={styles.video}
//             useNativeControls
//             resizeMode="cover"
//             isLooping
//           />
//           {/* <Text style={styles.caption}>{file.name}</Text> */}
//         </View>
//       );
//     } else {
//       return (
//         <View style={styles.carouselItem}>
//           <Text style={styles.caption}>Неподдерживаемый формат: {file.mimetype}</Text>
//         </View>
//       );
//     }
//   };

//   const renderDetails = () => {
//     switch (item.type) {
//       case 'restaurant':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Название:</Text>
//             <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Ресторан</Text>
//             <Text style={styles.detailLabel}>Вместимость:</Text>
//             <Text style={styles.detailValue}>{item.capacity || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Кухня:</Text>
//             <Text style={styles.detailValue}>{item.cuisine || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Средний чек:</Text>
//             <Text style={styles.detailValue}>{item.averageCost ? `${item.averageCost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Телефон:</Text>
//             <Text style={styles.detailValue}>{item.phone || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Район:</Text>
//             <Text style={styles.detailValue}>{item.district || 'Не указано'}</Text>
//           </>
//         );
//       case 'clothing':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Магазин:</Text>
//             <Text style={styles.detailValue}>{item.storeName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Одежда</Text>
//             <Text style={styles.detailLabel}>Товар:</Text>
//             <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Пол:</Text>
//             <Text style={styles.detailValue}>{item.gender || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'flowers':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Салон:</Text>
//             <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Цветы</Text>
//             <Text style={styles.detailLabel}>Цветы:</Text>
//             <Text style={styles.detailValue}>{item.flowerName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип цветов:</Text>
//             <Text style={styles.detailValue}>{item.flowerType || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'cake':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Название:</Text>
//             <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Торты</Text>
//             <Text style={styles.detailLabel}>Тип торта:</Text>
//             <Text style={styles.detailValue}>{item.cakeType || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'alcohol':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Салон:</Text>
//             <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Алкоголь</Text>
//             <Text style={styles.detailLabel}>Напиток:</Text>
//             <Text style={styles.detailValue}>{item.alcoholName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Категория:</Text>
//             <Text style={styles.detailValue}>{item.category || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'program':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Команда:</Text>
//             <Text style={styles.detailValue}>{item.teamName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Программа</Text>
//             <Text style={styles.detailLabel}>Тип программы:</Text>
//             <Text style={styles.detailValue}>{item.type || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//           </>
//         );
//       case 'tamada':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Имя:</Text>
//             <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Тамада</Text>
//             <Text style={styles.detailLabel}>Портфолио:</Text>
//             <Text style={styles.detailValue}>{item.portfolio || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//           </>
//         );
//       case 'traditionalGift':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Салон:</Text>
//             <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Традиционные подарки</Text>
//             <Text style={styles.detailLabel}>Товар:</Text>
//             <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'transport':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Салон:</Text>
//             <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Транспорт</Text>
//             <Text style={styles.detailLabel}>Авто:</Text>
//             <Text style={styles.detailValue}>{item.carName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Марка:</Text>
//             <Text style={styles.detailValue}>{item.brand || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Цвет:</Text>
//             <Text style={styles.detailValue}>{item.color || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Телефон:</Text>
//             <Text style={styles.detailValue}>{item.phone || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Район:</Text>
//             <Text style={styles.detailValue}>{item.district || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Адрес:</Text>
//             <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
//           </>
//         );
//       case 'goods':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Название:</Text>
//             <Text style={styles.detailValue}>{item.item_name || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Товар</Text>
//             <Text style={styles.detailLabel}>Описание:</Text>
//             <Text style={styles.detailValue}>{item.description || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//           </>
//         );
//       case 'jewelry':
//         return (
//           <>
//             <Text style={styles.detailLabel}>Магазин:</Text>
//             <Text style={styles.detailValue}>{item.storeName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Тип:</Text>
//             <Text style={styles.detailValue}>Ювелирные изделия</Text>
//             <Text style={styles.detailLabel}>Товар:</Text>
//             <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Материал:</Text>
//             <Text style={styles.detailValue}>{item.material || 'Не указано'}</Text>
//             <Text style={styles.detailLabel}>Стоимость:</Text>
//             <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
//           </>
//         );
//       default:
//         return <Text style={styles.detailValue}>Неизвестный тип</Text>;
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Appbar.Header style={styles.header}>
//         <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.textPrimary} />
//         <Appbar.Content
//           title={item.name || item.itemName || item.item_name || 'Детали'}
//           titleStyle={styles.headerTitle}
//         />
//       </Appbar.Header>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.mediaSection}>
//           {loading ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : error ? (
//             <Text style={styles.error}>{error}</Text>
//           ) : files.length > 0 ? (
//             <View>
//               <FlatList
//                 data={files}
//                 renderItem={renderFileItem}
//                 keyExtractor={(file) => file.id}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 snapToInterval={screenWidth - 40}
//                 snapToAlignment="center"
//                 decelerationRate="fast"
//                 contentContainerStyle={styles.mediaList}
//                 onScroll={handleScroll}
//                 scrollEventThrottle={16}
//               />
//               {files.length > 1 && (
//                 <View style={styles.paginationContainer}>
//                   {files.map((_, index) => (
//                     <View
//                       key={index}
//                       style={[
//                         styles.paginationDot,
//                         activeSlide === index ? styles.paginationActiveDot : styles.paginationInactiveDot,
//                       ]}
//                     />
//                   ))}
//                 </View>
//               )}
//             </View>
//           ) : (
//             <Text style={styles.detailValue}>Файлы отсутствуют</Text>
//           )}
//         </View>
//         <Card style={styles.itemCard}>
//           <Card.Content style={styles.cardContent}>
//             <Title style={styles.title}>{item.name || item.itemName || item.item_name || 'Без названия'}</Title>
//             {renderDetails()}
//           </Card.Content>
//         </Card>
//       </ScrollView>

//       <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setSelectedImage(null)}
//             activeOpacity={0.8}
//           >
//             <Icon name="close" size={24} color={COLORS.background} />
//           </TouchableOpacity>
//           <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     backgroundColor: COLORS.background,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   itemCard: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginBottom: 24,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   cardContent: {
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.textPrimary,
//     marginBottom: 12,
//   },
//   detailLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: COLORS.textSecondary,
//     marginBottom: 8,
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '400',
//     color: COLORS.textPrimary,
//     marginBottom: 16,
//   },
//   mediaSection: {
//     marginBottom: 24,
//   },
//   mediaList: {
//     paddingHorizontal: 20,
//   },
//   carouselItem: {
//     width: screenWidth - 64,
//     borderRadius: 12,
//     backgroundColor: COLORS.background,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     marginHorizontal: 12,
//   },
//   media: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   video: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   caption: {
//     fontSize: 12,
//     fontWeight: '400',
//     color: COLORS.textSecondary,
//     padding: 8,
//     textAlign: 'center',
//   },
//   loader: {
//     marginVertical: 16,
//   },
//   error: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.error,
//     textAlign: 'center',
//     marginVertical: 16,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingVertical: 12,
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 6,
//   },
//   paginationActiveDot: {
//     backgroundColor: COLORS.primary,
//   },
//   paginationInactiveDot: {
//     backgroundColor: COLORS.textSecondary,
//     opacity: 0.4,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: COLORS.overlay,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 1,
//   },
//   fullscreenImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//   },
// });

// export default DetailsScreen;




import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import ImageProgress from 'react-native-image-progress';
import { ProgressBar } from 'react-native-progress';
import { Video } from 'expo-av';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Card, Appbar, Title } from 'react-native-paper';
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
};

const { width: screenWidth } = Dimensions.get('window');

const DetailsScreen = ({ route }) => {
  const { item } = route.params;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const navigation = useNavigation();

  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/${item.type}/${item.id}/files`, {
        headers: { 'Cache-Control': 'max-age=3600' },
      });
      setFiles(response.data);
    } catch (err) {
      setError('Ошибка загрузки файлов: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveSlide(index);
  };

  const renderFileItem = ({ item: file }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;
    const thumbnailUrl = `${BASE_URL}/${file.path}?size=small`;

    if (file.mimetype.startsWith('image/')) {
      return (
        <TouchableOpacity
          style={styles.carouselItem}
          onPress={() => setSelectedImage(fileUrl)}
          activeOpacity={0.9}
        >
          <ImageProgress
            source={{ uri: thumbnailUrl }}
            indicator={ProgressBar}
            indicatorProps={{
              color: COLORS.primary,
              borderWidth: 0,
              borderRadius: 0,
              unfilledColor: COLORS.textSecondary,
            }}
            style={styles.media}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (file.mimetype === 'video/mp4') {
      return (
        <View style={styles.carouselItem}>
          <Video
            source={{ uri: fileUrl }}
            style={styles.video}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        </View>
      );
    } else {
      return (
        <View style={styles.carouselItem}>
          <Text style={styles.caption}>Неподдерживаемый формат: {file.mimetype}</Text>
        </View>
      );
    }
  };

  const renderDetails = () => {
    switch (item.type) {
      case 'restaurant':
        return (
          <>
            <Text style={styles.detailLabel}>Название:</Text>
            <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Ресторан</Text>
            <Text style={styles.detailLabel}>Вместимость:</Text>
            <Text style={styles.detailValue}>{item.capacity || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Кухня:</Text>
            <Text style={styles.detailValue}>{item.cuisine || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Средний чек:</Text>
            <Text style={styles.detailValue}>{item.averageCost ? `${item.averageCost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Телефон:</Text>
            <Text style={styles.detailValue}>{item.phone || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Район:</Text>
            <Text style={styles.detailValue}>{item.district || 'Не указано'}</Text>
          </>
        );
      case 'clothing':
        return (
          <>
            <Text style={styles.detailLabel}>Магазин:</Text>
            <Text style={styles.detailValue}>{item.storeName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Одежда</Text>
            <Text style={styles.detailLabel}>Товар:</Text>
            <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Пол:</Text>
            <Text style={styles.detailValue}>{item.gender || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'flowers':
        return (
          <>
            <Text style={styles.detailLabel}>Салон:</Text>
            <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Цветы</Text>
            <Text style={styles.detailLabel}>Цветы:</Text>
            <Text style={styles.detailValue}>{item.flowerName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип цветов:</Text>
            <Text style={styles.detailValue}>{item.flowerType || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'cake':
        return (
          <>
            <Text style={styles.detailLabel}>Название:</Text>
            <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Торты</Text>
            <Text style={styles.detailLabel}>Тип торта:</Text>
            <Text style={styles.detailValue}>{item.cakeType || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'alcohol':
        return (
          <>
            <Text style={styles.detailLabel}>Салон:</Text>
            <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Алкоголь</Text>
            <Text style={styles.detailLabel}>Напиток:</Text>
            <Text style={styles.detailValue}>{item.alcoholName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Категория:</Text>
            <Text style={styles.detailValue}>{item.category || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'program':
        return (
          <>
            <Text style={styles.detailLabel}>Команда:</Text>
            <Text style={styles.detailValue}>{item.teamName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Программа</Text>
            <Text style={styles.detailLabel}>Тип программы:</Text>
            <Text style={styles.detailValue}>{item.type || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
          </>
        );
      case 'tamada':
        return (
          <>
            <Text style={styles.detailLabel}>Имя:</Text>
            <Text style={styles.detailValue}>{item.name || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Тамада</Text>
            <Text style={styles.detailLabel}>Портфолио:</Text>
            <Text style={styles.detailValue}>{item.portfolio || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
          </>
        );
      case 'traditionalGift':
        return (
          <>
            <Text style={styles.detailLabel}>Салон:</Text>
            <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Традиционные подарки</Text>
            <Text style={styles.detailLabel}>Товар:</Text>
            <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'transport':
        return (
          <>
            <Text style={styles.detailLabel}>Салон:</Text>
            <Text style={styles.detailValue}>{item.salonName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Транспорт</Text>
            <Text style={styles.detailLabel}>Авто:</Text>
            <Text style={styles.detailValue}>{item.carName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Марка:</Text>
            <Text style={styles.detailValue}>{item.brand || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Цвет:</Text>
            <Text style={styles.detailValue}>{item.color || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Телефон:</Text>
            <Text style={styles.detailValue}>{item.phone || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Район:</Text>
            <Text style={styles.detailValue}>{item.district || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Адрес:</Text>
            <Text style={styles.detailValue}>{item.address || 'Не указано'}</Text>
          </>
        );
      case 'goods':
        return (
          <>
            <Text style={styles.detailLabel}>Название:</Text>
            <Text style={styles.detailValue}>{item.item_name || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Товар</Text>
            <Text style={styles.detailLabel}>Описание:</Text>
            <Text style={styles.detailValue}>{item.description || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
          </>
        );
      case 'jewelry':
        return (
          <>
            <Text style={styles.detailLabel}>Магазин:</Text>
            <Text style={styles.detailValue}>{item.storeName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Тип:</Text>
            <Text style={styles.detailValue}>Ювелирные изделия</Text>
            <Text style={styles.detailLabel}>Товар:</Text>
            <Text style={styles.detailValue}>{item.itemName || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Материал:</Text>
            <Text style={styles.detailValue}>{item.material || 'Не указано'}</Text>
            <Text style={styles.detailLabel}>Стоимость:</Text>
            <Text style={styles.detailValue}>{item.cost ? `${item.cost} ₸` : 'Не указано'}</Text>
          </>
        );
      default:
        return <Text style={styles.detailValue}>Неизвестный тип</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.textPrimary} />
        <Appbar.Content
          title={item.name || item.itemName || item.item_name || 'Детали'}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mediaSection}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : files.length > 0 ? (
            <View>
              <FlatList
                data={files}
                renderItem={renderFileItem}
                keyExtractor={(file) => file.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth - 40}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.mediaList}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={2}
              />
              {files.length > 1 && (
                <View style={styles.paginationContainer}>
                  {files.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        activeSlide === index ? styles.paginationActiveDot : styles.paginationInactiveDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.detailValue}>Файлы отсутствуют</Text>
          )}
        </View>
        <Card style={styles.itemCard}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>{item.name || item.itemName || item.item_name || 'Без названия'}</Title>
            {renderDetails()}
          </Card.Content>
        </Card>
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.8}
          >
            <Icon name="close" size={24} color={COLORS.background} />
          </TouchableOpacity>
          <ImageProgress
            source={{ uri: selectedImage }}
            indicator={ProgressBar}
            indicatorProps={{
              color: COLORS.primary,
              borderWidth: 0,
              borderRadius: 0,
              unfilledColor: COLORS.textSecondary,
            }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  itemCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaList: {
    paddingHorizontal: 20,
  },
  carouselItem: {
    width: screenWidth - 64,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginHorizontal: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  video: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    padding: 8,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  error: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  paginationActiveDot: {
    backgroundColor: COLORS.primary,
  },
  paginationInactiveDot: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default DetailsScreen;