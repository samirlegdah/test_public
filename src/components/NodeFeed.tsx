import React, { useState } from 'react';
import Modal from 'react-modal';
import feedStore from 'stores/feedStore';
import LineChartFeeds from './LineChart';
import { pretty_number, showTime } from './../lib/utils';
import { Feeds } from 'pages/Feeds';
import '../css/inputs.css';

export const NodeFeed = (props: any) => {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState(props.values);
  const [modal, setModal] = useState(false);
  const [meta, setMeta] = useState({
    oggettoTipo: props.meta.oggettoTipo || 'nodo',
    reparto: props.meta.reparto || '',
    area: props.meta.area || '',
    destinazione: props.meta.destinazione || '',
    potenzaMax: props.meta.potenzaMax || 0,
    durataCiclo: props.meta.durataCiclo || 0,
    numeroCicli: props.meta.numeroCicli || 0,
    cicliSpezzabili: props.meta.cicliSpezzabili || false,
    trifase: props.meta.trifase || false,
  });
  const [accordion, setAccordion] = useState<number>(-1);
  console.log(props);
  function closeModal() {
    setModal(false);
  }
  function changeUdm(e: any, row: any, index: number) {
    var old = vals.slice();
    old[index].unit = e.target.value;
    setVals(old);

    feedStore.updateFeed(row.id, 'unit', e.target.value).then(() => {
      feedStore.fetchFeeds();
    });
  }
  function seleziona_tutti(e) {
    let check = e.target.checked;
    vals.map((row: any, index: number) => {
      if (check && props.selectedNodes.indexOf(row.id) < 0) {
        props.selectNode(row.id);
      }
      if (!check && props.selectedNodes.indexOf(row.id) >= 0) {
        props.selectNode(row.id);
      }
    });
  }

  return (
    <>
      <div className="container border border-secondary rounded mt-3 p-sticky-table">
        <div
          className="row bg-success c-pointer  border-1 "
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div className="col-sm-12 text-center py-3 ">
            <h3 className="m-0 d-inline">
              {props.name} {open ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
            </h3>
            <button className="btn btn-primary float-right mr-3" onClick={() => setModal(true)}>
              <i className="fa fa-edit"></i>
            </button>
          </div>
        </div>
        <div className={`row bg-secondary text-white py-2 ${open ? '' : 'hidden'}`}>
          <div className="col-sm-1">
            {/* <button className="btn btn-info" onClick={() => seleziona_tutti()}>
              Tutti
            </button> */}
            {props.selectedNodes && (
              <>
                {props.selectedNodes.length > 0 && <input type="checkbox" onChange={(e) => seleziona_tutti(e)} />}
                {props.selectedNodes.length === 0 && <> - </>}
              </>
            )}
          </div>
          <div className="col-sm-1">ID</div>
          <div className="col-sm-3">Grandezza</div>
          <div className="col-sm-1">Ultimo aggiornamento</div>
          <div className="col-sm-2">Valore</div>
          <div className="col-sm-2">U.M.</div>
          <div className="col-sm-2"></div>
        </div>
      </div>
      <div className={`container collapsable ${open ? '' : 'collapsed'}`}>
        {vals.map((row: any, index: number) => (
          <div className="row striped" key={index}>
            <div className="col-sm-1">
              <input
                type="checkbox"
                onChange={() => props?.selectNode(row.id)}
                checked={props.selectedNodes ? props.selectedNodes.indexOf(row.id) >= 0 : false}
              />
            </div>
            <div className="col-sm-1">{row.id}</div>
            <div className="col-sm-3 text-left">
              {/* <input
                name="name"
                className="form-control mb-3 mt-0"
                placeholder="Feed name"
                value={row.name}
                onChange={(e) => {
                  var old = vals.slice();
                  old[index].name = e.target.value;
                  setVals(old);
                }}
                onBlur={(e) => {
                  feedStore.updateFeed(row.id, 'name', e.target.value).then(() => {
                    feedStore.fetchFeeds();
                  });
                }}
              /> */}
              {row.name}
            </div>
            <div className="col-sm-1">{row.time != null ? showTime(row.time) : '-'}</div>
            <div className="col-sm-1">{pretty_number(row.value)}</div>
            <div className="col-sm-3 text-left">
              <select
                onChange={(e) => {
                  changeUdm(e, row, index);
                }}
              >
                <option selected={row.unit === ''} value="">
                  (numero puro)
                </option>
                <option selected={row.unit === 'kWh'} value="kWh">
                  kWh - kilo Watt ora
                </option>
                <option selected={row.unit === 'kW'} value="kW">
                  kW - kilo Watt
                </option>
                <option selected={row.unit === 'V'} value="V">
                  V - Volt
                </option>
                <option selected={row.unit === 'A'} value="A">
                  A - Ampere
                </option>
              </select>
            </div>
            <div className="col-sm-2 btn-group">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setAccordion(accordion === -1 ? index : -1);
                }}
              >
                <i className="fa fa-area-chart"></i>
              </button>
              <button
                onClick={() => {
                  props.onUpload(row);
                }}
                className="btn btn-sm btn-primary"
              >
                <i className="fa fa-upload"></i>
              </button>
              <button
                onClick={() => {
                  props.onDelete(row);
                }}
                className="btn btn-sm btn-danger"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
            {accordion === index && (
              <div className="col-sm-12">
                <LineChartFeeds
                  id={row.id}
                  udm={row.unit}
                  name={row.name}
                  onCloseModal={() => {
                    setAccordion(-1);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal isOpen={modal} ariaHideApp={false} onRequestClose={closeModal} className="dialog-large">
        <div className="container w-100">
          <div className="row">
            <h3 className="col-sm-12 text-center">
              Modifica nodo - {meta.oggettoTipo === 'nodo' ? ' Reale' : ' Verifica'}
            </h3>
          </div>
          <div className="row pb-3">
            {/* <div className="col-sm-12">
              <label className="mt-3 mb-0">Tipo oggetto</label>
              <p>{meta.oggettoTipo}</p>
              <select
                value={meta.oggettoTipo}
                className="form-control mb-3 mt-0"
                onChange={(e) => {
                  setMeta({ ...meta, oggettoTipo: e.target.value });
                }}
                placeholder="Scegli un tipo di nodo"
              >
                <option value="Reale">Reale</option>
                <option value="Verifica">Verifica</option>
              </select>
            </div> */}
            <div className="col-sm-12">
              <label className="mt-3 mb-0">Reparto</label>
              <input
                className="form-control mb-3 mt-0"
                value={meta.reparto}
                onChange={(e) => {
                  setMeta({ ...meta, reparto: e.target.value });
                }}
                placeholder="Reparto"
              />
            </div>
            <div className="col-sm-12">
              <label className="mt-3 mb-0">Area di destinazione</label>
              <input
                className="form-control mb-3 mt-0"
                value={meta.area}
                onChange={(e) => {
                  setMeta({ ...meta, area: e.target.value });
                }}
                placeholder="Area funzionale"
              />
            </div>
            <div className="col-sm-12">
              <label className="mt-3 mb-0">Destinazione d&#39;uso</label>
              <input
                className="form-control mb-3 mt-0"
                value={meta.destinazione}
                onChange={(e) => {
                  setMeta({ ...meta, destinazione: e.target.value });
                }}
                placeholder="Destinazione"
              />
            </div>
            {meta.oggettoTipo === 'nodo' && (
              <div className="col-sm-12">
                <label className="mt-3 mb-0">Trifase</label>
                <select
                  className="form-control mb-3 mt-0"
                  onChange={(e) => {
                    console.log(e.target.value);
                    setMeta({ ...meta, trifase: e.target.value });
                  }}
                >
                  <option selected={meta.trifase === 1} value="1">
                    Si
                  </option>
                  <option selected={meta.trifase === 2} value="2">
                    No
                  </option>
                  <option selected={meta.trifase === 3} value="3">
                    No
                  </option>
                </select>
              </div>
            )}
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
                onClick={() => {
                  feedStore.updateNode(props.name, meta).then(() => {
                    closeModal();
                    feedStore.fetchFeeds();
                  });
                }}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {props.children &&
        props.children.length > 0 &&
        props.children.map((child: any, index: number) => (
          <NodeFeed
            key={index}
            name={child.title}
            values={child.meta.feeds}
            meta={child.meta}
            // children={child.children} // eslint-disable-line
            onDelete={(e: any) => {
              props.onDelete(e);
            }}
            onUpload={(e: any) => {
              props.onUpload(e);
            }}
            // selectedNodes={Feeds.prototype.selectedNodes}
            // selectNode={(e: any) => {
            //   Feeds.prototype.selectNode(e);
            // }}
            {...console.log('Nodo Figlio')}
          ></NodeFeed>
        ))}
    </>
  );
};
export default NodeFeed;
