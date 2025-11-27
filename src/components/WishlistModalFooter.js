import React from "react";
import { View, Button, StyleSheet } from "react-native";

const WishlistModalFooter = ({
  isCustomGift,
  handleAddWishlistItem,
  selectedGoodIds,
  setWishlistModalVisible,
  setSelectedGoodIds,
  setIsCustomGift,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) =>
  !isCustomGift && (
    <View style={styles.buttonRowModal}>
      <Button
        title="Добавить выбранные"
        onPress={handleAddWishlistItem}
        color={COLORS.primary}
        disabled={selectedGoodIds.length === 0}
      />
      <Button
        title="Отмена"
        onPress={() => {
          setWishlistModalVisible(false);
          setSelectedGoodIds([]);
          setIsCustomGift(false);
        }}
        color={COLORS.error}
      />
    </View>
  );

export default WishlistModalFooter;
