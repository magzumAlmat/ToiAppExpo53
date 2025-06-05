// import React from 'react';
// import { Text, StyleSheet } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { COLORS } from '../constants/colors';

// const Header = () => {
//   return (
//     <LinearGradient
//       colors={[COLORS.gradientStart, COLORS.gradientEnd]}
//       style={styles.headerGradient}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <Text style={styles.headerTitle}>Планируйте свою свадьбу</Text>
//       <Text style={styles.headerSubtitle}>Создайте идеальный день с легкостью</Text>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   headerGradient: {
//     padding: 24,
//     borderRadius: 16,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: COLORS.white,
//     textAlign: 'center',
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: COLORS.white,
//     opacity: 0.9,
//     marginTop: 8,
//   },
// });

// export default Header;



// import React from 'react';
// import { View, Text } from 'react-native';

// const Header = () => {
//   return (
//     <View style={{ backgroundColor: '#4c669f', padding: 20 }}>
//       <Text style={{ color: '#fff', fontSize: 20 }}>Header</Text>
//     </View>
//   );
// };

// export default Header;











import React from "react";
import { View, TextInput, Modal, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Ensure correct import
import { COLORS } from "../components/ConstantsComponent"; // Corrected import path (lowercase 'constants')
import { formatBudget } from "../components/utils"; // Import formatBudget if defined in utils.js

const Header = ({
  budget,
  guestCount,
  handleBudgetChange,
  handleGuestCountChange,
  setAddItemModalVisible,
  isLoading,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.budgetContainer}>
        <View style={styles.categoryItemAdd}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setAddItemModalVisible(true)}
          >
            <LinearGradient
              colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]}
              style={styles.categoryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.categoryPlusText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.budgetInput}
          placeholder="Бюджет (т)"
          value={budget ? formatBudget(budget) : ""} // Ensure budget is defined
          onChangeText={handleBudgetChange}
          keyboardType="numeric"
          maxLength={18}
          returnKeyType="done"
          placeholderTextColor={COLORS.white}
        />
        <TextInput
          style={styles.guestInput}
          placeholder="Гостей"
          value={guestCount || ""} // Ensure guestCount is defined
          onChangeText={handleGuestCountChange}
          keyboardType="numeric"
          maxLength={18}
          returnKeyType="done"
          placeholderTextColor={COLORS.white}
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!isLoading} // Ensure isLoading is boolean
        onRequestClose={() => {}}
      >
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Загрузка...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryItemAdd: {
    width: "20%",
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
  budgetInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    color: COLORS.white,
    fontSize: 16,
  },
  guestInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: COLORS.white,
    fontSize: 16,
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  loaderContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});

export default Header;