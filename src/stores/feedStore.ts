import { alertError } from 'lib/utils';

class FeedStore {
  dataSourceId = '';
  feeds: any[] = [];
  inputs: any[] = [];
  listeners: CallableFunction[] = [];
  feedsListeners: CallableFunction[] = [];
  treeFeedsListeners: CallableFunction[] = [];
  errorListeners: CallableFunction[] = [];
  constructor() {}

  setKey(key: string) {
    this.dataSourceId = key;
    if (this.dataSourceId) {
      this.fetchFeeds();
      this.getInputs();
    }
  }
  setKeyFromTree(key: string) {
    this.dataSourceId = key;
    if (this.dataSourceId) {
      this.fetchFeedsFromTree();
      this.getInputs();
    }
  }
  fetchFeedsFromTree() {
    fetch('/api/datasources/proxy/' + this.dataSourceId + '/tree', {
      method: 'GET',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw resp;
        }
        resp.json().then((json) => {
          this.feeds = json.data.tree;
          this.callTreeFeedsListeners(this.feeds);
        });
      })
      .catch((err) => {
        this.callErrorListener(err);
      });
  }
  fetchFeeds() {
    if (this.feeds.length > 0) {
      this.callFeedsListeners(this.feeds);
    }
    if (!this.dataSourceId) {
      return false;
    }
    fetch('/api/datasources/proxy/' + this.dataSourceId + '/feeds', {
      method: 'GET',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw resp;
        }
        resp.json().then((json) => {
          this.feeds = [];
          for (var n = 0; n < json.data.length; ++n) {
            for (var f = 0; f < json.data[n].meta.feeds.length; ++f) {
              this.feeds.push(json.data[n].meta.feeds[f]);
            }
          }
          console.log('fetchFeeds:', this.feeds);
          this.callFeedsListeners(this.feeds);
        });
      })
      .catch((err) => {
        this.callErrorListener(err);
      });
  }
  getInputs() {
    if (this.inputs.length > 0) {
      this.callListeners(this.inputs);
    }
    if (!this.dataSourceId) {
      return false;
    }
    fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url: '/input/list' }),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw resp;
        }
        resp.json().then((json) => {
          this.inputs = json;
          this.callListeners(this.inputs);
        });
      })
      .catch((err) => {
        this.callErrorListener(err);
      });
  }
  updateFeed(id: string, key: string, val: string) {
    let url = `/feed/set.json?id=${id}&fields={"${key}":"${val}"}`;
    return fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }
  updateNode(nodeId: string, meta: any) {
    for (var k = 0; k < this.feeds.length; ++k) {
      if (this.feeds[k].title !== nodeId) {
        continue;
      }
      for (var key in meta) {
        this.feeds[k].meta[key] = meta[key];
      }
    }
    return fetch('/api/datasources/proxy/' + this.dataSourceId + '/tree', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(this.feeds),
    });
  }
  uploadCSV(data: any, feedId: string, fromEmon: boolean) {
    try {
      return fetch('/api/datasources/proxy/' + this.dataSourceId + '/upload-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, feedId, fromEmon }),
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.status >= 200 && data.status <= 299) {
            alertError(data);
          }
        })
        .catch((err) => {
          console.log(err);
          if (err === undefined) {
            alert('2. dimesione massima accetta 25Mb');
          } // else {
          // alert(err);
          // }
        });
    } catch (error) {
      alert('3. dimesione massima accetta 25Mb');
    }
  }
  addNode(node: any) {
    // this.feeds.push(node);
    //let engine = node.meta.oggettoTipo === 'Verifica' ? 7 : 2;
    let engine = node.meta.oggettoTipo === 'Verifica' ? 7 : 2;
    let data = { url: `/feed/create.json?tag=${node.title}&name=volt_0&datatype=1&engine=${engine}` };

    /*
    return fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })*/
    //Chiama status giusto come incipit
    return fetch('/api/datasources/proxy/' + this.dataSourceId + '/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (resp) => {
        resp.json();
        //this.addFeed(node, { name: 'consumo', engine: engine });
        //**NEW
        const feedPool = this.generateFeedPool();
        console.log('feedPool:', feedPool);
        for (const feed of feedPool) {
          console.log(feed);
          await this.addFeed(node, { name: feed, engine: engine });
        }
        //**NEW
      })
      .then((data) => {
        //alert(data.msg)
      })
      .catch((err) => {
        console.log(err);
        if ((err.type = 'entity.too.large')) {
          alert('dimesione massima accetta 25Mb');
        } // else {
        // alert(err);
        // }
      });
  }
  addFeed(node: any, feed: any) {
    //feed.engine = '2'; // 2=real feed, 7=virtual
    const url = `/feed/create.json?tag=${node.title}&name=${feed.name}&datatype=1&engine=${feed.engine}`;
    return fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url }),
    })
      .then((resp) => {
        return resp.json();
      })
      .catch((err) => {
        return { message: 'Errore nel server' };
      });
  }
  //   // addFeed(node: any, feed: any) {
  //   //   //feed.engine = '2'; // 2=real feed, 7=virtual
  //   //   const url = `/feed/create.json?tag=${node.title}&name=${feed.name}&datatype=1&engine=${feed.engine}`;
  //   //   fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
  //   //     headers: {
  //   //       'Content-Type': 'application/json',
  //   //     },
  //   //     method: 'POST',
  //   //     body: JSON.stringify({ url }),
  //   //   });
  //   // }
  getData(id, from, to) {
    // id, interval (hour), skipmissing=0, limitinterval=1, getDelta=false
    //return fetch('/api/datasources/proxy/' + this.dataSourceId + '/status');
    //*
    return fetch(
      '/api/datasources/proxy/' +
        this.dataSourceId +
        `/etl/tempo-valore?id=${id}&start=${from}&end=${to}&interval=hour&skipmissing=0&limitinterval=1&getDelta=false`
    ); //*/
  }
  getState() {
    return this.feeds;
  }
  getFeeds() {
    return this.feeds;
  }
  getFeedById(id: string) {
    var feed = this.feeds.find((x) => x.id === id);
    if (feed) {
      return feed.name;
    }
    return id;
  }
  addListener(index: number, callable: CallableFunction) {
    this.listeners.push(callable);
  }
  callListeners(items: any[]) {
    for (var k = 0; k < this.listeners.length; ++k) {
      this.listeners[k](items);
    }
  }
  addErrorListener(callable: CallableFunction) {
    this.errorListeners.push(callable);
  }
  callErrorListener(error: any) {
    for (var k = 0; k < this.errorListeners.length; ++k) {
      this.errorListeners[k](error);
    }
  }
  addFeedListener(callable: CallableFunction) {
    this.feedsListeners.push(callable);
  }
  callFeedsListeners(items: any[]) {
    for (var k = 0; k < this.feedsListeners.length; ++k) {
      this.feedsListeners[k](items);
    }
  }
  addTreeFeedListener(callable: CallableFunction) {
    this.treeFeedsListeners.push(callable);
  }
  callTreeFeedsListeners(items: any[]) {
    for (var k = 0; k < this.treeFeedsListeners.length; ++k) {
      this.treeFeedsListeners[k](items);
    }
  }

  generateFeedPool() {
    const phases = [0, 1, 2, 't'];
    const measures = [
      'volt',
      'potenza',
      'fattore_potenza',
      'contatore_energia_importata',
      'contatore_energia_esportata',
    ];
    let feedPool = [];

    measures.forEach(function (measure) {
      phases.forEach(function (phase) {
        feedPool.push(`${measure}_${phase}`);
      });
    });
    return feedPool;
  }
}
const feedStore: FeedStore = new FeedStore();
export default feedStore;
