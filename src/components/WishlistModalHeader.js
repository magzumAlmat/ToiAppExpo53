import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, SafeAreaView } from "react-native";

const WishlistModalHeader = ({
  isCustomGift,
  setIsCustomGift,
  formData,
  setFormData,
  handleAddCustomGift,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => (
  <SafeAreaView>
    <View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Добавить собственный подарок</Text>
        <TouchableOpacity
          style={[styles.switch, isCustomGift && styles.switchActive]}
          onPress={() => setIsCustomGift(!isCustomGift)}
        >
          <Text style={styles.switchText}>{isCustomGift ? "Вкл" : "Выкл"}</Text>
        </TouchableOpacity>
      </View>
      {isCustomGift && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Название подарка"
            placeholderTextColor={COLORS.muted}
            value={formData.item_name}
            onChangeText={(text) =>
              setFormData({ ...formData, item_name: text })
            }
          />
          <Button
            title="Добавить"
            onPress={handleAddCustomGift}
            color={COLORS.primary}
          />
        </>
      )}
    </View>
  </SafeAreaView>
);

export default WishlistModalHeader;
