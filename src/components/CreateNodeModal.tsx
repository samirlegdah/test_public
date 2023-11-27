import React, { useState } from 'react';
import Modal from 'react-modal';
import feedStore from '../stores/feedStore';
import '../css/inputs.css';

export const CreateNodeModal = (props: any) => {
  const [isUpdating, setUpdating] = useState(false);
  //const [modalOpen, setModalOpen] = useState<boolean>(false);
  console.log(props);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [feeds] = useState<string[]>(getNodeNames(props.feeds));
  const [tag, setTag] = useState(feeds[0]);

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
  async function addfeed() {
    setUpdating(true);
    let r = await feedStore.addFeed({ title: tag }, { name: name, engine: 2 });
    setUpdating(false);
    console.log(r);
    if (r.success === 'true' || r.success === true) {
      props.onClose({ id: r.feedid, name: name, tag: tag });
    } else {
      if (r.message === 'feed already exists') {
        setError('Feed già esistente');
      } else {
        setError(r.message);
      }
    }
  }

  return (
    <Modal isOpen={props.isOpen} ariaHideApp={false} className="dialog-large">
      <div className="container w-100">
        <div className="row">
          <h3 className="col-sm-12 text-center">Nuovo Feed</h3>
        </div>
        <div className="row pb-3">
          <div className="col-sm-12">
            <label>Nome del feed</label>
            <input
              onChange={(e) => {
                setName(e.target.value);
              }}
              className="form-control"
              placeholder="Nome del feed"
            />
          </div>
          <div className="col-sm-12">
            <label>Nodo del feed</label>
            <select
              className="form-control form-select w-100"
              onChange={(e) => {
                setTag(e.target.value);
              }}
            >
              {feeds.map((feed: string) => (
                <option key={feed} value={feed}>
                  {feed}
                </option>
              ))}
            </select>
          </div>
          {error !== '' && (
            <div className="col-sm-12">
              <p className="text-danger">{error}</p>
            </div>
          )}
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
                addfeed();
              }}
              disabled={isUpdating}
            >
              Aggiungi feed
              {isUpdating && <i className="ml-3 fa fa-circle-o-notch fa-spin"></i>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateNodeModal;
