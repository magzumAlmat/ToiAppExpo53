import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const EventCategoryItem = ({
  item,
  categoryServicesCache,
  groupItemsByCategory,
  openServiceDetailsModal,
  openEditCategoryModal,
  setActiveEvent,
  setWishlistModalVisible,
  fetchWishlistItems,
  handleDeleteEventCategory,
  handleShareEventLink,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => {
  const filteredServices = categoryServicesCache[item.id] || [];
  const eventServices = item.EventServices || [];

  const allServices = [
    ...filteredServices,
    ...eventServices
      .filter(
        (es) => !filteredServices.some((fs) => fs.serviceId === es.serviceId && fs.serviceType === es.serviceType)
      )
      .map((es) => ({
        id: es.serviceId,
        name: `Service ${es.serviceId}`,
        serviceType: es.serviceType,
        serviceId: es.serviceId,
        cost: null,
      })),
  ];

  const groupedServices = groupItemsByCategory(allServices);

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.name} 
      </Text>
      <Text style={styles.itemSubText}>
      </Text>
      {groupedServices.length > 0 ? (
        <View style={styles.weddingItemsContainer}>
          {groupedServices.map((group) => (
            <View key={group.name} style={styles.categorySection}>
           
              <FlatList
                data={group.items}
                renderItem={({ item: service }) => (
                  <View
                    key={`${service.serviceType}-${service.serviceId}`}
                    style={styles.weddingItem}
                  >
                    <Text style={styles.subItemText}>
                      {group.name}
                    </Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => openServiceDetailsModal(service)}
                      >
                        <Text style={styles.detailsButtonText}>Подробнее</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                keyExtractor={(service, index) =>
                  `${service.serviceType}-${service.serviceId}-${index}`
                }
                contentContainerStyle={{ paddingBottom: 8 }}
                initialNumToRender={20}
                windowSize={10}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyItemsContainer}>
          <Text style={styles.noItems}>Нет услуг для этой категории</Text>
          <TouchableOpacity
            style={styles.addItemsButton}
            onPress={() => openEditCategoryModal(item)}
          >
            <Text style={styles.addItemsButtonText}>Добавить услуги</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => {
            setActiveEvent(item); // Set current event for wishlist context
            setWishlistModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>Добавить подарок</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonAccent}
          onPress={() => {
            setActiveEvent(item); // Set current event for wishlist context
            fetchWishlistItems(item.id);
          }}
        >
          <Text style={styles.actionButtonText}>Просмотреть подарки</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonError}
          onPress={() => handleDeleteEventCategory(item.id)}
        >
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonPrimary}
          onPress={() => handleShareEventLink(item.id)} // Use handleShareEventLink
        >
          <Text style={styles.actionButtonText}>Поделиться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCategoryItem;
