const { exec } = require('child_process');
const fs = require('fs');

//TODO: COMPROABAR ESTADO ENALBED DE TODOS LOS CONTAINERS, SI ESTAN TODOS ENABLED, SAVE PM2 PROJECT 
/* try {
  const response = await fetch('/getEnableds')
  .then(response => response.json())
  .then(data => {
      console.log('Estado actual:', data.estado);
  })
  .catch(error => {
      console.error('Error al obtener el estado:', error);
  });
  if (response) {
      console.log("Proyecto guardado correctamente.");
      exec('pm2 save', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al guardar: ${error.message}`);
          return;
        }
        console.log(`Proceso guardado: ${stdout}`);
      });
  } else {
      console.error("No todos los enables de los containers estan a true.");
      exec('pm2 cleardump', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al guardar: ${error.message}`);
          return;
        }
      });
  }
} catch (error) {
  console.error("Hubo un problema con la petición Fetch:", error.message);
} */
/* fs.readFile(configFile, 'utf8', (err, data) => { 
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
});  */
try {
  const configFile = 'src/containers.json';
  // Carga el archivo JSON y conviértelo en un array de objetos Container
  const fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));

  // Verifica si todos los contenedores tienen el campo 'enabled' configurado como true
  const allEnabled = fileData.containers.every(container => container.enabled);

  if (allEnabled) {
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
} catch (error) {
  console.error('Error al leer el archivo de configuración:', error);
}
