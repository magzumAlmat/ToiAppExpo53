import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EventItem = ({
  item,
  eventItemsCache,
  groupItemsByCategory,
  openDetailsModal,
  handleDeleteEventItem,
  navigation,
  setActiveEvent,
  setWishlistModalVisible,
  fetchWishlistItems,
  handleDeleteEvent,
  handleShareEventLink,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => {
  const filteredItems = eventItemsCache[item.id] || [];
  const groupedItems = groupItemsByCategory(filteredItems);
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.name}
      </Text>
      {groupedItems.length > 0 ? (
        <View style={styles.weddingItemsContainer}>
          {groupedItems.map((category) => (
            <View key={category.name} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.name}</Text>
              {category.items.map((eventItem) => (
                <View
                  key={`${eventItem.item_type}-${eventItem.id}`}
                  style={styles.weddingItem}
                >
                  <Text style={styles.subItemText}>
                    {(() => {
                      const actualEventItem =
                        eventItem.dataValues || eventItem;
                      switch (actualEventItem.item_type) {
                        case "restaurants":
                        case "restaurant":
                          return `Ресторан - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "clothing":
                          return `Одежда - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "tamada":
                          return `Тамада - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "program":
                          return `Программа - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "traditionalGift":
                          return `Традиционный подарок - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "flowers":
                        case "flower":
                          return `Цветы - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "cakes":
                        case "cake":
                          return `Торт - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "alcohol":
                          return `Алкоголь - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "transport":
                          return `Транспорт - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "goods":
                        case "good":
                          return `Товар - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        case "jewelry":
                          return `Ювелирные изделия - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                        default:
                          return `Неизвестный элемент - ${
                            actualEventItem.total_cost || 0
                          } тг`;
                      }
                    })()}
                  </Text>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => openDetailsModal(eventItem)}
                    >
                      <Text style={styles.detailsButtonText}>Подробнее</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteEventItem(eventItem.id)}
                    >
                      <Text style={styles.deleteButtonText}>Удалить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyItemsContainer}>
          <Text style={styles.noItems}>Нет элементов для этого события</Text>
          <TouchableOpacity
            style={styles.addItemsButton}
            onPress={() => {
              navigation.navigate("AddEventItemsScreen", {
                eventId: item.id,
              });
            }}
          >
            <Text style={styles.addItemsButtonText}>Добавить элементы</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => {
            setActiveEvent(item);
            setWishlistModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>Добавить подарок</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonAccent}
          onPress={() => {
            setActiveEvent(item);
            fetchWishlistItems(item.id);
          }}
        >
          <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonError}
          onPress={() => handleDeleteEvent(item.id)}
        >
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonPrimary}
          onPress={() => handleShareEventLink(item.id)}
        >
          <Text style={styles.actionButtonText}>Поделиться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventItem;
