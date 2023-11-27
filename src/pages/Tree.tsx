import React, { FC, useState, useEffect } from 'react';
import feedStore from 'stores/feedStore';
import SortableTree, {
  defaultGetNodeKey,
  defaultSearchMethod,
  ExtendedNodeData,
  FullTree,
  getNodeAtPath,
  NodeData,
  NodeRenderer,
  OnDragPreviousAndNextLocation,
  OnMovePreviousAndNextLocation,
  OnVisibilityToggleData,
  PlaceholderRendererProps,
  SortableTreeWithoutDndContext,
  ThemeProps,
  TreeItem,
  getTreeFromFlatData,
  getFlatDataFromTree,
} from 'react-sortable-tree';
import '../css/inputs.css';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app
import 'semantic-ui-css/semantic.min.css';
import {
  addNodeUnderParent,
  removeNodeAtPath,
  changeNodeAtPath,
  getFolders,
  getDashboardsByTitle,
  makeDashboard,
  gotoDashboard,
  getDataSourceById,
} from '../utils/utils';
import Modal from 'react-modal';
import { AppRootProps } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Dropdown } from 'semantic-ui-react';
import 'react-contexify/dist/ReactContexify.css';

type TreeProps = {
  inputs: any[];
  tree: any[];
};

type TreeState = {
  treeData: Array<{}>;
  nodeList: Array<{}>;
  modalOpen: boolean;
  choiceOfGraphsShowed: boolean;
  graphesToCreate: boolean[]; //{ 1: true; 2: true; 3: true; 4: true; 5: true };
  graphesToDisable: boolean[]; //{ 1: true; 2: true; 3: true; 4: true; 5: true };
  name: string;
  tipo: 'nodo';
  meta: {
    reparto: '';
    area: '';
    destinazione: '';
    nPhase: number;
    type: string;
    icon: string;
    potenzaMax: 0;
    durataCiclo: 0;
    numeroCicli: 0;
    cicliSpezzabili: false;
  };
  curNode: {
    disabled: true;
    title: '';
    meta: {
      type: string;
      icon: string;
      area: '';
      destinazione: '';
      nPhase: number;
    };
    graphesToCreate: [true, true, true, true, true, true, true, true, true, true]; //{ 1: true; 2: true; 3: true; 4: true; 5: true };
    graphesToDisable: [true, true, true, true, true, true, true, true, true, true]; //{ 1: true; 2: true; 3: true; 4: true; 5: true };
  };
  timestamp: string;
  step: string;
};

class SETree extends React.Component<TreeProps, TreeState> {
  private _inputs: Set<string>;

  state: TreeState;

  flatTree: any;

  constructor(props: any) {
    super(props);
    console.log('props', props);

    if (!localStorage.getItem('step')) {
      localStorage.setItem('step', '2');
    }

    console.log('constructor: Legge treeData dal localStorage');
    var treeDataFromLocalStorage = [];
    if (localStorage.getItem('treeData')) {
      treeDataFromLocalStorage = JSON.parse(localStorage.getItem('treeData'));
    }
    console.log('treeDataFromLocalStorage:', treeDataFromLocalStorage);

    treeDataFromLocalStorage = this.makeTreeFromRemote(props.tree);

    //Crea lista dei nodi a partire dai loro nomi
    this._inputs = new Set();
    for (let x of props.inputs) {
      if (this.findNodeByTitle(x, treeDataFromLocalStorage) === false) {
        this._inputs.add(x);
      }
    }
    console.log('_inputs: ', this._inputs);

    //if (this.findNodeByTitle(x, treeDataFromLocalStorage[0])) {

    this.state = {
      // treeData: [{ title: 'Root', children: this.props.tree, type: 'nodo' }],
      treeData: treeDataFromLocalStorage,
      nodeList: [],
      modalOpen: false,
      choiceOfGraphsShowed: true,
      graphesToCreate: [true, true, true, true, true, true, true, true, true, true], //{ 1: true, 2: true, 3: true, 4: true, 5: true },
      graphesToDisable: [true, true, true, true, true, true, true, true, true, true], //{ 1: true, 2: true, 3: true, 4: true, 5: true },
      name: '',
      tipo: 'nodo',
      meta: {
        reparto: '',
        area: '',
        destinazione: '',
        nPhase: 1,
        type: 'misura',
        icon: 'misura',
        potenzaMax: 0,
        durataCiclo: 0,
        numeroCicli: 0,
        cicliSpezzabili: false,
      },
      curNode: {
        disabled: true,
        title: '',
        meta: {
          type: 'misura',
          icon: 'misura',
          nPhase: 1,
          area: '',
          destinazione: '',
        },
        graphesToCreate: [true, true, true, true, true, true, true, true, true, true], //{ 1: true, 2: true, 3: true, 4: true, 5: true },
        graphesToDisable: [true, true, true, true, true, true, true, true, true, true], //{ 1: true, 2: true, 3: true, 4: true, 5: true },
      },
      timestamp: '',
      step: localStorage.getItem('step'),
    };

    this.flatTree = [];

    console.log('IMPOSTA STEP', localStorage.getItem('step'));
    this.setState((state) => ({
      step: localStorage.getItem('step'),
    }));
  }

  onChange(treeData: any): void {
    console.log('onChange:', treeData);
    this.setState(treeData, () => this.flatTreeRearrange());

    this.addPuntiDiVerifica(this.state.treeData[0]); //this.state.treeData);
  }

