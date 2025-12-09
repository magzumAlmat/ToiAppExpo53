const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/screens/ItemEditScreen.js');

const cityPickerTemplate = `            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Город:</Text>
              <TouchableOpacity
                style={styles.cuisineButton}
                onPress={() => setModalVisible({ ...modalVisible, city: true })}
              >
                <Text style={styles.cuisineText}>{form.city || 'Выберите город'}</Text>
              </TouchableOpacity>
              <Modal
                visible={modalVisible.city}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible({ ...modalVisible, city: false })}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Выберите город</Text>
                    <Picker
                      selectedValue={form.city}
                      onValueChange={(value) => {
                        handleChange('city', value);
                        setModalVisible({ ...modalVisible, city: false });
                      }}
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Выберите город" value="" />
                      {cityOptions.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible({ ...modalVisible, city: false })}
                    >
                      <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
`;

const casesToUpdate = [
  'clothing',
  'transport',
  'tamada',
  'program',
  'traditionalGift',
  'flowers',
  'cake',
  'alcohol',
  'jewelry',
  'goods'
];

try {
  let content = fs.readFileSync(filePath, 'utf8');
  let updatedCount = 0;

  casesToUpdate.forEach(caseType => {
    // Find the case block and add city picker before the closing </>
    const caseRegex = new RegExp(
      `(case '${caseType}':[\\s\\S]*?)(\\s*<\\/><\\s*\\)\\s*;)`,
      'g'
    );
    
    const match = content.match(caseRegex);
    if (match && !match[0].includes('Город:')) {
      content = content.replace(caseRegex, `$1${cityPickerTemplate}$2`);
      updatedCount++;
      console.log(`✅ Added city picker to ${caseType}`);
    } else if (match) {
      console.log(`⏭️  ${caseType} already has city picker`);
    } else {
      console.log(`⚠️  Could not find case '${caseType}'`);
    }
  });

  if (updatedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ Updated ${updatedCount} forms with city picker!`);
  } else {
    console.log('\n✅ All forms already have city picker!');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
