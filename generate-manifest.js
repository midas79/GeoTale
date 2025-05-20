const fs = require('fs');
const path = require('path');

// Get the base path from environment variables or use default
const isGithubPages = process.env.DEPLOY_ENV === 'github';
const BASE_PATH = isGithubPages ? '/GeoTale/' : '/';

// Define paths based on the project root
const projectRoot = __dirname;
const templatePath = path.join(projectRoot, 'src', 'public', 'manifest.template.json');
const outputPath = path.join(projectRoot, 'src', 'public', 'manifest.json');

// Check if the template file exists
if (!fs.existsSync(templatePath)) {
  console.error(`Template file not found at: ${templatePath}`);
  process.exit(1);
}

try {
  // Read the template
  const template = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  const manifestContent = template.replace(/\{\{BASE_PATH\}\}/g, BASE_PATH);

  // Write the processed manifest
  fs.writeFileSync(outputPath, manifestContent);

  console.log(`Manifest generated with BASE_PATH: ${BASE_PATH}`);
} catch (error) {
  console.error('Error generating manifest:', error);
  process.exit(1);
}
