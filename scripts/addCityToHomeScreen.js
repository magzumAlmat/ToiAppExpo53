const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/screens/HomeScreen.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add city field after phone field in modal details
  const phoneRegex = /(Телефон: \$\{item\.phone \|\| "Не указано"\})/g;
  const replacement = '$1\\nГород: ${item.city || "Не указан"}';
  
  // Check if city already exists
  if (!content.includes('Город: ${item.city')) {
    content = content.replace(phoneRegex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Added city field to HomeScreen.js');
  } else {
    console.log('⏭️  City field already exists in HomeScreen.js');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
