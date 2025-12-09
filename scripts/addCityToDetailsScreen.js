const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/screens/DetailsScreen.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add city field after phone field in all cases
  const phoneFieldRegex = /(<DetailField label="Телефон" value=\{item\.phone\} \/>)/g;
  const replacement = '$1\n            <DetailField label="Город" value={item.city} />';
  
  // Check if city already exists
  if (!content.includes('label="Город"')) {
    content = content.replace(phoneFieldRegex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Added city field to DetailsScreen.js');
  } else {
    console.log('⏭️  City field already exists in DetailsScreen.js');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
