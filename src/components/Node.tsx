import React, { useState } from 'react';
import feedStore from '../stores/feedStore';
import { pretty_number, showTime } from './../lib/utils';
import '../css/inputs.css';

export const Node = (props: any) => {
  const [open, setOpen] = useState(false);

  function getProcess(proc: string) {
    switch (proc) {
      case '1':
        return 'Salva in ';
      case '2':
        return 'Moltiplica';
      case '3':
        return 'Somma';
      default:
        return '??';
    }
  }
  function getFeed(id: string) {
    return feedStore.getFeedById(id);
  }
  function showProcess(pList: string) {
    if (pList === '') {
      return '';
    }
    const list = pList.split(',').map((x) => x.split(':'));
    return (
      <>
        {list.map((x: any) => (
          <p key={x}>{getProcess(x[0]) + '(' + (x[0] === '1' ? getFeed(x[1]) : x[1]) + ')'}</p>
        ))}
      </>
    );
    //  list.map((x: any) => getProcess(x[0]) + '(' + (x[0] === '1' ? getFeed(x[1]) : x[1]) + ')').join(' ');
  }
  function getFeedId(pList: string) {
    if (pList === '') {
      return '';
    }
    const list = pList.split(',').map((x) => x.split(':'));
    return list
      .filter((x: any[]) => x[0] === '1')
      .map((x: any[]) => x[1])
      .join(', ');
  }
  function seleziona_tutti(e) {
    let check = e.target.checked;
    props.values.map((row: any, index: number) => {
      if (check && props.selectedNodes.indexOf(row[1].id) < 0) {
        props.selectNode(row[1].id);
      }
      if (!check && props.selectedNodes.indexOf(row[1].id) >= 0) {
        props.selectNode(row[1].id);
      }
    });
  }

  return (
    <>
      <div className="container border border-secondary  rounded mt-3 p-sticky-table">
        <div
          className="row bg-success py-3 c-pointer border-2"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div className="col-sm-12 text-center">
            <h3 className="m-0">
              {props.name} {open ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
            </h3>
          </div>
        </div>
        <div className={`row bg-secondary text-white py-2 text-center ${open ? '' : 'hidden'}`}>
          <div className="col-sm-4">
            <div className="row">
              <div className="col-sm-1">
                {props.selectedNodes.length > 0 && <input type="checkbox" onChange={(e) => seleziona_tutti(e)} />}
              </div>
              {/* {props.selectedNodes.length === 0 && <> - </>} */}
              <div className="col-sm-9">Grandezza</div>
            </div>
          </div>
          <div className="col-sm-2" title="Tempo trascorso dall'ultima misura">
            Ultimo aggiornamento
          </div>
          <div className="col-sm-1">Misura</div>
          <div className="col-sm-3">Processi</div>
          <div className="col-sm-1">ID valore</div>
          <div className="col-sm-1"></div>
        </div>
      </div>
      <div className={`container collapsable ${open ? '' : 'collapsed'}`}>
        {props.values.map((row: any, index: number) => (
          <div className="row striped" key={index}>
            <div className="col-sm-4 text-left">
              <div className="row">
                <input
                  className="col-sm-1"
                  type="checkbox"
                  onChange={() => props.selectNode(row[1].id)}
                  checked={props.selectedNodes.indexOf(row[1].id) >= 0}
                />
                &nbsp;
                <div className="col-sm-9 text-left">
                  <p className="truncate" title={row[1].name}>
                    {row[1].name}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-2 text-center">{row[1].time != null ? showTime(row[1].time) : '-'}</div>
            <div className="col-sm-1 text-center">
              {pretty_number(row[1].value)} {row[1].description}
            </div>
            <div className="col-sm-3">{showProcess(row[1].processList)}</div>
            <div className="col-sm-1">{getFeedId(row[1].processList)}</div>
            <div className="col-sm-1 text-rigth">
              {' '}
              <button
                onClick={() => {
                  props.onEdit(row[1]);
                }}
                className="btn btn-small btn-primary"
              >
                <i className="fa fa-edit"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Node;
