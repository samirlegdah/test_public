import React, { FC, useEffect, useState } from 'react';
import feedStore from 'stores/feedStore';
import NodeModal from 'components/NodeModal';
import CSVReader from 'react-csv-reader';
import { UdmModal } from 'components/UdmModal';
import Modal from 'react-modal';
import NodeFeed from 'components/NodeFeed';
import { API_URL } from 'utils/consts';
import '../css/inputs.css';
import { AppRootProps } from '@grafana/data';

export const Feeds: FC<AppRootProps> = ({ query, path, meta }) => {
  const [inputs, setInputs] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [item, setItem] = useState<any>({});
  const [error, setError] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [called, setCalled] = useState<boolean>(false);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [isDeleting, setDeleting] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const [feed, setFeed] = useState<{ id: string; name: string; tag: string; engine: string }>({
    id: '',
    name: '',
    tag: '',
    engine: '',
  });
  const [feedModalOpen, setFeedModalOpen] = useState<boolean>(false);

  const [udmModal, setUdmModal] = useState<boolean>(false);
  const [nodeModal, setNodeModal] = useState<boolean>(false);

  const [emon, setEmon] = useState<boolean>(false);
  const [csvModal, setCsvModal] = useState<boolean>(false);
  const [csv, setCSV] = useState<any[]>([]);

  const onChangeFeed = (e: any) => {
    var edit: any = {};
    edit[e.target.name] = e.target.value;
    setFeed({ ...feed, ...edit });
  };

  useEffect(() => {
    if (typeof meta.jsonData['dataSourceId'] === 'undefined') {
      setError(true);
      setErrorMsg('Selezionare una datasource nel pannello di amministrazione');
      return;
    }
    feedStore.setKeyFromTree(meta.jsonData['dataSourceId']);
    feedStore.addTreeFeedListener((newFeeds: any[]) => {
      setError(false);
      setData(newFeeds);
    });
    feedStore.addErrorListener((err: any) => {
      setError(true);
      setErrorMsg("C'è stato un errore nel ricevere la lista dei Valori");
    });
  }, [meta]);

  useEffect(() => {
    if (data.length === 0) {
      if (!called) {
        setCalled(true);
        feedStore.fetchFeedsFromTree();
      } else {
        console.log('STOP recalling');
        setError(true);
        setErrorMsg('non è stato trovato nessun Valore');
      }
    } else {
      setSelectedNodes([]);
      setRemaining(0);
      handleInputs();
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInputs() {
    console.log('handleInputs', data);
    var inps = data.map((node, index) => (
      <NodeFeed
        key={index}
        name={node.title}
        values={node.meta.feeds}
        meta={node.meta}
        // commented because we actually don't have children nodes. Once we implement children nodes, we need to handle this case.
        // With the following line, you can display children nodes, but the chackbox for deleting them doesn't work.
        //children={node.children} // eslint-disable-line
        onDelete={(e: any) => {
          setItem(e);
          setModalOpen(true);
        }}
        onUpload={(e: any) => {
          setFeed(e);
          setCsvModal(true);
        }}
        selectedNodes={selectedNodes}
        selectNode={(e: any) => {
          selectNode(e);
        }}
      ></NodeFeed>
    ));
    setInputs(inps);
    setError(false);
  }

  function closeModal() {
    setModalOpen(false);
    setFeedModalOpen(false);
    setNodeModal(false);
    setCsvModal(false);
    setUdmModal(false);
  }
  function DeleteFeed(id: string) {
    let url = `/feed/delete.json?id=${id}`;
    fetch('/api/datasources/proxy/' + feedStore.dataSourceId + '/manage-devices', {
      headers: {
        //'x-rre-apikey': feedStore.EMONCMS_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url }),
    })
      .then(() => {
        location.href = location.href;
      })
      .catch(() => {
        location.href = location.href;
      });
  }
  function createFeed() {
    feed.engine = '2'; // 2=real feed, 7=virtual
    const url = `/feed/create.json?tag=${feed.tag}&name=${feed.name}&datatype=1&engine=${feed.engine}`;
    fetch('/api/datasources/proxy/' + feedStore.dataSourceId + '/manage-devices', {
      headers: {
        //'x-rre-apikey': feedStore.EMONCMS_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ url }),
    })
      .then(() => {
        setFeedModalOpen(false);
        setTimeout(() => {
          feedStore.fetchFeedsFromTree();
        }, 1500);
      })
      .catch((err: any) => {
        setError(true);
        setErrorMsg('Non è stato possibile creare il nuovo Valore');
      });
  }
  async function changeUdm(udm: string, items: any[]) {
    for (var k = 0; k < items.length; ++k) {
      await feedStore.updateFeed(items[k].id, 'unit', udm);
    }
    feedStore.fetchFeedsFromTree();
    closeModal();
  }
  function addNode(node: any) {
    feedStore
      .addNode(node)
      .then((resp) => {
        setTimeout(() => {
          location.href = location.href;
        }, 1500);
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
  async function fetchData(url: string) {
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
  async function deleteSelected() {
    setDeleting(true);
    for (var k = 0; k < selectedNodes.length; ++k) {
      try {
        await fetchData(`/feed/delete.json?id=${selectedNodes[k]}`).then((r) => {});
      } catch (e: any) {
        setError(true);
        setErrorMsg('Non è stato possibile cancellare il Valore con ID: ' + selectedNodes[k]);
      }
    }
    setSelectedNodes([]); // empty selected list
    feedStore.getFeeds(); // refetch data from server
    setDeleting(false);
    location.reload();
  }
  return (
    <>
      <div className="text-center p-sticky-title">
        <h1>Elenco utenze: valori calcolati</h1>
      </div>
      {error && <p className="error">{errorMsg}</p>}
      {!error && inputs}
      {!error && inputs.length === 0 && (
        <h1 className="text-center">
          <i className="fa fa-circle-o-notch fa-spin"></i>
          <br />
          Caricamento...
        </h1>
      )}
      {!error && (
        <div className="mt-2 text-center">
          <button className="btn btn-info mx-3" onClick={() => setNodeModal(true)}>
            Aggiungi nodo
          </button>
          <button
            className="btn btn-info mx-3"
            onClick={() => {
              setFeed({ id: '', name: '', tag: '', engine: '2' });
              setFeedModalOpen(true);
            }}
          >
            Aggiungi Valore
          </button>
          <button className="btn btn-primary mx-3" onClick={() => setUdmModal(true)}>
            Modifica U.M. massivamente
          </button>
          <button
            className="btn btn-danger mx-3"
            onClick={() => {
              deleteSelected();
            }}
            disabled={remaining === 0 || isDeleting}
          >
            Cancella selezionati ({remaining}){isDeleting && <i className="ml-3 fa fa-circle-notch fa-spin"></i>}
          </button>
        </div>
      )}
      <NodeModal
        isOpen={nodeModal}
        onClose={() => {
          setNodeModal(false);
        }}
        onAddNode={(node: any) => {
          addNode(node);
        }}
      ></NodeModal>
      <UdmModal
        isOpen={udmModal}
        onClose={() => {
          setUdmModal(false);
        }}
        feeds={data}
        onEditUdm={(udm: string, filtered: any[]) => {
          changeUdm(udm, filtered);
        }}
      ></UdmModal>
      <Modal isOpen={modalOpen} ariaHideApp={false} onRequestClose={closeModal} className="dialog">
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">Cancella DataLog</h3>
          </div>
          <div className="row pb-3">
            <div className="col-sm-12">
              <p>
                <b>ID:</b> {item.id}
              </p>
              <p>
                <b>Name:</b> {item.name}
              </p>
              <p>
                <b>Tag:</b> {item.tag}
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <button className="btn btn-block btn-inverse" onClick={closeModal}>
                Annulla
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="btn btn-block btn-danger"
                onClick={() => {
                  DeleteFeed(item.id);
                  closeModal();
                }}
              >
                Conferma eliminazione
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={csvModal} ariaHideApp={false} onRequestClose={closeModal} className="dialog-long">
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">Inserisci dati tramite file</h3>
            <p className="col-sm-12 text-center">
              DataLog: {feed.id} - {feed.name}
            </p>
          </div>
          <div className="row pb-3">
            <p className="col-sm-12"></p>
            {/* <label className="col-sm-12">
              
            </label> */}
            <div className="col-sm-6">
              <strong>Scegli un formato di file :</strong>
              <br></br>
              <label>
                <input
                  type="radio"
                  name="tipo"
                  value={1} //true
                  onChange={(e) => setEmon(!!e.target.value)}
                  checked={emon === true}
                />
                Tempo-valore
              </label>
              <label className="ml-3">
                <input
                  type="radio"
                  name="tipo"
                  value={0} //false
                  onChange={(e) => setEmon(!!e.target.value)}
                  checked={emon === false}
                />
                ENEL
              </label>
              {/* <select
                className="w-100"
                value={emon}
                // className="form-control"
                onChange={(e) => setEmon(e.target.value)}
                placeholder="Scegli un formato di file"
              >
                <option value="true">Tempo-valore</option>
                <option value="false">ENEL</option>
              </select> */}
            </div>
            <div className="col-sm-6 pt-1">
              <a
                href={
                  emon === true
                    ? 'https://moniotoring-docs-for-monitoring.s3.eu-central-1.amazonaws.com/template-tempo-valore.csv'
                    : 'https://moniotoring-docs-for-monitoring.s3.eu-central-1.amazonaws.com/template-enel.csv'
                }
                className="btn btn-block btn-primary pt-1"
                download={emon ? 'tempo-valore.csv' : 'enel.csv'}
              >
                Scarica file di esempio
              </a>
            </div>
            <div className="col-sm-12 pb-2 pt-4">
              <CSVReader
                accept=".csv"
                onFileLoaded={(data) => {
                  setCSV(data.slice(1));
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <button
                className="btn btn-block btn-inverse"
                onClick={() => {
                  closeModal();
                  setUpdating(false);
                }}
              >
                Annulla
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="btn btn-block btn-success"
                disabled={csv.length === 0 || isUpdating}
                onClick={() => {
                  setUpdating(true);
                  feedStore.uploadCSV(csv, feed.id, emon).then(() => {
                    setCSV([]);
                    closeModal();
                    setUpdating(false);
                  });
                }}
              >
                Conferma
                {isUpdating && (
                  <div className="ml-3 d-inline">
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={feedModalOpen} ariaHideApp={false} onRequestClose={closeModal} className="dialog">
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">Crea DataLog</h3>
          </div>
          <div className="row pb-3">
            <div className="col-sm-12">
              <input
                name="name"
                autoComplete="off"
                value={feed.name}
                className="form-control"
                onChange={onChangeFeed}
                placeholder="Name"
              />
            </div>
            <div className="col-sm-12">
              <select name="tag" className="form-control" onChange={onChangeFeed} placeholder="Tag" value={feed.tag}>
                <option selected disabled value="">
                  Scegli un nodo
                </option>
                {data.map((node, index) => (
                  <option key={index} value={node.title}>
                    {node.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <button className="btn btn-block btn-inverse" onClick={closeModal}>
                Annulla
              </button>
            </div>
            <div className="col-sm-6">
              <button
                className="btn btn-block btn-success"
                onClick={createFeed}
                disabled={feed.tag === '' || feed.name === ''}
              >
                Crea valore
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
