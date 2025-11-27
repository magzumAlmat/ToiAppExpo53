import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Video from "react-native-video";
import ImageProgress from "react-native-image-progress";
import { ProgressBar } from "react-native-progress";

const COLORS = {
  primary: "#4A90E2",
  secondary: "#50C878",
  accent: "#FF6F61",
  background: "#F7F9FC",
  text: "#2D3748",
  muted: "#718096",
  white: "#FFFFFF",
  border: "#E2E8F0",
  error: "#E53E3E",
  shadow: "#0000001A",
};

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  serviceDetailsModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    margin: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.error,
    fontWeight: "600",
  },
  detailScrollContainer: {
    maxHeight: "90%",
    marginBottom: 20,
  },
  mediaSection: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minHeight: screenWidth * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselItem: {
    width: screenWidth - 32,
    height: screenWidth * 0.6,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  unsupportedFile: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  caption: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
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
    backgroundColor: COLORS.border,
  },
  noFilesContainer: {
    height: screenWidth * 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noFilesText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 8,
  },
  detailContainer: {
    paddingBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.muted,
  },
  detail: {
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 4,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginVertical: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
});

const determineCategory = (data) => {
  if (!data) return "unknown";
  if (Array.isArray(data)) return "restaurant";
  if (data.teamName) return "theater";
  if (data.name && data.portfolio) return "host";
  if (data.cakeType) return "cake";
  if (data.carName) return "car";
  if (data.flowerName) return "flower";
  if (data.itemName && data.material) return "jewelry";
  if (data.alcoholName || data.serviceType === "alcohol") return "alcohol";
  if (data.serviceType) {
    const normalizedType = data.serviceType.toLowerCase().replace(/s$/, "");
    return normalizedType in fieldLabelsByCategory ? normalizedType : "unknown";
  }
  return "unknown";
};

const fieldLabelsByCategory = {
  theater: {
    teamName: "Название команды",
    type: "Тип постановки",
    cost: "Стоимость",
  },
  restaurant: {
    name: "Название ресторана",
    cuisine: "Кухня",
    averageCost: "Средний чек",
    capacity: "Вместимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  host: {
    name: "Имя ведущего",
    portfolio: "Портфолио",
    cost: "Стоимость",
  },
  cake: {
    name: "Название кондитерской",
    cakeType: "Тип торта",
    cost: "Стоимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  car: {
    salonName: "Название салона",
    carName: "Модель автомобиля",
    brand: "Бренд",
    color: "Цвет",
    cost: "Стоимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  flower: {
    salonName: "Название салона",
    flowerName: "Название цветов",
    flowerType: "Тип композиции",
    cost: "Стоимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  jewelry: {
    storeName: "Название магазина",
    itemName: "Название изделия",
    material: "Материал",
    type: "Тип изделия",
    cost: "Стоимость",
    address: "Адрес",
    district: "Район",
    phone: "Телефон",
  },
  alcohol: {
    alcoholName: "Название напитка",
    cost: "Стоимость",
    category: "Категория",
    salonName: "Название салона",
    district: "Район",
    address: "Адрес",
    phone: "Телефон",
  },
};

