import React from "react";
import { View, StyleSheet } from "react-native";
import CategoryItem from "./CategoryItem";
import { typeOrder, categoryToTypeMap } from "./ConstantsComponent";

const CategoryList = ({
  categories,
  disabledCategories,
  handleCategoryPress,
  handleRemoveCategory,
}) => {
  const sortedCategories = [...categories].sort((a, b) => {
    const typeA = categoryToTypeMap[a];
    const typeB = categoryToTypeMap[b];
    return (typeOrder[typeA] || 11) - (typeOrder[typeB] || 11);
  });

  return (
    <View style={styles.categoryGrid}>
      {sortedCategories.map((item, index) => (
        <View key={index} style={styles.categoryItem}>
          <CategoryItem
            category={item}
            isDisabled={disabledCategories.includes(item)}
            onPress={handleCategoryPress}
            onRemove={handleRemoveCategory}
          />
        </View>
      ))}
      <View style={styles.categoryItem}>
        <CategoryItem
          category="Добавить"
          onPress={() => {}}
          onRemove={() => {}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: "column",
    alignItems: "center",
  },
  categoryItem: {
    width: "100%",
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CategoryList;