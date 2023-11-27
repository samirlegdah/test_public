import React, { useState } from 'react';
import Modal from 'react-modal';

export const UdmModal = (props: any) => {
  // receives list of feeds
  const [filter, setFilter] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);
  const [unit, setUnit] = useState('');
  const [isUpdating, setUpdating] = useState(false);

  function getFeeds(feeds: any[]): any[] {
    var items: any[] = [];
    if (feeds.length === 0) {
      return items;
    }
    for (var k = 0; k < feeds.length; ++k) {
      items = items.concat(
        feeds[k].meta.feeds.map((x: any) => {
          return { id: x.id, name: x.name, unit: x.unit };
        })
      );
      if (feeds[k].children.length > 0) {
        for (var c = 0; c < feeds[k].children.length; ++c) {
          items = items.concat(getFeeds(feeds[k].children[c]));
        }
      }
    }
    return items;
  }

  let all: any[] = getFeeds(props.feeds);

  function changeFilter(val: string) {
    setFilter(val);
    if (val === '') {
      setFiltered([]);
    } else {
      setFiltered(all.filter((x: any) => x.name.toLowerCase().indexOf(val) >= 0));
    }
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
          <h3 className="col-sm-12 text-center">Modifica Unità di Misura massivamente</h3>
        </div>
        <div className="row pb-3">
          <div className="col-sm-12">
            <label>Cerca feed</label>
            <input
              className="form-control"
              value={filter}
              onChange={(e) => {
                changeFilter(e.target.value.toLowerCase());
              }}
              placeholder="Cerca feed"
            />
          </div>
        </div>
        <div className="row mt-3 scrollable">
          <div className="col-sm-12">
            <table>
              <thead>
                <tr>
                  <th>Valore</th>
                  <th>UDM</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={2}>Nessun DataLog trovato</td>
                  </tr>
                )}
                {filtered.map((feed: any, index) => (
                  <tr key={index}>
                    <td>{feed.name}</td>
                    <td>{feed.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6 text-left">
            <label className="d-block">
              <input
                type="radio"
                name="unit"
                value=""
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                checked={unit === ''}
              />
              (numero puro)
            </label>
            <label className="d-block">
              <input
                type="radio"
                name="unit"
                value="kWh"
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                checked={unit === 'kWh'}
              />
              kWh - kilo Watt ora
            </label>
            <label className="d-block">
              <input
                type="radio"
                name="unit"
                value="kW"
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                checked={unit === 'kW'}
              />
              kW - kilo Watt
            </label>
          </div>
          <div className="col-sm-12 col-md-6 text-left">
            <label className="d-block">
              <input
                type="radio"
                name="unit"
                value="V"
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                checked={unit === 'V'}
              />
              V - Volt
            </label>
            <label className="d-block">
              <input
                type="radio"
                name="unit"
                value="A"
                onChange={(e) => {
                  setUnit(e.target.value);
                }}
                checked={unit === 'A'}
              />
              A - Ampere
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <button className="btn btn-block btn-inverse" onClick={props.onClose}>
              Annulla
            </button>
          </div>
          <div className="col-sm-6">
            <button
              className="btn btn-block btn-success"
              onClick={() => {
                setUpdating(true);
                props.onEditUdm(unit, filtered);
              }}
              disabled={isUpdating || filtered.length === 0}
            >
              Modifica Valore ({filtered.length}){isUpdating && <i className="ml-3 fa fa-circle-o-notch fa-spin"></i>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Node;
