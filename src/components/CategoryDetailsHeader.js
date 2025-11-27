import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const CategoryDetailsHeader = ({
  loadingDetails,
  categoryDetails,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => (
  <View>
    <Text style={styles.subtitle}>Детали категории</Text>
    {loadingDetails ? (
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.loader}
      />
    ) : categoryDetails ? (
      <View>
        {Object.entries(categoryDetails).map(([key, value]) => {
          if (key === "services") return null;
          const displayValue =
            typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : value || "Не указано";
          return (
            <View key={key} style={styles.detailContainer}>
              <Text style={styles.detailLabel}>{key}</Text>
              <Text style={styles.detailValue}>{displayValue}</Text>
            </View>
          );
        })}
        <Text style={styles.sectionTitle}>Услуги</Text>
      </View>
    ) : (
      <Text style={styles.noItems}>Детали недоступны</Text>
    )}
  </View>
);

export default CategoryDetailsHeader;
