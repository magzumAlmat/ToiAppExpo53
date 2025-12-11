








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
  Image,
} from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const DetailsScreen = ({ route }) => {

  const { item } = route.params;
  console.log('Item= ',item)
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const navigation = useNavigation();

  const BASE_URL = process.env.EXPO_PUBLIC_API_baseURL;

  const getEndpointForServiceType = (serviceType) => {
    let normalizedServiceType = serviceType.toLowerCase();
    if (normalizedServiceType === 'flower') {
      normalizedServiceType = 'flowers';
    } else if (normalizedServiceType === 'technicalequipmentrental') {
      normalizedServiceType = 'technical-equipment-rental';
    } else {
      normalizedServiceType = normalizedServiceType.replace(/s$/, '');
    }
    return normalizedServiceType;
  };

  useEffect(() => {
    const fetchFiles = async () => {
      if (!item || !item.type || !item.id) {
        setError('Ошибка: Недостаточно данных для загрузки файлов.');
        setLoading(false);
        return;
      }
      try {
        const endpoint = getEndpointForServiceType(item.type);
        const response = await axios.get(`${BASE_URL}/api/${endpoint}/${item.id}/files`);
        setFiles(response.data || []);
        console.log('Вывод.  ',response)
      } catch (err) {
        console.error("File fetch error:", err);
        setError('Ошибка загрузки файлов: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [item]);

  const openModal = (images, index) => {
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const renderFileItem = ({ item: file, index }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;

    if (file.mimetype.startsWith('image/')) {
      return (
        <TouchableOpacity
          style={styles.carouselItem}
          onPress={() => openModal(files, index)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: fileUrl }}
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
            useNativeControls
            resizeMode="cover"
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
            <DetailField label="Город" value={item.city} />
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
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'tamada':
      case 'host':
        return (
          <>
            <DetailField label="Тип" value="Ведущий / Тамада" />
            <LinkField label="Портфолио / О себе" url={item.portfolio} text="Открыть ссылку на портфолио" />
            <DetailField label="Стоимость услуг" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'flowers':
      case 'flower':
        return (
          <>
            <DetailField label="Салон" value={item.salonName} />
            <DetailField label="Тип" value="Цветы" />
            <DetailField label="Название букета/цветов" value={item.flowerName} />
            <DetailField label="Вид цветов" value={item.flowerType} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'cake':
      case 'cakes':
        return (
          <>
            <DetailField label="Название кондитерской" value={item.name} />
            <DetailField label="Тип" value="Торт" />
            <DetailField label="Тип торта" value={item.cakeType} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'alcohol':
        return (
          <>
            <DetailField label="Салон" value={item.salonName} />
            <DetailField label="Тип" value="Алкоголь" />
            <DetailField label="Название напитка" value={item.alcoholName} />
            <DetailField label="Категория" value={item.category} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'program':
      case 'programs':
      case 'theater':
        return (
          <>
            <DetailField label="Название команды" value={item.teamName} />
            <DetailField label="Тип" value="Программа" />
            <DetailField label="Тип программы" value={item.type} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'transport':
      case 'car':
        return (
          <>
            <DetailField label="Название салона" value={item.salonName} />
            <DetailField label="Тип" value="Транспорт" />
            <DetailField label="Модель" value={item.carName} />
            <DetailField label="Марка автомобиля" value={item.brand} />
            <DetailField label="Цвет" value={item.color} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'jewelry':
        return (
          <>
            <DetailField label="Название магазина" value={item.storeName} />
            <DetailField label="Тип" value="Ювелирные изделия" />
            <DetailField label="Материал" value={item.material} />
            <DetailField label="Тип изделия" value={item.type} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'traditionalGift':
      case 'traditionalgift':
        return (
          <>
            <DetailField label="Салон" value={item.salonName} />
            <DetailField label="Тип" value="Традиционные подарки" />
            <DetailField label="Тип подарка" value={item.type} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Адрес" value={item.address} />
            <DetailField label="Район" value={item.district} />
            <DetailField label="Телефон" value={item.phone} />
            <DetailField label="Город" value={item.city} />
          </>
        );
      case 'goods':
      case 'good':
        return (
          <>
            <DetailField label="Название" value={item.item_name} />
            <DetailField label="Тип" value="Товары" />
            <DetailField label="Описание" value={item.description} />
            <DetailField label="Стоимость" value={item.cost ? `${item.cost} ₸` : null} />
            <DetailField label="Город" value={item.city} />
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
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={3}
              />
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

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
            activeOpacity={0.8}
          >
            <Icon name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <FlatList
            data={selectedImages}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: `${BASE_URL}/${item.path}` }} style={styles.fullscreenImage} />
            )}
            getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
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
    paddingBottom: 500,
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
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    // paddingBottom:400,
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
    // paddingBottom:400,
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