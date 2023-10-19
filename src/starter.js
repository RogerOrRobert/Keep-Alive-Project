const { exec } = require('child_process');
const fs = require('fs');

const configFile = 'src/aplications.json';
fs.readFile(configFile, 'utf8', (err, data) => { 
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    const config = JSON.parse(data); 
    console.log("ENABLED: ",config.enabled);
    if (config.enabled === true || config.enabled === 'true') { 
      exec('pm2 save', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al guardar: ${error.message}`);
          return;
        }
        console.log(`Proceso guardado: ${stdout}`);
      });
    } else {
      console.log('El proyecto está deshabilitado. No se realizará el reinicio.');
      exec('pm2 cleardump', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al guardar: ${error.message}`);
          return;
        }
      });
    } 
}); 

