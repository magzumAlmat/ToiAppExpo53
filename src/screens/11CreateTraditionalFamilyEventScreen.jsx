// ============================================
// ФИНАЛЬНЫЙ КОД-СНИППЕТ ДЛЯ УНИФИКАЦИИ
// CreateTraditionalEventScreen под стиль HomeScreen
// ============================================

// 1. ГЛАВНЫЙ RETURN КОМПОНЕНТА
// Замените весь return в CreateTraditionalEventScreen на этот:

return (
  <>
    <LinearGradient 
      colors={["#F1EBDD", "#897066"]} 
      start={{ x: 0, y: 1 }} 
      end={{ x: 0, y: 0 }} 
      style={styles.splashContainer}
    >
      {/* Кнопка назад */}
      <TouchableOpacity 
        style={styles.backButtonTop} 
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>

      {/* Логотип */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../../assets/kazanRevert.png")} 
          style={styles.potIcon} 
          resizeMode="contain" 
        />
      </View>

      {/* Footer паттерн */}
      <Image 
        source={require("../../assets/footer.png")} 
        style={styles.topPatternContainer} 
      />

      {/* Заголовок с полями ввода */}
      <View style={styles.headerContainer}>
        <View style={styles.budgetContainer}>
          {/* Кнопка добавить */}
          <View style={styles.categoryItemAdd}>
            <TouchableOpacity 
              style={styles.categoryButtonAdd} 
              onPress={() => setAddItemModalVisible(true)}
            >
              <LinearGradient 
                colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} 
                style={styles.categoryButtonGradient}
              >
                <Text style={styles.categoryPlusText}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Поле бюджета */}
          <TextInput
            style={styles.budgetInput}
            placeholder="Бюджет (т)"
            value={formatBudget(budget)}
            onChangeText={handleBudgetChange}
            placeholderTextColor={COLORS.placeholder}
            keyboardType="numeric"
            maxLength={18}
          />

          {/* Поле количества гостей */}
          <TextInput
            style={styles.guestInput}
            placeholder="Гостей"
            value={guestCount}
            onChangeText={handleGuestCountChange}
            placeholderTextColor={COLORS.placeholder}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        {/* Loader modal */}
        <Modal 
          animationType="fade" 
          transparent={true} 
          visible={isLoading} 
          onRequestClose={() => {}}
        >
          <View style={styles.loaderOverlay}>
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Подбираем...</Text>
            </View>
          </View>
        </Modal>
      </View>

      {/* Список категорий */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.categoryGrid}>
              {categories.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  {renderCategory(item)}
                </View>
              ))}
            </View>
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
      </View>

      {/* Кнопка создать мероприятие */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleSubmit}
          disabled={filteredData.length === 0 && !budget && !guestCount}
        >
          <Image 
            source={require("../../assets/next.png")} 
            style={styles.potIcon3} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
      </View>

      {/* Модальные окна */}
      <AddItemModal
        visible={addItemModalVisible}
        onClose={() => setAddItemModalVisible(false)}
        filteredItems={combinedData}
        filteredData={filteredData}
        handleAddItem={handleAddItem}
        setDetailsModalVisible={setDetailsModalVisible}
        setSelectedItem={setSelectedItem}
        quantities={quantities}
        updateCategories={updateCategories}
      />

      <CategoryItemsModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        categoryItems={selectedCategoryItems}
        categoryLabel={selectedCategoryLabel}
        categoryType={selectedCategoryType}
        filteredData={filteredData}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        setDetailsModalVisible={setDetailsModalVisible}
        setSelectedItem={setSelectedItem}
        quantities={quantities}
        setQuantities={setQuantities}
        budget={budget}
        setFilteredData={setFilteredData}
        setRemainingBudget={setRemainingBudget}
        updateCategories={updateCategories}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
      />

      <AddCategoryModal
        visible={addCategoryModalVisible}
        onClose={() => setAddCategoryModalVisible(false)}
        onAddCategory={handleAddCategory}
      />

      <DetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        item={selectedItem}
      />
    </LinearGradient>
  </>
);

// ============================================
// 2. ФУНКЦИЯ renderCategory
// Добавьте или обновите эту функцию:
// ============================================

