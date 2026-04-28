const fs = require('fs');
const path = require('path');

const dir = 'e:\\LMS\\frontend\\app\\dashboard\\instructor\\settings\\components';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove bold styles or change to medium to make it "normal"
        content = content.replace(/font-black/g, 'font-medium');
        content = content.replace(/font-bold/g, ''); // just remove font-bold to make it regular weight, or change to font-medium if needed. Let's replace font-bold with nothing, but wait, replacing with empty string might leave double spaces, e.g. `text-sm  text-slate-900`. That's fine in Tailwind.
        
        fs.writeFileSync(filePath, content);
    }
});

console.log('Styles updated.');
