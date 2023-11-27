import React, { useState } from 'react';
import Modal from 'react-modal';

export const NodeModal = (props: any) => {
  const [name, setName] = useState('');
  //const [tipo, setTipo] = useState('nodo');
  const tipo = 'nodo';
  const [isAdding, setAdding] = useState<boolean>(false);
  const [meta, setMeta] = useState({
    reparto: '',
    area: '',
    destinazione: '',
    potenzaMax: 0,
    durataCiclo: 0,
    numeroCicli: 0,
    cicliSpezzabili: false,
  });
  function MakeNode(name: string, tipo: string) {
    return {
      selected: false,
      title: name,
      meta: {
        ...meta,
        oggettoTipo: tipo,
        feeds: [{}],
        id: name,
      },
      children: [],
    };
  }
  return (
    <Modal
      isOpen={props.isOpen}
      ariaHideApp={false}
      onRequestClose={() => {
        props.onClose();
      }}
      className="dialog-large"
    >
      <div className="container w-100">
        <div className="row">
          <h3 className="col-sm-12 text-center">Aggiungi nodo</h3>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <label>Nome nodo</label>
            <input
              type="text"
              value={name}
              className="form-control"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          {/*<div className="col-sm-12">
            <label>Tipo nodo</label>
            <select
              className="form-control"
              value={tipo}
              name="oggettoTipo"
              placeholder="tipo nodo"
              onChange={(e) => {
                setTipo(e.target.value);
              }}
            >
              <option value="Reale">Reale</option>
              <option value="Verifica">Verifica</option>
            </select>
          </div>*/}
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
          {/* <div className="col-sm-12">
            <label className="mt-3 mb-0">Potenza massima (kW)</label>
            <input
              className="form-control mb-3 mt-0"
              value={meta.potenzaMax}
              type="number"
              min="0"
              onChange={(e) => {
                setMeta({ ...meta, potenzaMax: +e.target.value });
              }}
              placeholder="Potenza massima (kW)"
            />
          </div>
          <div className="col-sm-12">
            <label className="mt-3 mb-0">Durata di un singolo ciclo (in ore)</label>
            <input
              className="form-control mb-3 mt-0"
              value={meta.durataCiclo}
              type="number"
              min="0"
              onChange={(e) => {
                setMeta({ ...meta, durataCiclo: +e.target.value });
              }}
              placeholder="Durata di un singolo ciclo (in ore)"
            />
          </div>
          <div className="col-sm-12">
            <label className="mt-3 mb-0">Numero di cicli di funzionamento settimanali</label>
            <input
              className="form-control mb-3 mt-0"
              value={meta.numeroCicli}
              type="number"
              step="1"
              onChange={(e) => {
                setMeta({ ...meta, numeroCicli: +e.target.value });
              }}
              placeholder="Numero di cicli di funzionamento settimanali"
            />
          </div>
          <div className="col-sm-12">
            <input
              id="cicliSpezzabili"
              type="checkbox"
              onChange={(e) => {
                setMeta({ ...meta, cicliSpezzabili: !meta.cicliSpezzabili });
              }}
              checked={meta.cicliSpezzabili}
            />
            <label htmlFor="cicliSpezzabili" className="ml-3">
              Cicli spezzabili
            </label>
          </div> */}
        </div>
        <div className="row pt-3">
          <div className="col-sm-6">
            <button className="btn btn-block btn-inverse" onClick={props.onClose}>
              Annulla
            </button>
          </div>
          <div className="col-sm-6">
            <button
              className="btn btn-block btn-success"
              onClick={() => {
                setAdding(true);
                props.onAddNode(MakeNode(name, tipo));
              }}
              disabled={isAdding}
            >
              Aggiungi nodo {isAdding && <i className="ml-3 fa fa-circle-o-notch fa-spin"></i>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NodeModal;
