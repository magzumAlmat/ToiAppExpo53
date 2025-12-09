const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/screens/SupplierScreen.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add city field after phone field in cards
  const phoneRegex = /(Телефон: \{item\.phone \|\| 'Не указан'\})/g;
  const replacement = '$1\\n                  <Text>Город: {item.city || \'Не указан\'}</Text>';
  
  // Check if city already exists
  if (!content.includes('Город: {item.city')) {
    content = content.replace(phoneRegex, replacement);
    fs.writeFileSync(filePath, 'utf8');
    console.log('✅ Added city field to SupplierScreen.js');
  } else {
    console.log('⏭️  City field already exists in SupplierScreen.js');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
