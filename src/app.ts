import * as express from 'express';
import pm2Lib from './pm2Lib';
import socketIO from './socketIO';
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
    const configFile = 'src/aplications.json';
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

app.post('/setStoreEnable', async (req, res) => {
  var field = req.body;

  if (field && field.enabled !== undefined) {
      const configFile = 'src/aplications.json';
      let fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      fileData.enabled = field.enabled;

      try {
          fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
          res.status(200).send('Configuración guardada correctamente.');
      } catch (error) {
          console.error('Error al escribir en el archivo:', error);
          res.status(500).send('Error interno del servidor al guardar la configuración.');
      }
  } else {
      res.status(400).send('Solicitud incorrecta: Propiedad "enabled" no encontrada en la solicitud.');
  }
});

app.get('/getSaved', async (req, res) => {
  const configFile = 'src/aplications.json';
  let fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  res.json(fileData.enabled);
});

const PORT = process.env.PORT || 3000;
const httpServer = app.listen(PORT, () => {
  console.log(`[Server] Listening on :${PORT}`);
});

socketIO.init(httpServer);