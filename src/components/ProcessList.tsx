import React, { useEffect, useState } from 'react';
import feedStore from '../stores/feedStore';
import CreateNodeModal from './CreateNodeModal';
import NodeModal from './NodeModal';
import Autocomplete from 'react-autocomplete';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import '../css/inputs.css';

/*
handles processes list to apply to given input.
possible operations:
1: Salva in
2: Moltiplica
3: Somma


// /feeds
{feed_id, nome feed, nome nodo}
*/

export const ProcessList = (props: any) => {
  console.log(props);
  const [list] = useState(props.list.split(',').map((x: any) => x.split(':')));
  console.log(list);
  const [proc, setProc] = useState<string[]>(['', '']);
  const [showNew, setShowNew] = useState(false);
  const [SearchedString, setSearch] = useState();
  const [feeds, setFeeds] = useState(getFeeds());
  const [nodeModal, setNodeModal] = useState<boolean>(false);
  const [isUpdating, setUpdating] = useState(false);
  // const [modalOpen, setModalOpen] = useState<boolean>(false);
  // console.log(props);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [feedsName] = useState<string[]>(getNodeNames(feeds));
  const [tag, setTag] = useState(feedsName[0]);
  function getNodeNames(feeds: any[]): string[] {
    let copy: any[] = [];
    for (let i = 0; i < feeds.length; i++) {
      if (!copy.includes(feeds[i].tag)) {
        copy.push(feeds[i].tag);
      }
    }
    //console.log(copy);
    return copy;
  }
  function getFeeds(): any[] {
    let f = feedStore.getFeeds();
    return f.map((feed) => {
      feed.String_for_Search = feed.tag + '.' + feed.name + ' - ' + feed.id;
      return feed;
    });
  }

  useEffect(() => {
    feedStore.addFeedListener((fds: any[]) => {
      setFeeds(fds);
    });
  });

  function changeProcess(e: any, index: number) {
    if (e.target.value === '0') {
      return;
    }
    var old = list;
    old[index][0] = e.target.value;
    // setList(old);
    updateProp(old);
  }
  function changeValue(e: any, index: number) {
    console.log('index : ' + index);
    if (e.id !== -1 && e.id !== '-1') {
      var old = list;
      console.log(old);
      old[index][1] = e.id;
      // if (old[index][0] === '')
      //   old[index][0] =
      updateProp(old);

      console.log(old);
    } else {
      setNodeModal(true);
    }
  }
  function deleteProcess(index: number) {
    console.log(index);
    var old = list;
    old.splice(index, 1);
    // setList(old);
    updateProp(old);
  }
  function addProcess() {
    if (proc[0] === '' || proc[1] === '') {
      return;
    }
    setShowNew(false);
    var old = list;
    old.push(proc);
    //setList(old);
    updateProp(old);
  }
  // update property for parent element
  function updateProp(newList: any[]) {
    props.onUpdateList(newList.map((x) => x.join(':')).join(','));
  }
  function MoveUp(index: number) {
    if (index <= 0) {
      return;
    } // if first item, do nothing
    var old = list;
    var item = old.splice(index, 1)[0]; // get first item
    old.splice(index - 1, 0, item); // put it one place up
    updateProp(old);
  }
  function MoveDown(index: number) {
    if (index >= list.length - 1) {
      return;
    } // if last item, do nothing
    var old = list;
    var item = old.splice(index, 1)[0];
    old.splice(index + 1, 0, item);
    updateProp(old);
  }
  const formatResult = (feed) => {
    console.log(feed);
    return feed;
    // return (<p dangerouslySetInnerHTML={{__html: '<strong>'+item+'</strong>'}}></p>); //To format result as html
  };
  const handleonSelect = (index, feed) => {
    // console.log(feed);
    changeValue(feed, index);
  };
  function renderSingleProcess() {}
  // const handleOnSearch = (string, results) => {
  //   results = feeds;
  //   // results = feeds.map((feed, index: number) => {
  //   //   if (feed.name.toLowerCase().includes(string.toLowerCase())) {
  //   //     return feed;
  //   //   }
  //   // });
  //   // console.log('risultati');
  //   // console.log(results);
  // };
  return (
    <>
      <h4 className="mt-3">Lista Processi</h4>
      {list.map((process: any, index: number) => (
        <div key={index} className="row p-relative">
          {index > 0 && (
            <div
              className="col-sm-12 move-up btn btn-sm btn-inverse"
              onClick={() => {
                MoveUp(index);
              }}
            >
              <i className="fa fa-arrow-up"></i>
            </div>
          )}
          <div className="col-sm-4">
            <select
              value={process[0]}
              name="process"
              onChange={(e) => {
                changeProcess(e, index);
              }}
              onChangeCapture={console.log}
              className="form-control form-select w-100"
              placeholder="Seleziona processo"
            >
              <option value="1">Salva in</option>
              <option value="2">Moltiplica</option>
              <option value="3">Somma</option>
            </select>
          </div>

          {(process[0] === '1' || process[0] === '') && (
            <>
              <div className="border-bottom border-light autocomplete col-sm-5 ">
                <ReactSearchAutocomplete
                  className="form-control form-select w-100 border-bottom border-light z-100 w-90"
                  items={feeds}
                  // onHover={handleOnHover}
                  onSelect={(e) => {
                    handleonSelect(index, e);
                  }}
                  // onFocus={handleOnFocus}
                  inputSearchString={feeds.find((x) => x.id === process[1])?.String_for_Search}
                  //onFocus={}
                  showIcon={false}
                  styling={{
                    backgroundColor: '#111111',
                    color: 'white',
                    zIndex: '99',
                    borderRadius: '0px',
                    minHeight: '32px',
                    height: '32px',
                    border: '0px',
                    borderWidth: '0px 0px 1px  0px',
                    borderBottom: '1px solid white',
                    borderColor: 'white',
                    hoverBackgroundColor: '#262628',
                  }}
                  fuseOptions={{ keys: ['String_for_Search'] }}
                  resultStringKeyName="String_for_Search"
                  autoFocus
                  formatResult={formatResult}
                />
              </div>
              <div className="col-sm-2">
                <button
                  title="Crea un nuovo valore nel quale salvare i dati"
                  className="btn btn-info"
                  onClick={() => {
                    setNodeModal(true);
                  }}
                >
                  Crea Valore
                </button>
              </div>

              {/* <select
                  value={process[1]}
                  onChange={(e) => {
                    changeValue(e, index);
                  }}
                  className="form-control form-select w-100"
                >
                  <option disabled selected={process[0] === ''}>
                    Scegli una opzione
                  </option>
                  <option key={-1} value={-1} style={{ color: '#00b500' }}>
                    Crea nuovo feed
                  </option>
                  {feeds.map((feed, index: number) => (
                    <option key={index} value={feed.id} selected={index === 0 && process[0] === '1'}>
                      {feed.tag}.{feed.name} - {feed.id}
                    </option>
                  ))}
                </select> */}
            </>
          )}
          {process[0] !== '1' && process[0] !== '' && (
            <div className="col-sm-7">
              <input
                value={process[1]}
                name="value"
                type="number"
                className="form-control"
                placeholder="Use '.' as decimal separator"
                onChangeCapture={console.log}
                onChange={(e) => {
                  changeValue(e, index);
                }}
              />
            </div>
          )}

          <div className="col-sm-1 text-right">
            <button
              title="Elimina questo processo"
              className="btn btn-danger ml-2"
              onClick={() => {
                deleteProcess(index);
              }}
            >
              <i className="fa fa-trash "></i>
            </button>
          </div>
          {index < list.length - 1 && (
            <div
              className="col-sm-12 move-down btn btn-sm btn-inverse"
              onClick={() => {
                MoveDown(index);
              }}
            >
              <i className="fa fa-arrow-down"></i>
            </div>
          )}
        </div>
      ))}
      {showNew && (
        <div className="row">
          <div className="col-sm-4">
            <select
              onChange={(e) => setProc([e.target.value, proc[1]])}
              className="form-control form-select w-100"
              placeholder="Select process"
            >
              <option value="" disabled selected>
                (Select process)
              </option>
              <option value="1">Salva in</option>
              <option value="2">Moltiplica</option>
              <option value="3">Somma</option>
            </select>
          </div>
          {proc[0] === '1' ? (
            <>
              <div className="border-bottom border-light autocomplete col-sm-5">
                <ReactSearchAutocomplete
                  className="form-control form-select w-100 border-bottom border-light z-100"
                  items={feeds}
                  // onHover={handleOnHover}
                  onSelect={(e) => {
                    //handleonSelect(0, e);
                    setProc([proc[0], e.id]);
                  }}
                  // onFocus={handleOnFocus}
                  inputSearchString={feeds.find((x) => x.id === proc[1])?.String_for_Search}
                  //onFocus={}
                  showIcon={false}
                  styling={{
                    backgroundColor: '#111111',
                    color: 'white',
                    zIndex: '99',
                    borderRadius: '0px',
                    minHeight: '32px',
                    height: '32px',
                    border: '0px',
                    borderWidth: '0px 0px 1px  0px',
                    borderBottom: '1px solid white',
                    borderColor: 'white',
                  }}
                  fuseOptions={{ keys: ['String_for_Search'] }}
                  resultStringKeyName="String_for_Search"
                  autoFocus
                  formatResult={formatResult}
                />
              </div>
              <div className="col-sm-2">
                <button
                  className="btn btn-info"
                  title="Crea un nuova valore nel quale salvare i dati"
                  onClick={() => {
                    setNodeModal(true);
                  }}
                >
                  Crea Valore
                </button>
              </div>
            </>
          ) : (
            <div className="col-sm-7">
              <input
                type="number"
                className="form-control"
                placeholder="Use '.' as decimal separator"
                onChange={(e) => {
                  setProc([proc[0], e.target.value]);
                }}
              />
            </div>
          )}
          <div className="col-sm-1 btn-group text-right">
            <button
              className="btn btn-success"
              title="Conferma creazione di un nuovo processo"
              onClick={addProcess}
              disabled={proc[0] === '' || proc[1] === ''}
            >
              <i className="fa fa-save"></i>
            </button>
            <button
              title="Annulla la creazione di un nuovo processo"
              className="btn btn-danger"
              onClick={() => {
                setShowNew(false);
              }}
            >
              <i className="fa fa-minus"></i>
            </button>
          </div>
        </div>
      )}
      {!showNew && (
        <div className="row justify-content-center mt-2">
          <div className="col-sm-5"></div>
          <div className="col-sm-2">
            <button
              title="Crea un nuovo processo"
              className="btn btn-block btn-success"
              onClick={() => {
                setProc(['', '']);
                setShowNew(true);
              }}
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
        </div>
      )}
      <CreateNodeModal
        isOpen={nodeModal}
        feeds={feeds}
        onClose={(res) => {
          setNodeModal(false);
          getFeeds();
        }}
      ></CreateNodeModal>
    </>
  );
};

export default ProcessList;