  flatTreeRearrange(): void {
    let flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.title,

      // The last entry in the path is this node's key
      // The second to last entry (accessed here) is the parent node's key
      parent: path.length > 1 ? path[path.length - 2] : null,
    }));
    console.log('flatTreeRearrange:', flatData);
    this.flatTree = flatData;
  }

  closeModal = () => {
    this.setState((state) => ({
      modalOpen: false,
    }));
  };

  openModal = (node) => {
    console.log('in openmodal node:', node);
    console.log('in openmodal tree:', this.props.tree);
    if (!node.hasOwnProperty('graphesToCreate')) {
      node.graphesToCreate = [true, true, true, true, true, true, true, true, true, true];
    }
    node.graphesToDisable = [true, true, true, true, true, true, true, true, true, true];

    //Verifica i feed del nodo per abilitare i grafici
    //let feeds = this.props.tree.filter((x) => x.title === node.title);
    let feeds = node.meta.feeds;
    console.log('feeds:', feeds);
    if (feeds) {
      //feeds = feeds[0].meta.feeds;
      node.graphesToDisable[1] = node.graphesToDisable[5] = feeds.filter((x) => x.name === 'corrente_t').length >= 1;
      node.graphesToDisable[2] = node.graphesToDisable[6] = feeds.filter((x) => x.name === 'volt_t').length >= 1;
      node.graphesToDisable[3] = node.graphesToDisable[7] = feeds.filter((x) => x.name === 'potenza_t').length >= 1;
      node.graphesToDisable[4] = node.graphesToDisable[8] =
        feeds.filter((x) => x.name === 'fattore_potenza_t').length >= 1;
      node.graphesToDisable[9] =
        feeds.filter((x) => x.name === 'contatore_energia_importata_t').length >= 1 ||
        feeds.filter((x) => x.name === 'contatore_energia_esportata_t').length >= 1;
    }
    this.setState((state) => ({
      modalOpen: true,
      name: '',
      curNode: node,
    }));
  };

  /**
   *
   * @param node
   * @param graphesToCreate
   *
   * NON UTILIZZATO
   */
  saveNode = (node, graphesToCreate) => {
    console.log('in savenode:', node);
    console.log('in savenode:', graphesToCreate);
    getFolders().then((data) => {
      console.log(data);
      const folderId = data.find((x) => x.title === 'Consumi real time').id;
      console.log('folder id:', folderId);

      getDashboardsByTitle(node.title).then((data) => {
        console.log('getDashboardsByTitle', data);
        let dashboardId = null;
        let dashboardUid = null;
        let dashboards = data.find((x) => x.title === node.title);
        if (dashboards) {
          dashboardId = dashboards.id;
          dashboardUid = dashboards.uid;
        }
        //console.log('dashboard id:', dashboardId, dashboardUid);
        //makeDashboard(node, folderId, graphesToCreate, dashboardId, dashboardUid);
        //alert('Dashboard creata correttamente');
      });

      //alert('Dashboard creata correttamente');
    });
  };

  createNode = (name) => {
    //engine: 2=real feed, 7=virtual
    const url = `/feed/create.json?tag=${name}&name=${name}&datatype=1&engine=7`;
    fetch('/api/datasources/proxy/' + localStorage.getItem('dataSourceId') + '/manage-devices', {
      headers: {
        //'x-rre-apikey': feedStore.EMONCMS_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url }),
    })
      .then(() => {
        //alert('ok');
        console.log('done');
      })
      .catch((err: any) => {
        alert('Non è stato possibile creare il nuovo Valore');
      });
  };

  /**
   * Salva il tree in localStorage e in remoto
   *
   * @param tree
   */
  saveTree = (tree) => {
    console.log('saveTree:', tree);
    console.log('inputs', this._inputs);

    getDataSourceById(localStorage.getItem('dataSourceId')).then((data) => {
      console.log('getDataSourceById', data);
    });
    if (confirm('Sei sicuro di voler salvare e passare alla fase successiva?')) {
      localStorage.setItem('step', '2');
      localStorage.setItem('treeData', JSON.stringify(this.state.treeData));
      this.setState((state) => ({
        step: localStorage.getItem('step'),
      }));

      //body per il POST
      /*let _body = JSON.stringify([
        {
          selected: true,
          title: 'analiz-rete',
          meta: {
            id: 'analiz-rete',
            area: 'Area'+Math.random(),
            reparto: 'Reparto1',
            destinazione: 'Destinazione'+Math.random(),
            nPhase: 3,
            type: 'misura',
            icon: 'misura',
          },
          children: [
            {
              selected: false,
              title: 'fv-5kw',
              meta: {
                id: 'fv-5kw',
                area: 'Area2',
                reparto: 'Reparto2',
                destinazione: 'Destinazione'+Math.random(),
              },
              children: [],
              _id: false,
            },
          ],
          _idwww: false,
        },
      ]);
      */

      //
      //this.createNode('verifica');

      let _body = JSON.stringify(this.prepareTreeForSave(tree));
      console.log('body', _body);

      //POST verso digitial ocean
      fetch('/api/datasources/proxy/' + localStorage.getItem('dataSourceId') + '/tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: _body,
      })
        .then((resp) => {
          if (!resp.ok) {
            throw resp;
          }
          return resp.json();
        })
        .then((json) => {
          console.log(json);
          alert('ok');
        })
        .catch((err) => {
          console.log(err);
        });
      //...

      alert('Tree salvato con successo!');
    }
  };

  /**
   *
   *
   * @param tree
   */
  editTree = (tree) => {
    console.log('editTree:', tree);
    if (confirm('Sei sicuro di voler tornare alla fase di design?')) {
      localStorage.setItem('step', '1');
      this.setState((state) => ({
        step: localStorage.getItem('step'),
      }));
    }
  };

  /**
   * Redirige verso la dashboard del sankey
   *
   * @param tree
   */
  showFlow = (tree) => {
    console.log('showFlow:', tree);
    this.makeSankey();
    const element = document.getElementById('energyflow');
    element.scrollIntoView(true);
    //gotoDashboard('AnalisiFlusso', 'var-dispositivo=');
    // alert('WORK IN PROGRESS');
  };

  /**
   * Verifica correttezza formale del flusso
   *
   * @param tree
   */
  checkFlow = (tree) => {
    console.log('checkFlow:', tree);
    alert('Verifica terminata con successo!');
  };

  /**
   *
   */
  toggleChoiceOfGraphs = () => {
    this.setState((state) => ({
      choiceOfGraphsShowed: !state.choiceOfGraphsShowed,
    }));
  };

  /**
   * Aggiorna nome nodo
   *
   * @param name
   */
  updateName = (name) => {
    console.log('updateName:', this.state.curNode);
    let node = null;
    if (this.state.curNode) {
      node = this.state.curNode;
      node.title = name;
    }
    this.setState((state) => ({
      name: name,
      curNode: node,
    }));
  };

  /**
   * Aggiorna icona nodo
   *
   * @param name
   */
  updateIcon = (icon) => {
    console.log('updateIcon:', this.state.curNode);
    let node = null;
    if (this.state.curNode) {
      node = this.state.curNode;
      node.meta.icon = icon;
    }
    this.setState((state) => ({
      curNode: node,
    }));
  };

  /**
   * Aggiorna fase
   *
   * @param event
   */
  updatenPhase = (event) => {
    console.log('updatenPhase:', event.target.value);
    let node = null;
    if (this.state.curNode) {
      node = this.state.curNode;
      node.meta.nPhase = event.target.value;
    }
    this.setState({
      ...this.state,
      curNode: node,
    });

    console.log('updatenPhase', this.state.curNode);
  };

  /**
   *
   * @param event
   */
  updateGraphes = (event) => {
    console.log('updateGraphes:', event.target.value);
    console.log('updateGraphes:', this.state.curNode);
    console.log('updateGraphes:', this.state.graphesToCreate);
    let graphesToCreate = this.state.graphesToCreate; //this.state.curNode.graphesToCreate;
    console.log('updateGraphes:', graphesToCreate);
    graphesToCreate[event.target.value] = event.target.checked;
    //graphesToCreate = [1];//{ 1: true, 2: true, 3: true, 4: true, 5: true };
    let node = null;
    if (this.state.curNode) {
      node = this.state.curNode;
      node.graphesToCreate = graphesToCreate;
    }
    this.setState((state) => ({
      ...this.state,
      //graphesToCreate: graphesToCreate,
      curNode: node,
    }));

    console.log('updateGraphes', this.state.curNode);
  };

  /**
   * Aggiorna destinazione
   *
   * @param name
   */
  updateDestinazione = (name) => {
    console.log('updateDestinazione:', this.state.curNode);
    let node = null;
    if (this.state.curNode) {
      node = this.state.curNode;
      node.meta.destinazione = name;
    }
    this.setState((state) => ({
      ...this.state,
      curNode: node,
    }));
  };

  /**
   * Attiva/Disabilita nodi
   *
   * @param treeData
   * @returns
   */
  findAndToggleDisabled = (treeData) => {
    const data = treeData; // JSON.parse(JSON.stringify(treeData));
    // const rowMeta = rowInfo.node.meta;
    data.disabled = !data.disabled;
    // data.expanded = !data.disabled;
    console.log('data', data);
    if (data.children) {
      for (const node of data.children) {
        console.log('node', node);
        // node.expanded = !data.disabled;
        if (node.children && node.children.length > 0) {
          this.findAndToggleDisabled(node);
        } else {
          node.disabled = data.disabled;
        }
      }
    }

    return data;
  };

  /**
   * Cerca nel tree in maniera ricorsiva il nodo con title "title"
   *
   * @param title
   * @param treeData
   * @returns
   */
  findNodeByTitle = (title, treeData) => {
    let ret = false;
    const data = treeData; // JSON.parse(JSON.stringify(treeData));
    console.log('in findNodeByTitle', title, data);
    /*if (!data) {
      return false;
    }*/

    for (const x of data) {
      if (x.title.toLowerCase().indexOf(title.toLowerCase()) > -1) {
        ret = x;
        break;
      } else {
        if (x.children.length > 0) {
          ret = this.findNodeByTitle(title, x.children);
        }
      }
    }

    return ret;
  };

  /**
   * Cerca nel tree in maniera ricorsiva il nodo con title "title"
   *
   * @param title
   * @param treeData
   * @returns
   */
  prepareTreeForSave = (treeData) => {
    let ret = false;
    if (!treeData) {
      return false;
    }

    for (const x of treeData) {
      //Rimuove i feeds
      if (x.meta) {
        delete x.meta.feeds;
        if (['verifica', 'nodo'].includes(x.meta.type)) {
          var node = x;
          node.meta.oggettoTipo = x.meta.type === 'verifica' ? 'Verifica' : 'nodo';
          feedStore.addNode(node);
          //this.createNode(x.title);
        }
      }

      //Imposta il flag che indica che il nodo è usato nel tree
      x.selected = true;

      //Ricorsione
      if (x.children) {
        this.prepareTreeForSave(x.children);
      }
    }

    return treeData;
  };

  /**
   *
   * @param tree
   */
  makeTreeFromRemote = (tree) => {
    let count = 0;
    let ret = [];
    for (const x of tree) {
      if (x.selected) {
        x.id = count++;
        x.parent = 0;
        x.expanded = true;

        //Ricorsione
        if (x.children) {
          this.makeTreeFromRemote(x.children);
        }
        ret.push(x);
      }
    }

    console.log('makeTreeFromRemote', ret);
    return ret;
  };

  /**
   * Aggiunge punti di verifica al tree
   *
   * @param treeData
   * @returns
   */
  addPuntiDiVerifica = (treeData) => {
    console.log('addPuntiDiVerifica', treeData);
    const data = treeData; // JSON.parse(JSON.stringify(treeData));
    return data; //PER ORA EVITIAMO IL CALCOLO DEI PUNTI DI VERIFICA
    const getNodeKey = ({ treeIndex }) => treeIndex;
    //const parentIndex = data.id;
    const parentIndex = this.flatTree.findIndex((x) => x.id === data.id);
    if (data.children) {
      if (data.children.length > 1) {
        var existsVerifica = data.children.find((x) => x.meta.type === 'verifica');
        if (!existsVerifica) {
          console.log('Aggiungi punto di verifica');
          const idx = Date.now();
          const name = 'Verifica' + idx;
          let newTreeData = addNodeUnderParent({
            treeData: this.state.treeData,
            parentKey: null, // parentIndex,
            expandParent: true,
            getNodeKey,
            newNode: {
              title: name,
              meta: {
                type: 'verifica',
                icon: 'verifica',
              },
              id: idx,
              parent: parentIndex,
            },
            addAsFirstChild: true,
          }).treeData;
          this.setState({ treeData: newTreeData }, () => {
            console.log('in setState', this.state);
            this.flatTreeRearrange();
          });
        }
      }

      for (const node of data.children) {
        console.log('node', node);
        // node.expanded = !data.disabled;
        if (node.children && node.children.length > 0) {
          this.addPuntiDiVerifica(node);
        }
      }
    }

    return data;
  };

  /**
   * Genera elenco dei nodi/dispositivi (elenco a sx)
   *
   * @returns
   */
  makeButtons() {
    console.log('chiamato makebuttons!');
    console.log(this._inputs);
    console.log(this.props.inputs);
    console.log(config.bootData.user);
    const getNodeKey = ({ treeIndex }) => treeIndex;
    var parentKey = this.state.treeData.length === 0 ? null : 0;
    //var inps = this.props.inputs.map(
    var inps = Array.from(this._inputs).map(
      (node, index) =>
        this._inputs.has('' + node) && (
          <a
            style={{ display: 'block' }}
            title={'Strumento di misura: ' + node}
            key={index}
            onClick={() => {
              //if (node.type === 'nodo' && this.props.tree.length === 0) {
              if (this.props.tree.length === 0) {
                return;
              }
              //let n = this.findNodeByTitle(node, this.props.tree[0]);
              let n = this.findNodeByTitle(node, this.props.tree);
              console.log('onClick', n, node);
              let newTreeData = addNodeUnderParent({
                treeData: this.state.treeData,
                parentKey: null, // parentKey,
                expandParent: true,
                getNodeKey,
                newNode: {
                  id: index,
                  title: node,
                  //type: 'misura',
                  //icon: 'misura',
                  //nPhase: 1,
                  //index: index,
                  parent: 0,
                  meta: n.meta, // this.props.tree.find((x) => x.title === node).meta,
                },
              }).treeData;
              console.log('newTreeData', newTreeData);
              //this.state.treeData = newTreeData
              console.log('state pre', this.state);
              //this.setState(newTreeData);

              this.setState({ treeData: newTreeData }, () => {
                console.log('in setState', this.state, node, index);
                this.flatTreeRearrange();
                //this.addPuntiDiVerifica(this.props.tree.find((x) => x.title === node).meta); //this.state.treeData);
                this.addPuntiDiVerifica(this.state.treeData[0]); //this.state.treeData);
              });

              // console.log('state post', this.state);
              this._inputs.delete('' + node);
              //console.log('albero', this.state.treeData);
              //this.addPuntiDiVerifica(this.props.tree.find((x) => x.title === node).meta); //this.state.treeData);
            }}
          >
            <table>
              <tr>
                <td>
                  <img
                    style={{ width: '32px', border: '1px solid', padding: '5px' }}
                    src={'public/plugins/struttureenergia-inputfeeds-app/img/misura.png'}
                  />
                </td>
                <td>
                  <span>{node}</span>
                </td>
              </tr>
            </table>
          </a>
        )
    );
    return inps;
  }

  /**
   *
   * @returns
   */
  makeSankey() {
    let flatData = getFlatDataFromTree({
      treeData: this.state.treeData,
      getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
      ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
    }).map(({ node, path }) => ({
      id: node.id,
      name: node.title,

      // The last entry in the path is this node's key
      // The second to last entry (accessed here) is the parent node's key
      parent: path.length > 1 ? path[path.length - 2] : null,
    }));
    console.log('makeSankey flatData:', flatData);
    console.log('makeSankey inputs:', this.props.inputs);

    let inputs = this.props.inputs;

    //Aggiunge nodi mancanti a inputs
    for (let x of flatData) {
      if (x.parent !== null) {
        if (inputs[x.id] === undefined) {
          inputs[x.id] = x.name;
        }
      }
    }

    let res = [];
    for (let x of flatData) {
      if (x.parent !== null) {
        let source = inputs[x.parent];
        let target = inputs[x.id];
        res.push({ source: source, target: target, value: Math.random() * 10 });
      }
    }

    localStorage.setItem('sankey', JSON.stringify(res));
    console.log('sankey:', res);
    return res;
  }

  /**
   *
   * @param node
   */
  moveSubtreeToInput(node) {
    console.log('moveSubtreeToInput', node);
    if (node.meta.type === 'misura') {
      this._inputs.add('' + node.title);
      console.log(this._inputs);
    }
    if (node.children && node.children.length > 0) {
      for (const x of node.children) {
        this.moveSubtreeToInput(x);
      }
    }
  }

  /**
   *
   * @returns
   */
  render() {
    console.log('STEP:', this.state.step);

    const canDrop = ({ node, nextParent, prevPath, nextPath }) => {
      //console.log('in candrop', node, nextParent, prevPath);
      console.log(localStorage.getItem('step'));
      //Se siamo in fase 2 non si possono muovere i nodi
      if (localStorage.getItem('step') !== '1') {
        return false;
      }

      //Se nodo di tipo verifica non permetterne lo spostamento (RIMOSSO)
      //if (node.meta.type && node.meta.type === 'verifica') {
      //  return false;
      //}
      if (prevPath.indexOf('trap') >= 0 && nextPath.indexOf('trap') < 0) {
        return false;
      }

      if (node.isTwin && nextParent && nextParent.isTwin) {
        return false;
      }

      const noGrandkidsDepth = nextPath.indexOf('no-grandkids');
      if (noGrandkidsDepth >= 0 && nextPath.length - noGrandkidsDepth > 2) {
        return false;
      }

      return true;
    };

    const test = () => {
      let flatData = getFlatDataFromTree({
        treeData: this.state.treeData,
        getNodeKey: ({ node }) => node.id, // This ensures your "id" properties are exported in the path
        ignoreCollapsed: false, // Makes sure you traverse every node in the tree, not just the visible ones
      }).map(({ node, path }) => ({
        id: node.id,
        name: node.title,

        // The last entry in the path is this node's key
        // The second to last entry (accessed here) is the parent node's key
        parent: path.length > 1 ? path[path.length - 2] : null,
      }));
      console.log('test flatData:', flatData);
      console.log('test inputs:', this.props.inputs);
      return flatData;
    };

    const iconsList = [
      {
        key: 'Misura',
        text: 'Misura',
        value: 'misura',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/misura.png' },
      },
      {
        key: 'Pannello elettrico',
        text: 'Pannello elettrico',
        value: 'electrical-panel',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/electrical-panel.png' },
      },
      {
        key: 'Forno',
        text: 'Forno',
        value: 'forno',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/forno.png' },
      },
      {
        key: 'Frigorifero',
        text: 'Frigorifero',
        value: 'frigo',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/frigo.png' },
      },
      {
        key: 'Lavatrice',
        text: 'Lavatrice',
        value: 'lavatrice',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/lavatrice.png' },
      },
      {
        key: 'Pompa di calore',
        text: 'Pompa di calore',
        value: 'pompa-calore',
        image: { avatar: true, src: 'public/plugins/struttureenergia-inputfeeds-app/img/pompa-calore.png' },
      },
    ];

    const getNodeKey = ({ treeIndex }) => treeIndex;

    return (
      <div style={{ height: 800 }}>
        <div
          style={{
            width: '100%',
            height: '40px',
            padding: '10px',
            backgroundColor: 'white',
            textAlign: 'center',
            color: 'black',
          }}
        >
          {this.state.step === '1' && <h2>FASE di PROGETTAZIONE</h2>}
          {this.state.step === '2' && <h2>FASE di VISUALIZZAZIONE</h2>}
        </div>
        <br></br>
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            width: '25%',
            border: '1px solid',
            height: '100%',
            float: 'left',
            overflow: 'auto',
          }}
        >
          <div style={{ width: '100%', height: '50px', padding: '10px', backgroundColor: 'white' }}>
            {this.state.step === '1' && (
              <div>
                <button
                  style={{ float: 'left', width: '100%' }}
                  onClick={(event) => this.checkFlow(this.state.treeData)}
                >
                  Analizza correttezza flusso
                </button>
                <br></br>
                <br></br>
                <button
                  style={{ float: 'left', width: '100%' }}
                  onClick={(event) => this.saveTree(this.state.treeData)}
                >
                  Salva
                </button>
              </div>
            )}
            {this.state.step === '2' && (
              <div>
                <button
                  style={{ float: 'left', width: '100%' }}
                  onClick={(event) => this.editTree(this.state.treeData)}
                >
                  Modifica
                </button>
                <br></br>
                <br></br>
                <button
                  style={{ float: 'left', width: '100%' }}
                  onClick={(event) => this.showFlow(this.state.treeData)}
                >
                  Visualizza flusso
                </button>
              </div>
            )}
            <br></br>
            {false && (
              <button style={{ float: 'left', width: '100%' }} onClick={(event) => test()}>
                Test
              </button>
            )}
            <br></br>
          </div>
          <br></br>
          <br></br>
          {this.state.step === '1' && (
            <div>
              <a
                style={{ display: 'block' }}
                title="Nodo"
                key="btnAdd"
                onClick={() => {
                  const idx = Date.now();
                  const name = 'Nodo' + idx;
                  this.setState((state) => ({
                    treeData: addNodeUnderParent({
                      treeData: state.treeData,
                      parentKey: this.flatTree.length === 0 ? null : 0,
                      expandParent: true,
                      getNodeKey,
                      newNode: {
                        title: name,
                        id: idx,
                        meta: {
                          type: 'nodo',
                          icon: 'nodo',
                        },
                        parent: 0,
                      },
                    }).treeData,
                  }));
                }}
              >
                <img
                  style={{ width: '32px', border: '1px solid', padding: '5px' }}
                  src={'public/plugins/struttureenergia-inputfeeds-app/img/nodo.png'}
                />
              </a>
              <a
                style={{ display: 'block' }}
                title="Punto di verifica"
                key="btnAdd"
                onClick={() => {
                  const idx = Date.now();
                  const name = 'Verifica' + idx;
                  this.setState((state) => ({
                    treeData: addNodeUnderParent({
                      treeData: state.treeData,
                      parentKey: null,
                      expandParent: true,
                      getNodeKey,
                      newNode: {
                        title: name,
                        id: idx,
                        meta: {
                          type: 'verifica',
                          icon: 'verifica',
                        },
                        parent: 0,
                      },
                    }).treeData,
                  }));
                }}
              >
                <img
                  style={{ width: '32px', border: '1px solid', padding: '5px' }}
                  src={'public/plugins/struttureenergia-inputfeeds-app/img/verifica.png'}
                />
              </a>
              {this.makeButtons()}
            </div>
          )}
        </div>
        <SortableTree
          treeData={this.state.treeData}
          onChange={(treeData) => this.onChange({ treeData })}
          canDrop={canDrop}
          canNodeHaveChildren={(node) => node.meta.type !== 'verifica'}
          rowHeight={70}
          slideRegionSize={100}
          scaffoldBlockPxWidth={44}
          innerStyle={{ backgroundColor: '#FFFFFF' }}
          generateNodeProps={({ node, path }) => ({
            style: {
              // boxShadow: node.disabled === true ? `0 0 0 4px Red` : 'none',
              opacity: node.disabled === true ? `0.2` : `1`,
              filter: node.disabled === true ? `grayscale(1)` : `none`,
              height: '60px',
            },
            title: (
              <div>
                <div
                  title={'' + node.title}
                  style={{
                    display: 'block',
                    position: 'absolute',
                    left: '-35px',
                    zIndex: 9999,
                    top: '0px',
                  }}
                >
                  {('' + node.title).substring(0, 3)}
                </div>
                <img
                  style={{
                    width: '54px',
                    border: '1px solid',
                    padding: '0px',
                    backgroundColor: node.disabled === true ? 'white' : 'white',
                  }}
                  src={'public/plugins/struttureenergia-inputfeeds-app/img/' + node.meta?.icon + '.png'}
                  onClick={(event) => {
                    // this.openModal();
                    //node.disabled = !node.disabled;
                    //node.expanded = !node.disabled;
                    //console.log(node);
                    //console.log(path);
                    //window.console.log('click');
                    //this.findAndToggleSelected(this.state.treeData, node);
                    const tree = this.findAndToggleDisabled(node);
                    console.log('disable', tree);
                    this.setState((state) => ({
                      treeData: state.treeData,
                      timestamp: '',
                    }));
                  }}
                />
                {node && node.meta.type !== 'nodo' && (
                  <img
                    style={{
                      width: '32px',
                      border: node.meta && node.meta.nPhase ? '1px solid' : '',
                      padding: '0px',
                      backgroundColor: node.disabled === true ? 'white' : 'white',
                    }}
                    src={'public/plugins/struttureenergia-inputfeeds-app/img/nphase_' + node.meta.nPhase + '.png'}
                    title={node.meta.nPhase}
                    onClick={(event) => {
                      if (this.state.step === '1' && node.meta.nPhase) {
                        if (node.meta.nPhase === 1) {
                          node.meta.nPhase = 3;
                        } else {
                          node.meta.nPhase = 1;
                        }
                        this.setState({
                          ...this.state,
                        });
                      }
                    }}
                  />
                )}
                <Dropdown icon="bars" floating button className="icon">
                  <Dropdown.Menu>
                    <Dropdown.Header icon="bars" content="" />
                    <Dropdown.Divider />
                    {this.state.step === '1' && ['verifica', 'nodo'].includes(node.meta.type) === false && (
                      <Dropdown.Item
                        icon="edit"
                        text="Edita nodo"
                        onClick={(event) => {
                          if (node.type === 'nodo') {
                            return;
                          }
                          const folderId = getFolders().then((data) => {
                            console.log(data);
                            return data;
                          });
                          this.openModal(node);
                        }}
                      />
                    )}
                    {['verifica', 'nodo'].includes(node.meta.type) === false && (
                      <Dropdown.Item
                        icon="chart area"
                        text="Vai ai grafici"
                        onClick={function () {
                          //this.openModal2(node)
                          let trifase = node.meta.nPhase === 1 ? 'no' : '*';

                          //Crea stringa di 0 e 1 che indicano se attivare o meno i grafici i-esimi
                          let grfsmask = '1111111111';
                          if (node.graphesToCreate) {
                            grfsmask = node.graphesToCreate
                              .map((i, index) => (i ? (node.graphesToDisable[index] ? 1 : 0) : 0))
                              .join('');
                          }

                          gotoDashboard(
                            'TempoReale',
                            'var-dispositivo=' + node.title + '&var-trifase=' + trifase + '&grfs=' + grfsmask
                          );
                          // makeDashboard(node.title, 9);
                        }}
                      />
                    )}
                    {this.state.step === '1' && (
                      <Dropdown.Item
                        icon="delete"
                        text="Cancella nodo"
                        onClick={() => {
                          this.setState((state) => ({
                            treeData: removeNodeAtPath({
                              treeData: state.treeData,
                              path,
                              getNodeKey,
                            }),
                          }));

                          this.moveSubtreeToInput(node);
                        }}
                      />
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ),
            buttons: [
              <button
                key="btnData"
                style={{ display: 'none' }}
                title="Vai alla dashboard"
                onClick={function () {
                  //alert('Data');
                  const folderId = getFolders();
                  console.log(folderId);
                  gotoDashboard('TempoReale', 'var-dispositivo=' + node.title);
                  // makeDashboard(node.title, 9);
                }}
              >
                D
              </button>,
              <button
                style={{ display: 'none' }}
                key="btnAdd"
                onClick={() =>
                  this.setState((state) => ({
                    treeData: addNodeUnderParent({
                      treeData: state.treeData,
                      parentKey: path.length === 0 ? null : path[path.length - 1],
                      expandParent: true,
                      getNodeKey,
                      newNode: {
                        title: 'new',
                        meta: {
                          type: 'nodo',
                          icon: 'nodo',
                        },
                      },
                    }).treeData,
                  }))
                }
              >
                +
              </button>,
              <button
                key="btnDel"
                style={{ display: 'none' }}
                title="Rimuovi nodo"
                disabled={node.type === 'verifica'}
                onClick={() =>
                  this.setState((state) => ({
                    treeData: removeNodeAtPath({
                      treeData: state.treeData,
                      path,
                      getNodeKey,
                    }),
                  }))
                }
              >
                C
              </button>,
            ],
          })}
        />
        <Modal isOpen={this.state.modalOpen} ariaHideApp={false} className="dialog-large">
          <div className="container w-100">
            <div className="row">
              <h3 className="col-sm-12 text-center">Modifica</h3>
            </div>
            <div className="row pb-3">
              <div className="col-sm-12">
                <div className="row">
                  <b className="col-sm-3 mt-4">Nome oggetto:</b>
                  <input
                    value={this.state.curNode.title}
                    className="form-control col-sm-9"
                    placeholder="Nome oggetto"
                    onChange={(e) => this.updateName(e.target.value)}
                  />
                </div>
                <div className="row">
                  <b className="col-sm-3 mt-4">Tipo:</b>
                  <div className="form-control col-sm-9">{this.state.curNode.meta?.type}</div>
                </div>
                {this.state.curNode.meta?.type.indexOf('misura') > -1 && (
                  <div className="row">
                    <b className="col-sm-3 mt-4">Icona:</b>
                    <div className="form-control col-sm-9">
                      <Dropdown
                        onChange={(e, value) => this.updateIcon(value.value)}
                        inline
                        fluid
                        selection
                        options={iconsList}
                        adefaultValue={iconsList[0].value}
                        value={this.state.curNode.meta.icon}
                      />
                    </div>
                  </div>
                )}
                {false && this.state.curNode.meta.type.indexOf('misura') > -1 && (
                  <div className="row">
                    <b className="col-sm-3 mt-4">ID dati di misura:</b>
                    <div className="form-control col-sm-9">n.d.</div>
                  </div>
                )}
                <div className="row">
                  <b className="col-sm-3 mt-4">Fasi:</b>
                  <select
                    className="form-control col-sm-9"
                    value={this.state.curNode.meta.nPhase}
                    onChange={this.updatenPhase}
                  >
                    <option value="1">Monofase</option>
                    <option value="3">Trifase</option>
                  </select>
                </div>
                {false && (
                  <div className="row">
                    <b className="col-sm-3 mt-4">Dati collettati:</b>
                  </div>
                )}
                <div className="row">
                  <b className="col-sm-3 mt-4">Attivo:</b>
                  <select className="form-control col-sm-9">
                    <option selected={!this.state.curNode.disabled}>Si</option>
                    <option selected={this.state.curNode.disabled}>No</option>
                  </select>
                </div>
                <div className="row">
                  <b className="col-sm-3 mt-4">{"Destinazione d'uso:"}</b>
                  <input
                    value={this.state.curNode.meta.destinazione}
                    className="form-control col-sm-9"
                    placeholder="Destinazione d'uso"
                    onChange={(e) => this.updateDestinazione(e.target.value)}
                  />
                </div>
                <div className="row">
                  <b className="col-sm-3 mt-4">Classificazione: </b>
                  <select className="form-control col-sm-9">
                    <option>Attività principale</option>
                    <option>Servizi generali</option>
                    <option>Servizi ausiliari</option>
                  </select>
                </div>
                <div className="row">
                  <b className="col-sm-3 mt-4">Grafici da visualizzare:</b>
                  {false && (
                    <select
                      className="form-control col-sm-9"
                      onChange={(event) => {
                        this.toggleChoiceOfGraphs();
                      }}
                    >
                      <option>Si</option>
                      <option selected>No</option>
                    </select>
                  )}
                </div>
                {this.state.choiceOfGraphsShowed && (
                  <div className="row graphsBlock" id="graphsBlock">
                    <div className="col-sm-3 mt-4">
                      <h3>Tempo reale</h3>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[1] && this.state.curNode.graphesToDisable[1]}
                        value="1"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[1]}
                      />
                      <label>Intensità di corrente [A]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[2] && this.state.curNode.graphesToDisable[2]}
                        value="2"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[2]}
                      />
                      <label>Tensione [V]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[3] && this.state.curNode.graphesToDisable[3]}
                        value="3"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[3]}
                      />
                      <label>Potenza attiva [kW]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[4] && this.state.curNode.graphesToDisable[4]}
                        value="4"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[4]}
                      />
                      <label>Fattore di potenza</label>
                      <br></br>
                      <br></br>
                    </div>
                    <div className="col-sm-3 mt-4">
                      <h3>Storico</h3>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[5] && this.state.curNode.graphesToDisable[5]}
                        value="5"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[5]}
                      />
                      <label>Intensità di corrente [A]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[6] && this.state.curNode.graphesToDisable[6]}
                        value="6"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[6]}
                      />
                      <label>Tensione [V]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[7] && this.state.curNode.graphesToDisable[7]}
                        value="7"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[7]}
                      />
                      <br></br>
                      <label>Potenza attiva [kW]</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[8] && this.state.curNode.graphesToDisable[8]}
                        value="8"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[8]}
                      />
                      <br></br>
                      <label>Fattore di potenza</label>
                      <br></br>
                      <input
                        type="checkbox"
                        checked={this.state.curNode.graphesToCreate[9] && this.state.curNode.graphesToDisable[9]}
                        value="9"
                        onChange={(e) => this.updateGraphes(e)}
                        disabled={!this.state.curNode.graphesToDisable[9]}
                      />
                      <label>Consumo [Kwh]</label>
                      <br></br>
                      <br></br>
                    </div>
                    <div className="col-sm-3 mt-4">
                      <h3>Sintesi mensili</h3>
                      <input type="checkbox" checked disabled />
                      <label>Suddivisione in fasce orarie</label>
                      <br></br>
                      <input type="checkbox" checked disabled />
                      <label>Raffronto Energia attiva, passiva, fattore di potenza</label>
                      <br></br>
                      <input type="checkbox" checked disabled />
                      <label>Raffronto Energia attiva vs temperatura esterna</label>
                      <br></br>
                      <input type="checkbox" checked disabled />
                      <label>Curva di richiesta elettrica</label>
                      <br></br>
                      <input type="checkbox" checked disabled />
                      <label>Raffronto consumi annualità diverse</label>
                      <br></br>
                    </div>
                    <div className="col-sm-3 mt-4">
                      <h3>Profili giornalieri</h3>
                      <input type="checkbox" checked disabled />
                      <label>Estivi</label>
                      <br></br>
                      <input type="checkbox" checked disabled />
                      <label>Invernali</label>
                    </div>
                  </div>
                )}
                {false && (
                  <div className="row">
                    <b className="col-sm-3 mt-4">Nome padre:</b>
                    <div className="form-control col-sm-9">...</div>
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <button className="btn btn-block btn-inverse" onClick={() => this.closeModal()}>
                  Chiudi
                </button>
              </div>
              {false && (
                <div className="col-sm-6">
                  <button
                    className="btn btn-block btn-success"
                    onClick={() => this.saveNode(this.state.curNode, this.state.graphesToCreate)}
                  >
                    Salva
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

export const Tree: FC<AppRootProps> = ({ query, path, meta }) => {
  const [error, setError] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [tree, setTree] = useState<any[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [dataSourceId, setDataSourceId] = useState<any[]>([]);

  const addPropsToTree = (tree) => {
    console.log(tree);
    for (const x of tree) {
      if (x.meta === undefined) {
        x.meta = {};
      }
      if (x.meta.icon === undefined) {
        x.meta.icon = 'misura';
      }
      if (x.meta.type === undefined) {
        x.meta.type = 'misura';
      }
      if (x.meta.nPhase === undefined) {
        x.meta.nPhase = 1;
      }

      console.log(x);
    }
    return tree;
  };

  useEffect(() => {
    if (typeof meta.jsonData['dataSourceId'] === 'undefined') {
      setError(true);
      setErrorMsg('Selezionare una datasource nel pannello di amministrazione');
      return;
    }
    console.log('Tree.tsx: dataSourceId', meta);

    //Legge i feed da remoto
    feedStore.setKey(meta.jsonData['dataSourceId']);
    feedStore.addListener(0, function (newFeeds: any[]) {
      setError(false);
      console.log('Tree.tsx: newFeeds', newFeeds);
      //peppelauro commentato per presentazione Fabio:
      /*
      var set: any = new Set(newFeeds.map((item) => item.nodeid));
      // console.log('Array: ', set, Array.from(set), [...set]);
      setFeeds(Array.from(set));
      */
    });

    //Legge il tree da remoto
    console.log('Legge il tree da remoto');
    feedStore.setKeyFromTree(meta.jsonData['dataSourceId']);
    feedStore.addTreeFeedListener((tree: any[]) => {
      setError(false);
      setDataSourceId(meta.jsonData['dataSourceId']);
      localStorage.setItem('dataSourceId', meta.jsonData['dataSourceId']);
      console.log('TreeDaRemoto:::', tree);

      //Arricchisce il tree se necessario
      tree = addPropsToTree(tree);

      setTree(tree);

      //peppelauro: modifiche per presentazione Fabio
      //Estra i nomi dei nodi dal tree
      var set: any = new Set(tree.map((item) => item.title));
      for (const item of tree) {
        for (const children of item.children) {
          set.add(children.title);
        }
      }

      // console.log('Array: ', set, Array.from(set), [...set]);
      setFeeds(Array.from(set));
    });

    feedStore.addErrorListener((err: any) => {
      setError(true);
      setErrorMsg("C'è stato un errore nel ricevere la lista dei Valori");
    });
  }, [meta]);

  useEffect(() => {
    if (feeds.length === 0) {
      console.log('qui');
      feedStore.fetchFeeds();
    }
  }, [feeds]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container">
      <h1 className="text-center">Tree</h1>
      {error && <p className="error">{errorMsg}</p>}
      {!error && feeds.length === 0 && (
        <h1 className="text-center">
          <i className="fa fa-circle-o-notch fa-spin"></i>
          <br />
          Caricamento...
        </h1>
      )}
      {!error && feeds.length > 0 && tree.length > 0 && <SETree inputs={feeds} tree={tree} />}
      <iframe
        id="energyflow"
        src="/d/JZzG46Enz/analisiflusso?orgId=1&kiosk"
        width="100%"
        height="800"
        frameBorder="0"
      ></iframe>
    </div>
  );
};
