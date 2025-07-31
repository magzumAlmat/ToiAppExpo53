// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   FlatList,
//   Dimensions,
//   Linking, // Добавлено для открытия ссылок
// } from 'react-native';
// import ImageProgress from 'react-native-image-progress';
// import { ProgressBar } from 'react-native-progress'; // Убедитесь, что установлен
// import { Video } from 'expo-av';
// import axios from 'axios';
// import { useNavigation } from '@react-navigation/native';
// import { Appbar } from 'react-native-paper'; // Используем Appbar из react-native-paper
// import Icon from 'react-native-vector-icons/MaterialIcons'; // Для иконки закрытия
// import { LinearGradient } from 'expo-linear-gradient';

// // Замените на правильный путь к вашему файлу theme.js
// import { COLORS, SIZES, FONTS } from '../constants/theme'; // ПРЕДПОЛАГАЕТСЯ, ЧТО ЭТОТ ФАЙЛ ЕСТЬ

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

//   useEffect(() => {
//     const fetchFiles = async () => {
//       if (!item || !item.type || !item.id) {
//         setError('Ошибка: Недостаточно данных для загрузки файлов.');
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await axios.get(`${BASE_URL}/api/${item.type}/${item.id}/files`, {
//           // headers: { 'Cache-Control': 'max-age=3600' }, // Раскомментируйте, если нужно кеширование
//         });
//         setFiles(response.data || []); // Убедимся, что files всегда массив
//       } catch (err) {
//         console.error("File fetch error:", err);
//         setError('Ошибка загрузки файлов: ' + (err.response?.data?.message || err.message));
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFiles();
//   }, [item]);

//   const handleScroll = (event) => {
//     const contentOffsetX = event.nativeEvent.contentOffset.x;
//     const carouselItemWidth = screenWidth - (SIZES.padding * 2);
//     const index = Math.round(contentOffsetX / carouselItemWidth);
//     setActiveSlide(index);
//   };

//   const renderFileItem = ({ item: file }) => {
//     const fileUrl = `${BASE_URL}/${file.path}`;
//     // const thumbnailUrl = `${BASE_URL}/${file.path}?size=small`; // Если сервер поддерживает small

//     if (file.mimetype.startsWith('image/')) {
//       return (
//         <TouchableOpacity
//           style={styles.carouselItem}
//           onPress={() => setSelectedImage(fileUrl)}
//           activeOpacity={0.9}
//         >
//           <ImageProgress
//             source={{ uri: fileUrl /* или thumbnailUrl */ }}
//             indicator={ProgressBar}
//             indicatorProps={{
//               color: COLORS.primary,
//               borderWidth: 0,
//               borderRadius: 0,
//               unfilledColor: COLORS.textSecondary,
//               width: null, // Чтобы прогресс бар занимал всю ширину
//             }}
//             style={styles.media}
//             resizeMode="cover"
//           />
//         </TouchableOpacity>
//       );
//     } else if (file.mimetype === 'video/mp4') {
//       return (
//         <View style={styles.carouselItem}>
//           <Video
//             source={{ uri: fileUrl }}
//             style={styles.media} // Используем один стиль для медиа
//             useNativeControls
//             resizeMode="cover"
//             // isLooping // Раскомментируйте, если нужно авто-зацикливание
//           />
//         </View>
//       );
//     } else {
//       return (
//         <View style={[styles.carouselItem, styles.unsupportedFile]}>
//           <Icon name="broken-image" size={40} color={COLORS.textSecondary} />
//           <Text style={styles.caption}>Неподдерживаемый формат: {file.mimetype}</Text>
//         </View>
//       );
//     }
//   };

//   const renderDetails = () => {
//     // Общая функция для отображения поля, если оно есть
//     const DetailField = ({ label, value }) => {
//       if (!value && typeof value !== 'number') return null; // Не отображать, если нет значения
//       return (
//         <>
//           <Text style={styles.detailLabel}>{label}</Text>
//           <Text style={styles.detailValue}>{value}</Text>
//         </>
//       );
//     };
    
//     const LinkField = ({ label, url, text }) => {
//         if (!url) return null;
//         return (
//             <>
//                 <Text style={styles.detailLabel}>{label}</Text>
//                 <TouchableOpacity onPress={() => Linking.openURL(url)}>
//                     <Text style={[styles.detailValue, styles.linkValue]}>{text || url}</Text>
//                 </TouchableOpacity>
//             </>
//         );
//     };

//     switch (item.type) {
//       case 'restaurant':
//         return (
//           <>
//             <DetailField label="Тип" value="Ресторан" />
//             <DetailField label="Вместимость" value={item.capacity} />
//             <DetailField label="Кухня" value={item.cuisine} />
//             <DetailField label="Средний чек" value={item.averageCost ? `${item.averageCost} ₸` : null} />
//             <DetailField label="Адрес" value={item.address} />
//             <DetailField label="Телефон" value={item.phone} />
//             <DetailField label="Район" value={item.district} />
//           </>
//         );
//       case 'clothing':
//         return (
//           <>
//             <DetailField label="Магазин" value={item.storeName} />
//             <DetailField label="Тип" value="Одежда" />
//             <DetailField label="Товар" value={item.itemName} />
//             <DetailField label="Пол" value={item.gender} />
//             <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
//             <DetailField label="Адрес" value={item.address} />
//           </>
//         );
//        case 'tamada':
//         return (
//           <>
//             <DetailField label="Тип" value="Ведущий / Тамада" />
//             <LinkField label="Портфолио / О себе" url={item.portfolio} text="Открыть ссылку на портфолио" />
//             <DetailField label="Стоимость услуг" value={item.cost ? `${item.cost} ₸` : null} />
//              {/* Добавьте другие поля для тамады, если есть, например, опыт, языки и т.д. */}
//           </>
//         );
//       // ... (остальные case'ы аналогично, используя DetailField и LinkField)
//       // Пример для 'flowers':
//       case 'flowers':
//         return (
//           <>
//             <DetailField label="Салон" value={item.salonName} />
//             <DetailField label="Тип" value="Цветы" />
//             <DetailField label="Название букета/цветов" value={item.flowerName} />
//             <DetailField label="Вид цветов" value={item.flowerType} />
//             <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
//             <DetailField label="Адрес" value={item.address} />
//           </>
//         );
//       // И так далее для всех ваших типов...
//       default:
//         return <Text style={styles.detailValue}>Информация для данного типа отсутствует.</Text>;
//     }
//   };
  
//   const getItemTitle = () => {
//       return item?.name || item?.itemName || item?.item_name || item?.storeName || item?.salonName || item?.teamName || 'Детали';
//   }

//   return (
//     <LinearGradient
//       colors={[COLORS.screenBackgroundGradientStart, COLORS.screenBackgroundGradientEnd]}
//       style={styles.container}
//     >
//       <Appbar.Header style={styles.appbarHeader} elevated={false}>
//         <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.headerTintColor} size={SIZES.h2}/>
//         <Appbar.Content
//           title={getItemTitle()}
//           titleStyle={styles.headerTitle}
//           style={styles.appbarContent}
//         />
//       </Appbar.Header>

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <View style={styles.mediaSection}>
//           {loading ? (
//             <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
//           ) : error ? (
//             <Text style={styles.errorText}>{error}</Text>
//           ) : files && files.length > 0 ? (
//             <View>
//               <FlatList
//                 data={files}
//                 renderItem={renderFileItem}
//                 keyExtractor={(file) => file.id.toString()}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 snapToInterval={screenWidth - (SIZES.padding * 2)} // Ширина элемента карусели
//                 snapToAlignment="center"
//                 decelerationRate="fast"
//                 contentContainerStyle={styles.mediaListContainer}
//                 onScroll={handleScroll}
//                 scrollEventThrottle={16}
//                 initialNumToRender={1}
//                 maxToRenderPerBatch={1}
//                 windowSize={3} // Немного увеличил для плавной загрузки
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
//             <View style={styles.noFilesContainer}>
//                  <Icon name="image-not-supported" size={50} color={COLORS.textSecondary} />
//                  <Text style={styles.noFilesText}>Изображения или видео отсутствуют</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.detailsCard}>
//           <Text style={styles.cardTitle}>{getItemTitle()}</Text>
//           <View style={styles.separator} />
//           {renderDetails()}
//         </View>
//       </ScrollView>

//       <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity
//             style={styles.modalCloseButton}
//             onPress={() => setSelectedImage(null)}
//             activeOpacity={0.8}
//           >
//             <Icon name="close" size={30} color={COLORS.white} />
//           </TouchableOpacity>
//           <ImageProgress
//             source={{ uri: selectedImage }}
//             indicator={ProgressBar}
//             indicatorProps={{
//               color: COLORS.primary,
//               borderWidth: 0,
//               borderRadius: 0,
//               unfilledColor: COLORS.textLight,
//               width: null,
//             }}
//             style={styles.fullscreenImage}
//             resizeMode="contain"
//           />
//         </View>
//       </Modal>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   appbarHeader: { // Переименовано с header на appbarHeader во избежание конфликтов
//     backgroundColor: COLORS.headerBackground,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.cardBorderColor,
//     elevation: 0, // Убираем стандартную тень Android
//     shadowOpacity: 0, // Убираем стандартную тень iOS
//   },
//   appbarContent: {
//     marginLeft: -SIZES.padding / 1.5, // Компенсация для Appbar.Content, чтобы заголовок был ближе к центру
//   },
//   headerTitle: {
//     ...FONTS.h2, // Используем стиль из темы
//     color: COLORS.headerTintColor,
//   },
//   scrollContent: {
//     paddingHorizontal: SIZES.padding,
//     paddingTop: SIZES.padding,
//     paddingBottom: SIZES.padding * 2,
//   },
//   mediaSection: {
//     marginBottom: SIZES.padding * 1.5,
//   },
//   mediaListContainer: {
//     // Пусто, если элементы карусели занимают всю ширину и имеют свои отступы
//   },
//   carouselItem: {
//     width: screenWidth - (SIZES.padding * 2),
//     height: screenWidth * 0.6, // Высота как 60% от ширины экрана
//     borderRadius: SIZES.radius,
//     backgroundColor: COLORS.cardBackground,
//     overflow: 'hidden',
//     shadowColor: COLORS.shadowColor,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 6,
//   },
//   media: {
//     width: '100%',
//     height: '100%',
//   },
//    unsupportedFile: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.cardBorderColor, // Фон для неподдерживаемых
//   },
//   caption: {
//     ...FONTS.caption,
//     marginTop: SIZES.padding / 2,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: SIZES.padding,
//   },
//   paginationDot: {
//     width: 10, // Чуть крупнее
//     height: 10,
//     borderRadius: 5,
//     marginHorizontal: 6,
//   },
//   paginationActiveDot: {
//     backgroundColor: COLORS.accent, // Используем accent для активной точки
//   },
//   paginationInactiveDot: {
//     backgroundColor: COLORS.cardBorderColor, // Более светлый для неактивных
//   },
//   noFilesContainer: {
//     height: screenWidth * 0.6, // Такая же высота, как у карусели
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.cardBackground,
//     borderRadius: SIZES.radius,
//     padding: SIZES.padding,
//     shadowColor: COLORS.shadowColor,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   noFilesText: {
//     ...FONTS.noFiles, // Стиль из темы
//     textAlign: 'center',
//     marginTop: SIZES.padding / 2,
//   },
//   detailsCard: {
//     backgroundColor: COLORS.cardBackground,
//     borderRadius: SIZES.radius,
//     padding: SIZES.padding,
//     marginBottom: SIZES.padding,
//     shadowColor: COLORS.shadowColor,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2, // Меньшая тень для карточки с текстом
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   cardTitle: {
//     ...FONTS.title, // Стиль из темы
//     textAlign: 'center',
//     marginBottom: SIZES.padding * 0.75,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: COLORS.cardBorderColor,
//     marginVertical: SIZES.padding * 0.75,
//     opacity: 0.7,
//   },
//   detailLabel: {
//     ...FONTS.detailLabel, // Стиль из темы
//     marginBottom: SIZES.padding / 3,
//   },
//   detailValue: {
//     ...FONTS.detailValue, // Стиль из темы
//     marginBottom: SIZES.padding,
//   },
//   linkValue: {
//     color: COLORS.primary, // Делаем ссылки акцентным цветом
//     textDecorationLine: 'underline',
//   },
//   loader: {
//     height: screenWidth * 0.6, // Чтобы занимал место карусели
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     ...FONTS.error, // Стиль из темы
//     textAlign: 'center',
//     padding: SIZES.padding,
//     backgroundColor: COLORS.cardBackground,
//     borderRadius: SIZES.radius,
//     minHeight: screenWidth * 0.3, // Минимальная высота для блока ошибки
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: COLORS.overlay,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: SIZES.padding * 2.5, // Отступ для статус-бара и хедера
//     right: SIZES.padding,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     borderRadius: 20,
//     padding: 8,
//     zIndex: 10, // Выше всего
//   },
//   fullscreenImage: {
//     width: '100%', // Изображение на весь экран в модалке
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
  Linking,
} from 'react-native';
import ImageProgress from 'react-native-image-progress';
import { ProgressBar } from 'react-native-progress';
import Video from 'react-native-video'; // Updated import
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';

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

  useEffect(() => {
    const fetchFiles = async () => {
      if (!item || !item.type || !item.id) {
        setError('Ошибка: Недостаточно данных для загрузки файлов.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/api/${item.type}/${item.id}/files`);
        setFiles(response.data || []);
      } catch (err) {
        console.error("File fetch error:", err);
        setError('Ошибка загрузки файлов: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [item]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const carouselItemWidth = screenWidth - (SIZES.padding * 2);
    const index = Math.round(contentOffsetX / carouselItemWidth);
    setActiveSlide(index);
  };

  const renderFileItem = ({ item: file }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;

    if (file.mimetype.startsWith('image/')) {
      return (
        <TouchableOpacity
          style={styles.carouselItem}
          onPress={() => setSelectedImage(fileUrl)}
          activeOpacity={0.9}
        >
          <ImageProgress
            source={{ uri: fileUrl }}
            indicator={ProgressBar}
            indicatorProps={{
              color: COLORS.primary,
              borderWidth: 0,
              borderRadius: 0,
              unfilledColor: COLORS.textSecondary,
              width: null,
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
            style={styles.media}
            controls={true} // Replaced useNativeControls with controls
            resizeMode="cover"
            // Optional: Add paused prop if you want to control playback state
            // paused={true} // Uncomment to start paused
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.carouselItem, styles.unsupportedFile]}>
          <Icon name="broken-image" size={40} color={COLORS.textSecondary} />
          <Text style={styles.caption}>Неподдерживаемый формат: {file.mimetype}</Text>
        </View>
      );
    }
  };

  const renderDetails = () => {
    const DetailField = ({ label, value }) => {
      if (!value && typeof value !== 'number') return null;
      return (
        <>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </>
      );
    };

    const LinkField = ({ label, url, text }) => {
      if (!url) return null;
      return (
        <>
          <Text style={styles.detailLabel}>{label}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text style={[styles.detailValue, styles.linkValue]}>{text || url}</Text>
          </TouchableOpacity>
        </>
      );
    };

    switch (item.type) {
      case 'restaurant':
        return (
          <>
            <DetailField label="Тип" value="Ресторан" />
            <DetailField label="Вместимость" value={item.capacity} />
            <DetailField label="Кухня" value={item.cuisine} />
            <DetailField label="Средний чек" value={item.averageCost ? `${item.averageCost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Район" value={item.district} />
          </>
        );
      case 'clothing':
        return (
          <>
            <DetailField label="Магазин" value={item.storeName} />
            <DetailField label="Тип" value="Одежда" />
            <DetailField label="Товар" value={item.itemName} />
            <DetailField label="Пол" value={item.gender} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
          </>
        );
      case 'tamada':
        return (
          <>
            <DetailField label="Тип" value="Ведущий / Тамада" />
            <LinkField label="Портфолио / О себе" url={item.portfolio} text="Открыть ссылку на портфолио" />
            <DetailField label="Стоимость услуг" value={item.cost ? `${item.cost} ₸` : null} />
          </>
        );
      case 'flowers':
        return (
          <>
            <DetailField label="Салон" value={item.salonName} />
            <DetailField label="Тип" value="Цветы" />
            <DetailField label="Название букета/цветов" value={item.flowerName} />
            <DetailField label="Вид цветов" value={item.flowerType} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
          </>
        );
      default:
        return <Text style={styles.detailValue}>Информация для данного типа отсутствует.</Text>;
    }
  };

  const getItemTitle = () => {
    return item?.name || item?.itemName || item?.item_name || item?.storeName || item?.salonName || item?.teamName || 'Детали';
  };

  return (
    <LinearGradient
      colors={[COLORS.screenBackgroundGradientStart, COLORS.screenBackgroundGradientEnd]}
      style={styles.container}
    >
      <Appbar.Header style={styles.appbarHeader} elevated={false}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.headerTintColor} size={SIZES.h2} />
        <Appbar.Content
          title={getItemTitle()}
          titleStyle={styles.headerTitle}
          style={styles.appbarContent}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mediaSection}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : files && files.length > 0 ? (
            <View>
              <FlatList
                data={files}
                renderItem={renderFileItem}
                keyExtractor={(file) => file.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth - (SIZES.padding * 2)}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.mediaListContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={3}
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
            <View style={styles.noFilesContainer}>
              <Icon name="image-not-supported" size={50} color={COLORS.textSecondary} />
              <Text style={styles.noFilesText}>Изображения или видео отсутствуют</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>{getItemTitle()}</Text>
          <View style={styles.separator} />
          {renderDetails()}
        </View>
      </ScrollView>

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.8}
          >
            <Icon name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <ImageProgress
            source={{ uri: selectedImage }}
            indicator={ProgressBar}
            indicatorProps={{
              color: COLORS.primary,
              borderWidth: 0,
              borderRadius: 0,
              unfilledColor: COLORS.textLight,
              width: null,
            }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbarHeader: {
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderColor,
    elevation: 0,
    shadowOpacity: 0,
  },
  appbarContent: {
    marginLeft: -SIZES.padding / 1.5,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.headerTintColor,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  mediaSection: {
    marginBottom: SIZES.padding * 1.5,
  },
  mediaListContainer: {},
  carouselItem: {
    width: screenWidth - (SIZES.padding * 2),
    height: screenWidth * 0.6,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  unsupportedFile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBorderColor,
  },
  caption: {
    ...FONTS.caption,
    marginTop: SIZES.padding / 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SIZES.padding,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  paginationActiveDot: {
    backgroundColor: COLORS.accent,
  },
  paginationInactiveDot: {
    backgroundColor: COLORS.cardBorderColor,
  },
  noFilesContainer: {
    height: screenWidth * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noFilesText: {
    ...FONTS.noFiles,
    textAlign: 'center',
    marginTop: SIZES.padding / 2,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    ...FONTS.title,
    textAlign: 'center',
    marginBottom: SIZES.padding * 0.75,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.cardBorderColor,
    marginVertical: SIZES.padding * 0.75,
    opacity: 0.7,
  },
  detailLabel: {
    ...FONTS.detailLabel,
    marginBottom: SIZES.padding / 3,
  },
  detailValue: {
    ...FONTS.detailValue,
    marginBottom: SIZES.padding,
  },
  linkValue: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  loader: {
    height: screenWidth * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.error,
    textAlign: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    minHeight: screenWidth * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: SIZES.padding * 2.5,
    right: SIZES.padding,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default DetailsScreen;