const renderCategory = (item) => {
  if (item === "Добавить") {
    return (
      <View style={styles.categoryRow}>
        <TouchableOpacity 
          style={styles.categoryButtonAdd} 
          onPress={() => setAddItemModalVisible(true)}
        >
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

  const itemsForCategory = filteredData.filter((dataItem) => {
    const category = typeToCategoryMap[dataItem.type];
    return category === item;
  });

  const isDisabled = disabledCategories.includes(item);

  return (
    <View style={styles.categoryRow}>
      <TouchableOpacity
        style={[styles.categoryButton, isDisabled && styles.disabledCategoryButton]}
        onPress={() => { if (!isDisabled) handleCategoryPress(item); }}
        disabled={isDisabled}
      >
        <LinearGradient 
          colors={[COLORS.buttonGradientStart, COLORS.buttonGradientEnd]} 
          style={styles.categoryButtonGradient}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name={
                item === "Ресторан" ? "restaurant" :
                item === "Прокат авто" ? "directions-car" :
                item === "Ведущий" ? "mic" :
                item === "Традиционные подарки" ? "card-giftcard" :
                item === "Алкоголь" ? "local-drink" :
                item === "Ювелирные изделия" ? "diamond" :
                item === "Торты" ? "cake" :
                "category"
              }
              size={20}
              color={COLORS.white}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.categoryText}>
              {item} {itemsForCategory.length > 0 ? `(${itemsForCategory.length})` : ""}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// 3. СТИЛИ - ЗАМЕНИТЕ ИЛИ ДОБАВЬТЕ ЭТИ СТИЛИ
// ============================================

const styles = StyleSheet.create({
  // Основной контейнер
  splashContainer: { 
    flex: 1 
  },

  // Loader
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODAL_COLORS.overlayBackground,
  },
  loaderContainer: {
    backgroundColor: MODAL_COLORS.cardBackground,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: MODAL_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 17,
    color: MODAL_COLORS.textPrimary,
    fontWeight: "500",
  },

  // Кнопка назад
  backButtonTop: {
    marginTop: "15%",
    marginLeft: "2%",
  },

  // Логотип
  logoContainer: {
    alignItems: "center",
    marginVertical: 5,
    marginTop: "0%",
  },
  potIcon: {
    width: 80,
    height: 80,
  },
  potIcon3: { 
    width: 70, 
    height: 70, 
    zIndex: 3 
  },

  // Footer паттерн
  topPatternContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "15%",
    zIndex: -1,
    resizeMode: "cover",
    opacity: 0.8,
    marginBottom: "1%",
  },

  // Заголовок с полями
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
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
    flex: 0.6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: COLORS.white,
    fontSize: 16,
  },

  // Список категорий
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  scrollView: { 
    flex: 1 
  },
  categoryGrid: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  categoryItem: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },

  // Кнопки категорий
  categoryButton: {
    flex: 1,
    height: 55,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 1,
    zIndex: 11,
  },
  categoryButtonAdd: {
    width: 60,
    height: 45,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 1,
    zIndex: 20,
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
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  disabledCategoryButton: {
    opacity: 0.5,
    zIndex: 8,
  },

  // Нижний контейнер
  bottomPadding: { 
    height: 20 
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "transparent",
    zIndex: 5,
    marginBottom: "10%",
  },
  nextButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginVertical: 5,
    alignItems: "center",
    zIndex: 6,
  },

  // ... остальные стили модальных окон остаются без изменений
});

// ============================================
// 4. ОБНОВИТЕ COLORS (если еще не обновлены)
// ============================================

export const COLORS = {
  primary: "#FF6F61",
  secondary: "#4A90E2",
  background: "#FDFDFD",
  card: "#FFFFFF",
  textPrimary: "#2D3748",
  textSecondary: "#718096",
  accent: "#FBBF24",
  shadow: "rgba(0, 0, 0, 0.3)",
  error: "#FF0000",
  white: "#FFFFFF",
  buttonGradientStart: "#D3C5B7",
  buttonGradientEnd: "#A68A6E",
  placeholder: "rgba(255, 255, 255, 0.7)",
  border: "#B0A092",
};

export const MODAL_COLORS = {
  background: '#EDE7D9',
  cardBackground: '#FDFBF5',
  primaryActionStart: COLORS.buttonGradientStart,
  primaryActionEnd: COLORS.buttonGradientEnd,
  textPrimary: '#5A4032',
  textSecondary: '#718096',
  inputBackground: '#FBF9F7',
  inputBorder: '#B0A092',
  activeFilter: COLORS.buttonGradientEnd,
  activeFilterText: COLORS.white,
  inactiveFilter: '#EFEBE4',
  inactiveFilterText: '#5A4032',
  separator: '#DCCFC0',
  shadow: 'rgba(0, 0, 0, 0.15)',
  icon: '#5A4032',
  closeButtonColor: '#5A4032',
  overlayBackground: 'rgba(45, 55, 72, 0.65)',
};
