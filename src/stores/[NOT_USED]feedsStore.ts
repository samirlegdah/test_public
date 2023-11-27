// class FeedsStore {
//   dataSourceId = '';
//   feeds: any = [];
//   feedsListeners: CallableFunction[] = [];
//   errorListeners: CallableFunction[] = [];
//   constructor() {
//     // let key = localStorage.getItem('emon_api_key');
//     // if (key) {
//     //   this.setKey(key);
//     // }
//   }

//   setKey(key: string) {
//     this.dataSourceId = key;
//     if (this.dataSourceId) {
//       this.fetchFeeds();
//     }
//   }

//   fetchFeeds() {
//     fetch('/api/datasources/proxy/' + this.dataSourceId + '/tree', {
//       method: 'GET',
//     })
//       .then((resp) => {
//         if (!resp.ok) {
//           throw resp;
//         }
//         resp.json().then((json) => {
//           this.feeds = json.data.tree;
//           this.callFeedsListeners(this.feeds);
//         });
//       })
//       .catch((err) => {
//         this.callErrorListener(err);
//       });
//   }
//   // updateFeed(id: string, key: string, val: string) {
//   //   let url = `/feed/set.json?id=${id}&fields={"${key}":"${val}"}`;
//   //   return fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
//   //     method: 'POST',
//   //     body: JSON.stringify({ url }),
//   //   });
//   // }
//   // updateNode(nodeId: string, meta: any) {
//   //   for (var k = 0; k < this.feeds.length; ++k) {
//   //     if (this.feeds[k].title !== nodeId) {
//   //       continue;
//   //     }
//   //     for (var key in meta) {
//   //       this.feeds[k].meta[key] = meta[key];
//   //     }
//   //   }
//   //   return fetch('/api/datasources/proxy/' + this.dataSourceId + '/tree', {
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     method: 'POST',
//   //     body: JSON.stringify(this.feeds),
//   //   });
//   // }
//   // uploadCSV(data: any, feedId: string, fromEmon: string) {
//   //   return fetch('/api/datasources/proxy/' + this.dataSourceId + '/upload-csv', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify({ data, feedId, fromEmon: fromEmon === 'true' }),
//   //   })
//   //     .then((resp) => resp.json())
//   //     .then((data) => {
//   //       alert(data.msg);
//   //     })
//   //     .catch((err) => alert(err));
//   // }
//   // addNode(node: any) {
//   //   // this.feeds.push(node);
//   //   let engine = node.meta.oggettoTipo === 'Verifica' ? 7 : 2;
//   //   let data = { url: `/feed/create.json?tag=${node.title}&name=energia&datatype=1&engine=${engine}` };

//   //   return fetch('/api/datasources/proxy/' + this.dataSourceId + '/manage-devices', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify(data),
//   //   })
//   //     .then((resp) => {
//   //       resp.json();
//   //       this.addFeed(node, { name: 'potenza', engine: engine });
//   //     })
//   //     .catch((err) => alert(err));
//   // }
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
//   // getData(id, from, to) {
//   //   // id, interval (hour), skipmissing=0, limitinterval=1, getDelta=false
//   //   //return fetch('/api/datasources/proxy/' + this.dataSourceId + '/status');
//   //   //*
//   //   return fetch(
//   //     '/api/datasources/proxy/' +
//   //       this.dataSourceId +
//   //       `/etl/tempo-valore?id=${id}&start=${from}&end=${to}&interval=hour&skipmissing=0&limitinterval=1&getDelta=false`
//   //   ); //*/
//   // }

//   // getState() {
//   //   return this.feeds;
//   // }
//   // getFeeds() {
//   //   return this.feeds;
//   // }
//   // getFeedById(id: string) {
//   //   var feed = this.feeds.find((x: any) => x.id === id);
//   //   if (feed) {
//   //     return feed.name;
//   //   }
//   //   return id;
//   // }
//   // addErrorListener(callable: CallableFunction) {
//   //   this.errorListeners.push(callable);
//   // }
//   // callErrorListener(error: any) {
//   //   for (var k = 0; k < this.errorListeners.length; ++k) {
//   //     this.errorListeners[k](error);
//   //   }
//   // }
//   // addFeedListener(callable: CallableFunction) {
//   //   this.feedsListeners.push(callable);
//   // }
//   // callFeedsListeners(items: any[]) {
//   //   for (var k = 0; k < this.feedsListeners.length; ++k) {
//   //     this.feedsListeners[k](items);
//   //   }
//   // }
// }
// const feedStore = new FeedsStore();
// export default feedStore;
