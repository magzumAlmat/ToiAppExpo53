import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, categoryIcons } from "./ConstantsComponent";

const CategoryItem = ({ category, isDisabled, onPress, onRemove }) => {
  if (category === "Добавить") {
    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity style={styles.categoryButton} onPress={onPress}>
          <LinearGradient
            colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
            style={styles.categoryButtonGradient}
          >
            <Text style={styles.categoryPlusText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.categoryRow}>
      <TouchableOpacity
        style={styles.removeCategoryButton}
        onPress={() => onRemove(category)}
      >
        <Image
          source={isDisabled ? categoryIcons[category]?.on : categoryIcons[category]?.off}
          style={{ width: 60, height: 70 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.categoryButton, isDisabled && styles.disabledCategoryButton]}
        onPress={() => !isDisabled && onPress(category)}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
          style={styles.categoryButtonGradient}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name={
                category === "Ресторан"
                  ? "restaurant"
                  : category === "Прокат авто"
                  ? "directions-car"
                  : category === "Фото-видео съёмка"
                  ? "camera-alt"
                  : category === "Ведущий"
                  ? "mic"
                  : category === "Традиционные подарки"
                  ? "card-giftcard"
                  : category === "Свадебный салон"
                  ? "store"
                  : category === "Алкоголь"
                  ? "local-drink"
                  : category === "Ювелирные изделия"
                  ? "diamond"
                  : category === "Торты"
                  ? "cake"
                  : "category"
              }
              size={20}
              color={COLORS.white}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeCategoryButton: {
    marginRight: 10,
  },
  categoryButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#5A4032",
    borderRadius: 10,
  },
  categoryPlusText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  disabledCategoryButton: {
    opacity: 0.5,
  },
});

export default CategoryItem;