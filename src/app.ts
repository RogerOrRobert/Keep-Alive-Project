import * as express from 'express';
import pm2Lib from './pm2Lib';
import socketIO from './socketIO';
import {Container} from './pm2Lib'
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/miners', async (req, res) => {
    res.json(await pm2Lib.getProcesses());
});
  
app.put('/miners/:filename/:action', async (req, res) => {
  try {
    const { filename, action } = req.params;
    const configFile = 'src/containers.json';
    let fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    switch (action) {
      case 'start':
        res.json(await pm2Lib.startProcess(filename));     
        break;
      case 'restart': 
        res.json(await pm2Lib.restartProcess(filename));
        break;
      case 'stop':
        res.json(await pm2Lib.stopProcess(filename));
        break;
      default:
        return res.status(400).json({ message: `${action} is not supported!` });
    }
  } catch (error) {
    res.status(500).json({ message: (error[0] || error).message });
  }
});

app.use(express.json());

app.post('/setStoreEnable/', async (req, res) => {
  let {enabled} = req.body
  const configFile = 'src/containers.json';
  if (enabled !== undefined) {
    try {
      // Carga el archivo JSON y conviértelo en un array de objetos Container
      let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Actualiza el campo 'enabled' de todos los contenedores
      fileData.containers = fileData.containers.map(container => {
          return { ...container, enabled: enabled };
      });

      // Guarda los cambios de vuelta al archivo JSON
      fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
      console.log(`Todos los contenedores han sido ${enabled ? 'habilitados' : 'deshabilitados'} correctamente.`);
      res.status(200).send('Configuración guardada correctamente.');
    } catch (error) {
      console.error('Error al actualizar la configuración de contenedores:', error);
      res.status(500).send('Error interno del servidor al guardar la configuración.');
      // Maneja el error según tus necesidades
      throw error;
    } 
  } else {
    res.status(400).send('Solicitud incorrecta: Propiedad "enabled" no encontrada en la solicitud.');
  }
});

app.post('/changeContainerEnable/:id', (req, res) => {
  const {id} = req.params

  // leo el fichero
  const configFile = 'src/containers.json';
  const response = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const containerIndex = response.containers.findIndex((container: Container) => container.id === id);
  if (containerIndex !== -1) {
    response.containers[containerIndex].enabled = !response.containers[containerIndex].enabled;
    try {
      fs.writeFileSync(configFile, JSON.stringify(response, null, 2));
      res.status(200).send('Configuración guardada correctamente.');
    } catch (error) {
        console.error('Error al escribir en el archivo:', error);
        res.status(500).send('Error interno del servidor al guardar la configuración.');
    }
  } else {
    res.status(404).send('Contenedor no encontrado.');
  }
  
})

app.get('/getStatus', async (req, res) => {
  try {
    const procesos = await pm2Lib.getProcesses();
    const statuses = procesos.map(proc => ({
      status: proc.pm2_env?.status
    }));
    res.json(statuses);
  } catch (error) {
    console.error('Error al obtener procesos:', error);
    res.status(500).json({ error: 'Error al obtener procesos.' });
  }
})
app.get('/getSatus/:id', async (req, res) => {  //get status for each container
  const {id} = req.params;
  const configFile = 'src/containers.json';
  try{
    let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const container = fileData.containers.find(container => container.id === id);
    if (container) {
      res.json(container.status);
    } else {
        console.log(`No se encontró un contenedor con el ID '${id}'.`);
        res.status(404).send('Estado no encontrado.');
      }
  } catch(error) {
    console.error('Error al leer el archivo de configuración:', error);
    res.status(500).json({ error: 'Error al obtener procesos.' });
  }
})
app.get('/getSaved/:id', async (req, res) => {
  const {id} = req.params;
  const configFile = 'src/containers.json';
  try{
    let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const container = fileData.containers.find(container => container.id === id);
    if (container) {
      res.json(container.enabled);
    } else {
        console.log(`No se encontró un contenedor con el ID '${id}'.`);
        res.status(404).send('Estado no encontrado.');
      }
  } catch(error) {
    console.error('Error al leer el archivo de configuración:', error);
    res.status(500).json({ error: 'Error al obtener procesos.' });
  }
    
});

app.get('/getEnableds', async (req, res) => {
  const configFile = 'src/containers.json';

    try {
        // Carga el archivo JSON y conviértelo en un array de objetos Container
        let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

        // Verifica si todos los contenedores tienen el campo 'enabled' configurado como true
        const allEnabled = fileData.containers.every(container => container.enabled);

        res.json(allEnabled);
        /* if(allEnabled) {
          res.json(await pm2Lib.stopProcess(filename));
        } */
    } catch (error) {
        console.error('Error al leer el archivo de configuración:', error);
        res.status(500).json({ error: 'Error al obtener enabled.' });
    }
})


app.post('/changeContainerState/:id', (req, res) => {
  const {id} = req.params

  // leo el fichero
  const configFile = 'src/containers.json';
  const response = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const containerIndex = response.containers.findIndex((container: Container) => container.id === id);
  if (containerIndex !== -1) {
    if(response.containers[containerIndex].status === 'online') {
      response.containers[containerIndex].status = 'stopped';
    } else {
      response.containers[containerIndex].status = 'online'
    }
    try {
      fs.writeFileSync(configFile, JSON.stringify(response, null, 2));
      res.status(200).send('Configuración guardada correctamente.');
    } catch (error) {
        console.error('Error al escribir en el archivo:', error);
        res.status(500).send('Error interno del servidor al guardar la configuración.');
    }
  } else {
    res.status(404).send('Contenedor no encontrado.');
  }
  
})
const PORT = process.env.PORT || 3000;
const httpServer = app.listen(PORT, () => {
  console.log(`[Server] Listening on :${PORT}`);
});

socketIO.init(httpServer);