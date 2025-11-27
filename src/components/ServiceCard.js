import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ServiceCard = ({
  item,
  categoryServices,
  setCategoryServices,
  openServiceDetailsModal,
  isInCategoryView, // New prop to distinguish usage
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => {
  const isSelected = categoryServices?.some(
    (s) => s.id === item.id && s.serviceType === item.serviceType
  );

  const handlePress = () => {
    if (isInCategoryView) {
      // In category details view, clicking opens details
      openServiceDetailsModal(item);
    } else {
      // In category edit view, clicking toggles selection
      setCategoryServices((prev) => {
        const exists = prev.some(
          (s) => s.id === item.id && s.serviceType === item.serviceType
        );
        if (exists) {
          return prev.filter(
            (s) => !(s.id === item.id && s.serviceType === item.serviceType)
          );
        }
        return [
          ...prev,
          { id: item.id, serviceType: item.serviceType, name: item.name },
        ];
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        !isInCategoryView && isSelected && styles.selectedServiceCard,
      ]}
      onPress={handlePress}
    >
      <Text style={styles.serviceCardTitle}>{item.name}</Text>
      <Text style={styles.serviceCardDescription}>
        {item.description || "Нет описания"}
      </Text>
      <Text style={styles.serviceCardType}>Тип: {item.serviceType}</Text>
      {isInCategoryView && (
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => openServiceDetailsModal(item)}
        >
          <Text style={styles.detailsButtonText}>Подробнее</Text>
        </TouchableOpacity>
      )}
      {!isInCategoryView && isSelected && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

export default ServiceCard;
