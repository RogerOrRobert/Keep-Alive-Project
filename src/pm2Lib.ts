import * as pm2 from 'pm2';
import { Proc, ProcessDescription, StartOptions } from 'pm2';

import { promisify } from 'util';
import { EventEmitter } from 'events';
const fs = require('fs');

export interface IProcessOutLog {
  data: string;
  at: number;
  process: {
    namespace: string;
    rev: string;
    name: string;
    pm_id: number;
  };
}

export interface Container {
  id: string;
  enabled: boolean;
  status: string;
}

class Pm2Lib {
  private readonly SCRIPT_PATH = "C:/Users/rlpro/dev/pm2/ts-pm2-ui/src/";
  private readonly MINERS = ['miner01.js', 'miner02.js'];

  private bus: EventEmitter | undefined;

  async getProcesses(): Promise<ProcessDescription[]> {
    const processes: ProcessDescription[] = [];

    for (const miner of this.MINERS) {
      const [proc] = await promisify(pm2.describe).call(pm2, miner);
      if (proc) {
        processes.push(proc);
      } else {
        processes.push({
          name: miner,
          pm2_env: {
            status: 'stopped',
          },
        });
      }
    }

    return processes;
  }
    async onLogOut(onLog: (logObj: IProcessOutLog) => void) {
        if (!this.bus) {
            this.bus = await promisify<EventEmitter>(pm2.launchBus).call(pm2)
        }
        this.bus.on('log:out', (procLog: IProcessOutLog) => {
            onLog(procLog);
        });
    }
    async startProcess(id: string): Promise<Proc> {
      const proc = this.getStartOptions(id);
      const configFile = 'src/containers.json';
      try {
          // Carga el archivo JSON y conviértelo en un array de objetos Container
          let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  
          // Verifica si el ID ya existe en la lista de contenedores
          const existingContainerIndex = fileData.containers.findIndex(container => container.id === id);
  
          // Si el ID ya existe, no hagas ninguna escritura adicional y devuelve el resultado de pm2.start
          if (existingContainerIndex !== -1) {
              console.log('El ID ya existe en la lista de contenedores. No se realizaron cambios.');
              return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
          }
          
          // El ID no existe en la lista, agrégalo
          fileData.containers.push({ id, enabled: false, status: "online" }); // O establece el valor según tus necesidades
  
          // Guarda los cambios de vuelta al archivo JSON
          fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
          console.log('Configuración de contenedores actualizada correctamente.');
  
          // Procede a iniciar el proceso
          return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
      } catch (error) {
          console.error('Error al actualizar la configuración de contenedores:', error);
          // Maneja el error según tus necesidades
          throw error;
      }
  }
  
  async restartProcess(filename: string): Promise<Proc> {
    return promisify(pm2.restart).call(pm2, filename);
  }

  async stopProcess(filename: string): Promise<Proc> {
    const proc = this.getStartOptions(filename);
      const configFile = 'src/containers.json';
      try {
          // Carga el archivo JSON y conviértelo en un array de objetos Container
          let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  
          // Verifica si el ID ya existe en la lista de contenedores
          const existingContainerIndex = fileData.containers.findIndex(container => container.id === filename);
  
          // Si el ID ya existe, no hagas ninguna escritura adicional y devuelve el resultado de pm2.start
          if (existingContainerIndex !== -1) {
              console.log('El ID ya existe en la lista de contenedores. No se realizaron cambios.');
              return promisify(pm2.stop).call(pm2, filename);
          }
          const id = filename;
          // El ID no existe en la lista, agrégalo
          fileData.containers.push({ id, enabled: false, status: "stopped" }); // O establece el valor según tus necesidades
  
          // Guarda los cambios de vuelta al archivo JSON
          fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
          console.log('Configuración de contenedores actualizada correctamente.');
  
          // Procede a iniciar el proceso
          return promisify(pm2.stop).call(pm2, filename);
      } catch (error) {
          console.error('Error al actualizar la configuración de contenedores:', error);
          // Maneja el error según tus necesidades
          throw error;
      }
    
  }

  private getStartOptions(filename: string): StartOptions {
    const alias = filename.replace('.js', '');
    return {
      script: `${this.SCRIPT_PATH}/${filename}`,
      name: filename,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      output: `${this.SCRIPT_PATH}/${alias}.stdout.log`,
      error: `${this.SCRIPT_PATH}/${alias}.stderr.log`,
      exec_mode: 'cluster',
    };
  }
}

export default new Pm2Lib();