const ServiceDetailsModal = ({
  serviceDetailsModalVisible,
  setServiceDetailsModalVisible,
  selectedService,
  setSelectedService,
  loadingServiceDetails,
  selectedItem,
  setSelectedItem,
  BASE_URL,
  files,
  setFiles,
  loadingFiles,
  errorFiles,
  openPhotoModal,
  // activeSlide, // activeSlide is managed internally
  // setActiveSlide, // activeSlide is managed internally
  selectedImage,
  setSelectedImage,
  photoModalVisible,
  setPhotoModalVisible,
  selectedImages,
  setSelectedImageIndex,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const isService = !!selectedService;
  const isItem = !!selectedItem;
  let data = isService ? selectedService : isItem ? selectedItem : null;

  if (data && Array.isArray(data)) {
    data = data.length > 0 ? data[0] : null;
  } else if (data && typeof data === "object" && data.hasOwnProperty("0")) {
    data = data["0"];
  }

  const category = isService
    ? selectedService?.originalServiceType || determineCategory(selectedService)
    : isItem
    ? selectedItem.item_type.toLowerCase().replace(/s$/, "")
    : "unknown";

  const fieldLabels = fieldLabelsByCategory[category] || {
    name: "Название",
    address: "Адрес",
    cost: "Стоимость",
    district: "Район",
    phone: "Телефон",
    type: "Тип",
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const carouselItemWidth = screenWidth - 32;
    const index = Math.round(contentOffsetX / carouselItemWidth);
    setActiveSlide(index);
  };

  const renderFileItem = ({ item: file }) => {
    const fileUrl = `${BASE_URL}/${file.path}`;

    if (file.mimetype.startsWith("image/")) {
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
              unfilledColor: COLORS.muted,
              width: null,
            }}
            style={styles.media}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    } else if (file.mimetype === "video/mp4") {
      return (
        <View style={styles.carouselItem}>
          <Video
            source={{ uri: fileUrl }}
            style={styles.media}
            controls={true}
            resizeMode="cover"
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.carouselItem, styles.unsupportedFile]}>
          <Icon name="broken-image" size={40} color={COLORS.muted} />
          <Text style={styles.caption}>
            Неподдерживаемый формат: {file.mimetype}
          </Text>
        </View>
      );
    }
  };

  return (
    <Modal
      visible={serviceDetailsModalVisible}
      animationType="fade"
      transparent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.serviceDetailsModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Детали {isService ? "услуги" : "элемента"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setServiceDetailsModalVisible(false);
                setSelectedService(null);
                setSelectedItem(null);
                setFiles([]);
                setSelectedImage(null);
                setActiveSlide(0);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.detailScrollContainer}>
            <View style={styles.mediaSection}>
              {loadingFiles ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={styles.loader}
                />
              ) : errorFiles ? (
                <Text style={styles.errorText}>{errorFiles}</Text>
              ) : files && files.length > 0 ? (
                <View>
                  <FlatList
                    data={files}
                    renderItem={renderFileItem}
                    keyExtractor={(file) => file.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={screenWidth - 32}
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
                            activeSlide === index
                              ? styles.paginationActiveDot
                              : styles.paginationInactiveDot,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noFilesContainer}>
                  <Icon
                    name="image-not-supported"
                    size={50}
                    color={COLORS.muted}
                  />
                  <Text style={styles.noFilesText}>
                    Изображения или видео отсутствуют
                  </Text>
                </View>
              )}
            </View>
            {loadingServiceDetails ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : data ? (
              <View style={styles.detailContainer}>
                {Object.entries(fieldLabels).map(([key, label]) => {
                  const value = data[key];
                  if (value === undefined || value === null) return null;
                  const displayValue =
                    key === "cost" || key === "averageCost" || key === "total_cost"
                      ? `${value} ₸`
                      : typeof value === "object"
                      ? JSON.stringify(value)
                      : value;
                  return (
                    <View key={key} style={styles.detail}>
                      <Text style={styles.detailLabel}>{label}</Text>
                      <Text style={styles.detailValue}>{displayValue}</Text>
                    </View>
                  );
                })}
                {Object.entries(data).map(([key, value]) => {
                  if (
                    fieldLabels[key] ||
                    typeof value === "function" ||
                    key.startsWith("_") ||
                    value === null ||
                    value === undefined ||
                    [
                      "id",
                      "serviceId",
                      "item_id",
                      "originalServiceType",
                      "supplier_id",
                      "wedding_id",
                      "created_at",
                      "updated_at",
                    ].includes(key.toLowerCase())
                  )
                    return null;
                  const displayValue =
                    typeof value === "object" ? JSON.stringify(value) : value;
                  return (
                    <View key={key} style={styles.detail}>
                      <Text style={styles.detailLabel}>{key}</Text>
                      <Text style={styles.detailValue}>{displayValue}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noItems}>Детали недоступны</Text>
            )}
          </ScrollView>
          {files && files.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Фотографии</Text>
              <FlatList
                horizontal
                data={files}
                keyExtractor={(file) => file.id.toString()}
                renderItem={({ item: file, index }) => (
                  <TouchableOpacity onPress={() => openPhotoModal(files, index)}>
                    <Image
                      source={{ uri: `${BASE_URL}/${file.path}` }}
                      style={styles.thumbnail}
                    />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: COLORS.error }]}
            onPress={() => {
              setServiceDetailsModalVisible(false);
              setSelectedService(null);
              setSelectedItem(null);
              setFiles([]);
              setSelectedImage(null);
              setActiveSlide(0);
            }}
          >
            <Text style={styles.createButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
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
                unfilledColor: COLORS.muted,
                width: null,
              }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

export default ServiceDetailsModal;