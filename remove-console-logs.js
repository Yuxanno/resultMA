const fs = require('fs');
const path = require('path');

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove console.log statements but keep console.error, console.warn
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines with console.log (but not console.error or console.warn)
    if (line.match(/console\.log\s*\(/)) {
      // Check if it's a multiline console.log
      let openParens = (line.match(/\(/g) || []).length;
      let closeParens = (line.match(/\)/g) || []).length;
      
      // Skip this line
      modified = true;
      
      // If multiline, skip until we find the closing parenthesis
      while (openParens > closeParens && i < lines.length - 1) {
        i++;
        const nextLine = lines[i];
        openParens += (nextLine.match(/\(/g) || []).length;
        closeParens += (nextLine.match(/\)/g) || []).length;
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalCleaned = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        totalCleaned += processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (removeConsoleLogs(filePath)) {
        totalCleaned++;
      }
    }
  }
  
  return totalCleaned;
}

console.log('🧹 Removing console.log statements from client...');
const clientCleaned = processDirectory('./client/src');
console.log(`\n✨ Client: Cleaned ${clientCleaned} files`);

console.log('\n🧹 Removing console.log statements from server...');
const serverCleaned = processDirectory('./server/src');
console.log(`\n✨ Server: Cleaned ${serverCleaned} files`);

console.log(`\n🎉 Total: Cleaned ${clientCleaned + serverCleaned} files`);
