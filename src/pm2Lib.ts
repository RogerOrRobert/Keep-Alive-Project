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

class Pm2Lib {
  private readonly SCRIPT_PATH = "C:/Users/rlpro/dev/pm2/ts-pm2-ui/src/";
  private readonly MINERS = ['miner01.js'];//, 'miner02.js'];

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
  async startProcess(filename: string): Promise<Proc> {
    const proc = this.getStartOptions(filename);
    const configFile = 'src/aplications.json';
    let fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    /* if(fileData.enabled){
      return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
    }
    else{
      return promisify(pm2.stop).call(pm2, filename);
    } */
    return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
  }

  async restartProcess(filename: string): Promise<Proc> {
    return promisify(pm2.restart).call(pm2, filename);
  }

  async stopProcess(filename: string): Promise<Proc> {
    return promisify(pm2.stop).call(pm2, filename);
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