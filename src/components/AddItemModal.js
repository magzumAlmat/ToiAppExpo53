import React, { useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Icon from "react-native-vector-icons/MaterialIcons";

const MODAL_COLORS = {
  icon: "#666",
  closeButtonColor: "#666",
};

const typeToCategoryMap = {
  restaurant: "Рестораны",
  hotels: "Гостиницы",
  tamada: "Ведущие",
  program: "Шоу программы",
  flowers: "Цветы",
  transport: "Прокат авто",
  cake: "Торты",
  alcohol: "Алкоголь",
  jewelry: "Ювелирные изделия",
  typography: "Типография",
  "technical-equipment-rental": "Аренда оборудования",
  "event-category": "Категория мероприятия",
};

const AddItemModal = ({
  visible,
  onClose,
  filteredItems,
  filteredData,
  handleAddItem,
  setDetailsModalVisible,
  setSelectedItem,
  quantities,
  updateCategories,
}) => {
  const renderAddItem = useCallback(
    ({ item }) => {
      if (!item || !item.type || !item.id) {
        console.warn("Некорректный элемент в renderAddItem:", item);
        return null;
      }

      const count = filteredData.filter(
        (selectedItem) =>
          `${selectedItem.type}-${selectedItem.id}` === `${item.type}-${item.id}`
      ).length;
      const cost = item.type === "restaurant" ? item.averageCost : item.cost;
      let title;
      switch (item.type) {
        case "restaurant":
          title = `Ресторан: ${item.name} (${cost} ₸)`;
          break;
        case "hotels":
          title = `Гостиница: ${item.name} (${cost} ₸)`;
          break;
        case "tamada":
          title = `Ведущий: ${item.name} (${cost} ₸)`;
          break;
        case "program":
          title = `Шоу программа: ${item.teamName} (${cost} ₸)`;
          break;
        case "flowers":
          title = `Цветы: ${item.salonName} - ${item.flowerName} (${cost} ₸)`;
          break;
        case "transport":
          title = `Прокат авто: ${item.salonName} - ${item.carName} (${cost} ₸)`;
          break;
        case "cake":
          title = `Торты: ${item.name} (${cost} ₸)`;
          break;
        case "alcohol":
          title = `Алкоголь: ${item.salonName} - ${item.alcoholName} (${cost} ₸)`;
          break;
        case "jewelry":
          title = `Ювелирные изделия: ${item.storeName} - ${item.itemName} (${cost} ₸)`;
          break;
        case "typography":
          title = `Типография: ${item.name || item.itemName} (${cost} ₸)`;
          break;
        case "technical-equipment-rental":
          title = `Аренда оборудования: ${item.name || item.itemName} (${cost} ₸)`;
          break;
        case "event-category":
          title = `Категория мероприятия: ${item.name || item.category} (${cost} ₸)`;
          break;
        default:
          title = `Неизвестный элемент: ${item.name || item.itemName} (${cost} ₸)`;
      }
      return (
        <View style={styles.addModalItemCard}>
          <TouchableOpacity
            style={styles.addModalItemContent}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleAddItem(item);
              const category = typeToCategoryMap[item.type];
              if (category) {
                updateCategories(category);
              }
            }}
          >
            <Text style={styles.addModalItemText}>{title}</Text>
            {count > 0 && (
              <Text style={styles.addModalItemCount}>Добавлено: {count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsIconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedItem(item);
              setDetailsModalVisible(true);
            }}
          >
            <Icon name="search" size={20} color={MODAL_COLORS.icon} />
          </TouchableOpacity>
        </View>
      );
    },
    [
      filteredData,
      handleAddItem,
      setDetailsModalVisible,
      setSelectedItem,
      updateCategories,
    ]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.addModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить элементы</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Icon name="close" size={24} color={MODAL_COLORS.closeButtonColor} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredItems}
            renderItem={renderAddItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={styles.addModalList}
          />
        </View>
      </View>
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
  addModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalCloseButton: {
    padding: 8,
  },
  addModalList: {
    padding: 16,
  },
  addModalItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  addModalItemContent: {
    flex: 1,
  },
  addModalItemText: {
    fontSize: 16,
    color: "#333",
  },
  addModalItemCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  detailsIconButton: {
    padding: 8,
  },
});

export default AddItemModal;