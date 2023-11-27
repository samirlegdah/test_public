import { AppRootProps } from '@grafana/data';
import React, { FC, useState, useEffect } from 'react';
import Node from '../components/Node';
import Modal from 'react-modal';
import ProcessList from '../components/ProcessList';
import feedStore from '../stores/feedStore';

import { API_URL } from '../utils/consts';

import '../css/inputs.css';

export const Inputs: FC<AppRootProps> = ({ query, path, meta }) => {
  const [inputs, setInputs] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [initialProcessList, setInitialProcessList] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [initProcModal, setInitProcModal] = useState(false);
  const [item, setItem] = useState<any>({});
  const [error, setError] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  // to be deleted
  const [remaining, setRemaining] = useState(0);
  // check if deleting
  const [isDeleting, setDeleting] = useState(false);

  async function fetchData(url: string) {
    setErrorMsg('');
    setError(false);
    const resp = await fetch('/api/datasources/proxy/' + feedStore.dataSourceId + '/manage-devices', {
      headers: {
        //'x-rre-apikey': feedStore.EMONCMS_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return await resp.json();
  }
  async function apiSetProcessList(id: string, proc: any[]) {
    setError(false);
    setErrorMsg('');
    window
      .fetch('/api/datasources/proxy/' + feedStore.dataSourceId + '/processlist-setprocess', {
        headers: {
          //'x-rre-apikey': feedStore.EMONCMS_API_KEY,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          id,
          processlistToSet: proc,
        }),
      })
      .then(() => setInitialProcessList(''))
      .catch((res: any) => {
        setError(true);
        setErrorMsg("C'è stato un problema nell'inizializzazione dei processi");
      });
  }

  const onChange = (e: any) => {
    var edit: any = {};
    edit[e.target.name] = e.target.value;
    setItem({ ...item, ...edit });
  };

  const deleteInput = (id: string) => {
    fetchData(`/input/delete?inputid=${id}`).then((r) => {
      // remove from list
      setData(data.filter((x: any) => x.id !== id));
      handleInputs();
      closeModal();
    });
  };

  const makeChanges = () => {
    if (item.processList !== initialProcessList) {
      apiSetProcessList(item.id, item.processList);
    }
    const url = `/input/set?inputid=${item.id}&fields={"description":"${item.description}"}`;
    fetchData(url)
      .then((r) => {
        var copy: any[] = data;
        var index = copy.findIndex((x: any) => x.id === item.id);
        if (index >= 0) {
          // update element in list, update data
          copy[index].processList = item.processList;
          copy[index].description = item.description;
          setData(copy);
          handleInputs(); // manually call update of whole table(s)
        }
        closeModal();
      })
      .catch((err: any) => {
        setError(true);
        setErrorMsg("C'è stato un problema nel salvare le informazioni relative a questa misura");
      });
  };

  useEffect(() => {
    if (typeof meta.jsonData['dataSourceId'] === 'undefined') {
      //alert('Inserire il datasource nel pannello admin');
      setError(true);
      setErrorMsg('Selezionare una datasource nel pannello di amministrazione');
      return;
    }
    feedStore.setKey(meta.jsonData['dataSourceId']);
    feedStore.addListener(0, function (newFeeds: any[]) {
      setError(false);
      console.log('Inputs.tsx:', newFeeds);
      setData(newFeeds);
    });
    feedStore.addErrorListener(function (err: any) {
      setError(true);
      setErrorMsg(
        "C'è stato un errore nel ricevere le misure, prova a selezionare una datasource diversa dal pannello di amministrazione"
      );
    });
  }, [meta]);

  useEffect(() => {
    if (data.length === 0) {
      feedStore.getInputs();
    } else {
      setSelectedNodes([]);
      setRemaining(0);
      handleInputs();
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectNode(id: string) {
    const index = selectedNodes.indexOf(id);
    const nodes = selectedNodes;
    if (index === -1) {
      // if not found, add
      nodes.push(id);
    } else {
      // if found, remove
      nodes.splice(index, 1);
    }
    setSelectedNodes(nodes);
    setRemaining(selectedNodes.length);
    handleInputs();
  }

  function handleInputs() {
    const nodes = data.reduce((a, c) => {
      a[c.nodeid] ? a[c.nodeid].push(c) : (a[c.nodeid] = [c]);
      return a;
    }, []);

    const arr: any[] = [];
    for (const [key, nodeKeys] of Object.entries<any>(nodes)) {
      const values = [];
      for (const [key1, nodeKey] of Object.entries(nodeKeys)) {
        values.push([key1, nodeKey]);
      }
      arr.push(
        <React.Fragment key={key}>
          <Node
            name={key}
            values={values}
            onEdit={(e: any) => {
              setItem(e);
              setInitialProcessList(e.processList);
              setModalOpen(true);
            }}
            selectedNodes={selectedNodes}
            selectNode={(e: any) => {
              selectNode(e);
            }}
          ></Node>
        </React.Fragment>
      );
    }
    setInputs(arr);
  }

  function closeModal() {
    setModalOpen(false);
    setInitProcModal(false);
  }
  function updateList(data: any[]) {
    setItem({ ...item, ...{ processList: data } });
  }

  function InitProcesses() {
    fetch('/api/datasources/proxy/' + meta.jsonData['dataSourceId'] + '/precesslist-initial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}', //JSON.stringify({ apiKey: feedStore.EMONCMS_API_KEY }),
    })
      .then((resp) => resp.json())
      .then((data) => location.reload())
      .catch((err) => alert(err));
  }

  async function deleteSelected() {
    setDeleting(true);
    for (var k = 0; k < selectedNodes.length; ++k) {
      await fetchData(`/input/delete?inputid=${selectedNodes[k]}`).then((r) => {});
    }
    setSelectedNodes([]); // empty selected list
    feedStore.getInputs(); // refetch data from server
    setDeleting(false);
  }

  return (
    <>
      <div className="p-sticky-title text-center">
        <h1 className="">Elenco utenze: misure rilevate</h1>
      </div>
      {error && <p className="error">{errorMsg}</p>}
      {!error && inputs.length === 0 && (
        <h1 className="text-center">
          <i className="fas fa-circle-o-notch fa-spin"></i>
          <br />
          Caricamento...
        </h1>
      )}
      {!error && inputs}
      {!error && (
        <div className="my-3 text-center btn-group">
          <button
            className="btn btn-success mx-3"
            onClick={() => {
              setInitProcModal(true);
            }}
          >
            Inizializza processi
          </button>
          <button
            className="btn btn-danger mx-3"
            onClick={() => {
              deleteSelected();
            }}
            disabled={remaining === 0 || isDeleting}
          >
            Cancella selezionati ({remaining}){isDeleting && <i className="ml-3 fas fa-circle-notch fa-spin"></i>}
          </button>
        </div>
      )}
      <Modal isOpen={initProcModal} ariaHideApp={false} onRequestClose={closeModal} className="dialog">
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">Inizializzazione processi</h3>
            <p className="col-sm-12 text-center">
              Questa funzione permette di associare a tutti le misure un Valore, con le medesime caratteristiche
              dell&#39;input. Nessuna trasformazione verrà applicata quindi all&#39;input
            </p>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <button className="btn btn-block btn-inverse" onClick={closeModal}>
                Annulla
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="btn btn-block btn-primary"
                onClick={() => {
                  InitProcesses();
                  closeModal();
                }}
              >
                Inizializza i processi!
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal isOpen={modalOpen} ariaHideApp={false} onRequestClose={closeModal}>
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">Edit input</h3>
          </div>
          <div className="row pb-3">
            <div className="col-sm-12">
              <p>
                <b>ID:</b> {item.id}
                <br />
                <b>Nome grandezza:</b> {item.name}
                <br />
                <b>Nodo/utenza:</b> {item.nodeid} <br />
                <div className="row">
                  <b className="col-sm-2 mt-2"> Unità di misura:</b>
                  <input
                    name="description"
                    value={item.description}
                    className="form-control col-sm-3"
                    onChange={onChange}
                    placeholder="Unità di misura"
                  />
                </div>
              </p>
            </div>

            <div className="col-sm-12">
              <ProcessList list={item.processList} onUpdateList={updateList}></ProcessList>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-4 px-1">
              <button className="btn btn-block btn-inverse" onClick={closeModal}>
                Annulla
              </button>
            </div>
            <div className="col-sm-4 px-1">
              <button className="btn btn-block btn-danger" onClick={() => deleteInput(item.id)}>
                <i className="fa fa-trash mr-2"></i>
                Elimina misura
              </button>
            </div>
            <div className="col-sm-4 px-1">
              <button className="btn btn-block btn-success" onClick={makeChanges}>
                <i className="fa fa-save mr-2"></i>
                Salva
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
