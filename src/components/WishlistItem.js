import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import * as Linking from "expo-linking"; // Import Linking

const WishlistItem = ({
  item,
  wishlistFiles,
  handleReserveWishlistItem,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => {
  const files = wishlistFiles[item.good_id] || [];
  return (
    <View style={styles.wishlistCard}>
      <View style={styles.wishlistCardContent}>
        <Text
          style={[
            styles.wishlistTitle,
            item.is_reserved && styles.strikethroughText,
          ]}
        >
          {item.item_name}
        </Text>
        <Text style={styles.wishlistStatus}>
          {item.is_reserved
            ? `Кто подарит: ${
                item.Reserver?.username || item.reserved_by_unknown
              }`
            : "Свободно"}
        </Text>
        {item.goodLink && (
          <TouchableOpacity onPress={() => Linking.openURL(item.goodLink)}>
            <Text style={styles.linkText}>Открыть ссылку</Text>
          </TouchableOpacity>
        )}
        {!item.is_reserved && (
          <Button
            title="Зарезервировать"
            onPress={() => handleReserveWishlistItem(item.id)}
            color={COLORS.primary}
          />
        )}
      </View>
    </View>
  );
};

export default WishlistItem;
