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
      // Load the JSON file and convert it to an array of Container objects
      let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Update the 'enabled' field of all containers
      fileData.containers = fileData.containers.map(container => {
          return { ...container, enabled: enabled };
      });

      // Save changes back to the JSON file
      fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
      console.log("All containers have been ", enabled ? 'enabled' : 'disabled', " successfully.");
      res.status(200).send('Configuration saved successfully.');
    } catch (error) {
      console.error('Error updating container configuration:', error);
      res.status(500).send('Internal server error while saving the configuration.');
      // Handle the error according to your needs
      throw error;
    } 
  } else {
    res.status(400).send('Bad request: "enabled" property not found in the request.');
  }
});

app.post('/changeContainerEnable/:id', (req, res) => {
  const {id} = req.params

  // Read the file
  const configFile = 'src/containers.json';
  const response = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const containerIndex = response.containers.findIndex((container: Container) => container.id === id);
  if (containerIndex !== -1) {
    response.containers[containerIndex].enabled = !response.containers[containerIndex].enabled;
    try {
      fs.writeFileSync(configFile, JSON.stringify(response, null, 2));
      res.status(200).send('Configuration saved successfully.');
    } catch (error) {
      console.error('Error writing to the file:', error);
      res.status(500).send('Internal server error while saving the configuration.');
    }
  } else {
    res.status(404).send('Container not found.');
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
    console.error('Error getting processes:', error);
    res.status(500).json({ error: 'Error getting processes.' });
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
      console.log(`Container with ID '${id}' not found.`);
      res.status(404).send('Status not found.');
    }
  } catch(error) {
    console.error('Error reading the configuration file:', error);
    res.status(500).json({ error: 'Error getting processes.' });
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
        console.log(`Container with ID '${id}' not found.`);
        res.status(404).send('Status not found.');
      }
  } catch(error) {
    console.error('Error reading the configuration file:', error);
    res.status(500).json({ error: 'Error getting processes.' });
  }
    
});

app.get('/getEnableds', async (req, res) => {
  const configFile = 'src/containers.json';

    try {
      // Loads the JSON file and convert it to an array of Container objects
      let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Checks if all containers have the 'enabled' field set to true
      const allEnabled = fileData.containers.every(container => container.enabled);

      res.json(allEnabled);
    } catch (error) {
      console.error('Error reading configuration file:', error);
      res.status(500).json({ error: 'Error retrieving processes.' });
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
      res.status(200).send('Configuration saved successfully.');
    } catch (error) {
      console.error('Error writing to file:', error);
      res.status(500).send('Internal server error while saving configuration.');
    }
  } else {
    res.status(404).send('Container not found.');
  }
  
})
const PORT = process.env.PORT || 3000;
const httpServer = app.listen(PORT, () => {
  console.log(`[Server] Listening on :${PORT}`);
});

socketIO.init(httpServer);
