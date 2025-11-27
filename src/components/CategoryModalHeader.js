import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const CategoryModalHeader = ({
  selectedCategory,
  categoryName,
  setCategoryName,
  categoryDescription,
  setCategoryDescription,
  categoryStatus,
  setCategoryStatus,
  servicesError,
  styles, // Pass styles as prop
  COLORS, // Pass COLORS as prop
}) => (
  <View>
    <Text style={styles.subtitle}>
      {selectedCategory ? "Редактировать категорию" : "Создать категорию"}
    </Text>
    <TextInput
      style={styles.input}
      placeholder="Название категории"
      placeholderTextColor={COLORS.muted}
      value={categoryName}
      onChangeText={setCategoryName}
    />
    <TextInput
      style={[styles.input, styles.multilineInput]}
      placeholder="Описание категории"
      placeholderTextColor={COLORS.muted}
      value={categoryDescription}
      onChangeText={setCategoryDescription}
      multiline
      numberOfLines={4}
    />
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Статус</Text>
      <Picker
        selectedValue={categoryStatus}
        onValueChange={(value) => setCategoryStatus(value)}
        style={styles.picker}
      >
        <Picker.Item label="Активно" value="active" />
        <Picker.Item label="Неактивно" value="inactive" />
      </Picker>
    </View>
    <Text style={styles.sectionTitle}>Выберите услуги</Text>
    {servicesError && <Text style={styles.errorText}>{servicesError}</Text>}
  </View>
);

export default CategoryModalHeader;
