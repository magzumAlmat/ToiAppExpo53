import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,Modal
} from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Calendar } from "react-native-calendars";
import api from "../api/api";
import { COLORS, typesMapping, typeOrder } from "./ConstantsComponent";

const CreateWeddingModal = ({
  visible,
  onClose,
  weddingName,
  setWeddingName,
  weddingDate,
  setWeddingDate,
  showDatePicker,
  setShowDatePicker,
  filteredData,
  quantities,
  guestCount,
  budget,
  remainingBudget,
  blockedDays,
  user,
  token,
  navigation,
  calculateTotalCost,
}) => {
  const handleSubmit = async () => {
    if (!weddingName.trim()) {
      alert("Пожалуйста, укажите название свадьбы");
      return;
    }
    if (!filteredData.length) {
      alert("Пожалуйста, выберите хотя бы один элемент для свадьбы");
      return;
    }
    if (!user?.id || !token) {
      alert("Ошибка авторизации. Пожалуйста, войдите в систему.");
      navigation.navigate("Login");
      return;
    }
    const dateString = weddingDate.toISOString().split("T")[0];
    const restaurantItem = filteredData.find((item) => item.type === "restaurant");
    if (restaurantItem && blockedDays[dateString]) {
      const isRestaurantBlocked = blockedDays[dateString].dots.some(
        (dot) => dot.restaurantId === restaurantItem.id
      );
      if (isRestaurantBlocked) {
        alert(
          `Дата ${dateString} уже забронирована для ресторана ${restaurantItem.name}. Пожалуйста, выберите другую дату.`
        );
        return;
      }
    }
    const weddingData = {
      name: weddingName.trim(),
      date: dateString,
      host_id: user.id,
      items: filteredData.map((item) => {
        const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
        const effectiveQuantity = item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : quantity;
        const cost = item.type === "restaurant" ? item.averageCost : item.cost;
        return {
          id: item.id,
          type: item.type,
          quantity: effectiveQuantity,
          totalCost: cost * effectiveQuantity,
        };
      }),
    };
    try {
      await api.createWedding(weddingData, token);
      alert("Свадьба успешно создана!");
      onClose();
    } catch (error) {
      console.error("Ошибка при создании свадьбы:", error);
      alert("Ошибка: " + (error.response?.data?.error || error.message));
    }
  };

  const onDateChange = (day) => {
    setWeddingDate(new Date(day.timestamp));
    setShowDatePicker(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <Animatable.View
          style={styles.modalContent}
          animation="zoomIn"
          duration={300}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Создание мероприятия "Свадьба"</Text>
              <TouchableOpacity style={styles.addModalCloseIcon} onPress={onClose}>
                <Icon name="close" size={30} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Icon
                name="event-note"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Имя свадьбы (например, Свадьба Ивана и Марии)"
                value={weddingName}
                onChangeText={setWeddingName}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon
                name="calendar-today"
                size={20}
                color={COLORS.secondary}
                style={styles.buttonIcon}
              />
              <Text style={styles.dateButtonText}>
                {weddingDate.toLocaleDateString("ru-RU") || "Выберите дату свадьбы"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <Calendar
                style={styles.calendar}
                current={weddingDate.toISOString().split("T")[0]}
                onDayPress={onDateChange}
                minDate={new Date().toISOString().split("T")[0]}
                theme={{
                  selectedDayBackgroundColor: COLORS.primary,
                  todayTextColor: COLORS.accent,
                  arrowColor: COLORS.secondary,
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />
            )}
            <Text style={styles.subtitle}>Выбранные элементы:</Text>
            <View style={styles.itemsContainer}>
              {filteredData.length > 0 ? (
                Object.entries(
                  filteredData.reduce((acc, item) => {
                    const type = item.type;
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(item);
                    return acc;
                  }, {})
                )
                  .sort(([typeA], [typeB]) => (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11))
                  .map(([type, items]) => (
                    <View key={type}>
                      <Text style={styles.categoryHeader}>
                        {typesMapping.find((t) => t.type === type)?.label || type} ({items.length})
                      </Text>
                      {items.map((item) => {
                        const quantity = parseInt(quantities[`${item.type}-${item.id}`] || "1");
                        const cost = item.type === "restaurant" ? item.averageCost : item.cost;
                        const effectiveQuantity = item.type === "restaurant" ? parseInt(guestCount, 10) || 1 : quantity;
                        const totalItemCost = cost * effectiveQuantity;
                        return (
                          <View
                            key={`${item.type}-${item.id}`}
                            style={styles.itemContainer}
                          >
                            <Icon
                              name={
                                item.type === "restaurant"
                                  ? "restaurant"
                                  : item.type === "clothing"
                                  ? "store"
                                  : item.type === "tamada"
                                  ? "mic"
                                  : item.type === "program"
                                  ? "event"
                                  : item.type === "traditionalGift"
                                  ? "card-giftcard"
                                  : item.type === "flowers"
                                  ? "local-florist"
                                  : item.type === "cake"
                                  ? "cake"
                                  : item.type === "alcohol"
                                  ? "local-drink"
                                  : item.type === "transport"
                                  ? "directions-car"
                                  : item.type === "jewelry"
                                  ? "diamond"
                                  : "shopping-bag"
                              }
                              size={18}
                              color={COLORS.primary}
                              style={styles.itemIcon}
                            />
                            <Text style={styles.itemText}>
                              {(() => {
                                switch (item.type) {
                                  case "restaurant":
                                    return `${item.name} (${item.cuisine}) - ${cost} тг x ${effectiveQuantity} гостей = ${totalItemCost} тг`;
                                  case "clothing":
                                    return `${item.itemName} (${item.storeName}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "tamada":
                                    return `${item.name} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "program":
                                    return `${item.teamName} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "traditionalGift":
                                    return `${item.itemName} (${item.salonName || "Не указано"}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "flowers":
                                    return `${item.flowerName} (${item.flowerType}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "cake":
                                    return `${item.name} (${item.cakeType}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "alcohol":
                                    return `${item.alcoholName} (${item.category}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "transport":
                                    return `${item.carName} (${item.brand}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "goods":
                                    return `${item.item_name} - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  case "jewelry":
                                    return `${item.itemName} (${item.storeName}) - ${cost} тг x ${effectiveQuantity} = ${totalItemCost} тг`;
                                  default:
                                    return "Неизвестный элемент";
                                }
                              })()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))
              ) : (
                <Text style={styles.noItems}>Выберите элементы для свадьбы</Text>
              )}
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Общая стоимость: {calculateTotalCost().toLocaleString("ru-RU")} тг
              </Text>
            </View>
            <Text style={styles.totalText}>
              {filteredData.length > 0
                ? `Ваш бюджет (${parseFloat(budget).toLocaleString("ru-RU")} ₸)`
                : " "}
            </Text>
            {filteredData.length > 0 && (
              <Text
                style={[styles.budgetInfo, remainingBudget < 0 && styles.budgetError]}
              >
                Остаток: {remainingBudget.toLocaleString("ru-RU")} ₸{" "}
                {remainingBudget < 0 && "(превышение)"}
              </Text>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmit}
              >
                <Icon
                  name="check"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.modalButtonText}>Создать свадьбу</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animatable.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: "90%",
    // maxHeight: SCREEN_HEIGHT * 0.8,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollViewContent: { paddingBottom: 20 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  addModalCloseIcon: { padding: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  buttonIcon: { marginRight: 10 },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  calendar: { borderRadius: 10, marginBottom: 15 },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  itemsContainer: { marginBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemIcon: { marginRight: 10 },
  itemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  noItems: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  totalContainer: { marginBottom: 10 },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  budgetInfo: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  budgetError: { color: COLORS.error },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  confirmButton: { backgroundColor: COLORS.primary },
  modalButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default CreateWeddingModal;