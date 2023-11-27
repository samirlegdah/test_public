import { SyntheticEvent } from 'react';
import { PluginMeta, PanelProps } from '@grafana/data';
import { StruttureEnergiaAppSettings } from 'types';

export class ExampleConfigCtrl {
  static templateUrl = 'html/config.html';

  appEditCtrl: any;
  appModel?: PluginMeta; //dati relativia  plugin
  current: any = {}; //dati attulmente caricati
  dataSources = [];
  completato = false;
  panelProps: PanelProps<StruttureEnergiaAppSettings>;

  onSave: ReturnType<typeof createSaveSettings>;
  dashboard_esistenti: any = [];
  folders: any;

  /** @ngInject */
  constructor($scope: any, $injector: any) {
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));
    this.onSave = createSaveSettings(this);
    // Make sure it has a JSON Data spot
    if (!this.appModel) {
      this.appModel = {} as PluginMeta;
    }

    // Required until we get the types sorted on appModel :(
    const appModel = this.appModel as any;
    if (!appModel.jsonData) {
      //config salvate
      appModel.jsonData = {};
    }

    this.panelProps = this.current as PanelProps<StruttureEnergiaAppSettings>;

    this.getDataSources();
  }
  aggiorna() {
    // this.completato = true;
    let x = require('./../dashboards/avg-profiles.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/dest-and-areas-analysis.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/devices.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/forecasts.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/heat-pump.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/photovoltaic.json');
    this.dashboard_esistenti.push(x);
    x = require('./../dashboards/real-time.json');
    this.dashboard_esistenti.push(x);

    fetch('/api/folders?limit=100', {
      method: 'GET',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw resp;
        }
        resp.json().then((json) => {
          console.log(json);
          //[{"id":106,"uid":"ENjA0pv7z","title":"prova"}]
          let folder_esistenti = [];
          this.folders = json;
          json.forEach((j) => {
            folder_esistenti.push(j.title.toLowerCase());
          });
          this.makeFolder(folder_esistenti);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  makeFolder(folder_esistenti, i = 0) {
    let folder_da_creare = [
      'Consumi real time',
      'Diagnosi energetica',
      'Dispositivi',
      'Impianto Fotovoltaico',
      'Pompa di calore',
    ];
    if (i < folder_da_creare.length) {
      const j = folder_da_creare[i];
      if (folder_esistenti.indexOf(j.toLowerCase()) < 0) {
        fetch('/api/folders', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ title: j }),
        })
          .then((resp) => {
            if (!resp.ok) {
              throw resp;
            }
            resp.json().then((json) => {
              this.folders.push(json);
              folder_esistenti.push(j.toLowerCase());
              this.makeFolder(folder_esistenti, i + 1);
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.makeFolder(folder_esistenti, i + 1);
      }
    } else {
      this.updateDashboard();
    }
  }
  updateDashboard() {
    //let d = this.dashboard_esistenti[0];
    this.dashboard_esistenti.forEach((d) => {
      let id = this.getFolderId(d);
      fetch('/api/dashboards/db', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ dashboard: d, folderId: id }),
      })
        .then((resp) => {
          if (!resp.ok) {
            throw resp;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
    // this.completato = true;
  }
  getFolderId(dashboard) {
    let map = {
      // dashbord : folder
      'Real Time': 'Consumi real time',
      'Analisi bilanciamento Fotovoltaico': 'Impianto Fotovoltaico',
      Forecast: 'Impianto Fotovoltaico',
      "Analisi per destinazioni d'uso ed aree funzionali": 'Diagnosi energetica',
      'Profili medi giornalieri/settimanali': 'Diagnosi energetica',
      'Lista dei Dispositivi': 'Dispositivi',
      'Analisi consumi ed efficienza Pompa di Calore': 'Pompa di calore',
    };
    for (let index = 0; index < this.folders.length; index++) {
      const f = this.folders[index];
      if (f.title.toLowerCase() === map[dashboard.title].toLowerCase()) {
        return f.id;
      }
    }
  }
  postUpdate() {
    if (!this.appModel?.enabled) {
      console.log('Not enabled...');
      return;
    }

    // TODO, can do stuff after update
    console.log('Post Update:', this);
  }

  getDataSources() {
    fetch('/api/datasources')
      .then((res: any) => {
        if (!res.ok) {
          throw Error("Can't get data sources");
        }
        return res.json();
        // this.dataSources = res.map(res.body)
      })
      .then((json: any[]) => {
        this.dataSources = json.map((ds) => {
          // trim out useless data
          return {
            id: ds.id,
            name: ds.name,
          };
        });
        this.current.dataSourceId = this.appModel.jsonData['dataSourceId'];
        console.log('Got DSs && set it to select');
        //prevents refresh bug
        document.getElementById('select').focus();
        document.getElementById('select').blur();
        // document.getElementById('btn_import').focus();
        // document.getElementById('btn_import').blur();
      })
      .catch((err: any) => {
        console.log('ERROR', err);
      });
  }
  saveSettings() {
    console.log(this);
    this.appModel.jsonData['dataSourceId'] = this.current.dataSourceId;
    //this.panelProps.onOptionsChange({ dataSourceId: this.current.dataSourceId });
    this.appEditCtrl.update({ dataSourceId: this.current.dataSourceId });
  }
}

const createSaveSettings = (ctrl: any) => (event: SyntheticEvent<HTMLInputElement>) => {
  console.log(ctrl, event);
};
