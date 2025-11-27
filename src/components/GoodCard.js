import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Linking from "expo-linking"; // Import Linking

const GoodCard = ({
  item,
  selectedGoodIds,
  setSelectedGoodIds,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => (
  <TouchableOpacity
    style={[
      styles.goodCard,
      selectedGoodIds.includes(item.id) && styles.selectedGoodCard,
    ]}
    onPress={() => {
      setSelectedGoodIds((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    }}
  >
    <Text style={styles.goodCardTitle}>{item.item_name}</Text>
    <Text style={styles.goodCardCategory}>Категория: {item.category}</Text>
    <Text style={styles.goodCardCost}>
      {item.cost ? `Цена: ${item.cost}` : "Цена не указана"}
    </Text>
    {item.specs?.goodLink && (
      <TouchableOpacity onPress={() => Linking.openURL(item.specs.goodLink)}>
        <Text style={styles.linkText}>Открыть ссылку</Text>
      </TouchableOpacity>
    )}
    {selectedGoodIds.includes(item.id) && (
      <Text style={styles.selectedIndicator}>✓</Text>
    )}
  </TouchableOpacity>
);

export default GoodCard;
