const { exec } = require('child_process');
const fs = require('fs');

try {
  const configFile = 'src/containers.json';
  // Load the JSON file and convert it into an array of Container objects
  const fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));

  // Check if all containers have the 'enabled' field set to true
  const allEnabled = fileData.containers.every(container => container.enabled);

  if (allEnabled) {
    exec('pm2 save', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while saving: ${error.message}`);
        return;
      }
      console.log(`Process saved: ${stdout}`);
    });
  } else {
    console.log('The project is disabled. No restart will be performed.');
    exec('pm2 cleardump', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while saving: ${error.message}`);
        return;
      }
    });
  }
} catch (error) {
  console.error('Error reading the configuration file:', error);
}
