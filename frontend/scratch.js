const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.endsWith('_layout.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip if already converted
      if (content.includes('const getStyles =')) continue;
      
      // 1. Add import
      if (!content.includes('useColors')) {
        content = content.replace(/(import .* from 'react-native';)/, "$1\nimport { useColors } from '@/hooks/useColors';");
      }
      
      // 2. Remove import colors from '@/constants/colors';
      content = content.replace(/import colors from '@\/constants\/colors';\n/, "");

      // 3. Inject into default export function
      // Assuming pattern: export default function Something() {
      content = content.replace(/(export default function [a-zA-Z0-9_]+\([^)]*\)\s*\{)/, "$1\n  const colors = useColors();\n  const styles = getStyles(colors);");
      
      // 4. Update QuickAction or other non-default exported functions?
      // For home.tsx QuickAction
      if (fullPath.includes('home.tsx')) {
         content = content.replace(/function QuickAction\(\{(.*?)\}\) \{/, "function QuickAction({$1}: any) {\n  const colors = useColors();\n  const styles = getStyles(colors);");
      }
      
      // 5. Replace StyleSheet.create
      content = content.replace(/const styles = StyleSheet\.create\(\{/, "const getStyles = (colors: any) => StyleSheet.create({");
      
      // 6. Replace colors.light.
      content = content.replace(/colors\.light\./g, "colors.");
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Refactored ${fullPath}`);
    }
  }
}

processDir(dir);
console.log('Done!');
