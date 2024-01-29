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
      this.bus = await promisify<EventEmitter>(pm2.launchBus).call(pm2);
    }
    this.bus.on('log:out', (procLog: IProcessOutLog) => {
      onLog(procLog);
    });
  }

  async startProcess(id: string): Promise<Proc> {
    const proc = this.getStartOptions(id);
    const configFile = 'src/containers.json';
    try {
      // Load the JSON file and convert it into an array of Container objects
      let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Check if the ID already exists in the list of containers
      const existingContainerIndex = fileData.containers.findIndex(container => container.id === id);

      // If the ID already exists, do not perform any additional writing and return the result of pm2.start
      if (existingContainerIndex !== -1) {
        console.log('ID already exists in the list of containers. No changes were made.');
        return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
      }

      // The ID does not exist in the list, add it
      fileData.containers.push({ id, enabled: false, status: "online" });

      // Save the changes back to the JSON file
      fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
      console.log('Container configuration updated successfully.');

      // Proceed to start the process
      return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
    } catch (error) {
      console.error('Error updating container configuration:', error);
      // Handle the error as needed
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
      // Load the JSON file and convert it into an array of Container objects
      let fileData: { containers: Container[] } = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Check if the ID already exists in the list of containers
      const existingContainerIndex = fileData.containers.findIndex(container => container.id === filename);

      // If the ID already exists, do not perform any additional writing and return the result of pm2.start
      if (existingContainerIndex !== -1) {
        console.log('ID already exists in the list of containers. No changes were made.');
        return promisify(pm2.stop).call(pm2, filename);
      }
      const id = filename;
      // The ID does not exist in the list, add it
      fileData.containers.push({ id, enabled: false, status: "stopped" });

      // Save the changes back to the JSON file
      fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
      console.log('Container configuration updated successfully.');

      // Proceed to start the process
      return promisify(pm2.stop).call(pm2, filename);
    } catch (error) {
      console.error('Error updating container configuration:', error);
      // Handle the error as needed
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
