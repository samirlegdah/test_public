import React, { FC } from 'react';

import '../css/inputs.css';

export const Glossario: FC = () => {
  const inputName = 'Misura';
  const inputsName = 'Misure';
  const feedName = 'Valore';
  const feedsName = 'Valori';
  return (
    <div className="container">
      <h1 className="text-center">Glossario</h1>
      <h3 id="inputs">
        <strong>{inputsName}:</strong>
      </h3>
      <p className="text-justify">
        Valori misurati in situ; questi possono essere salvati nei {feedsName} desiderati senza essere modificati,
        oppure è possibile applicarvi uno o più Processi. Inoltre, questi vengono raggruppati graficamente per
        Dispositivi. È possibile salvare tutti le {inputsName} in {feedsName} in maniera automatica, tramite il bottone
        <button className="btn btn-success">Inizializza Impianto</button>. Una volta inizializzato l’impianto, il
        sistema crea in automatico i {feedsName} (con i medesimi nomi dele {inputsName}) e crea il processo che salva la{' '}
        {inputName} nel rispettivo {inputName}. E’ possibile aggiungere Processi successivamente a questa operazione.
      </p>
      <h3 id="processi">
        <strong>Processi:</strong>
      </h3>
      <p className="text-justify">
        Operazioni che si possono applicare alle {inputsName}. Ad esempio: è possibile moltiplicare/dividere il numero
        trasmesso dal sensore in situ, così da cambiare unità di misura. Inoltre, tramite questa funzionalità, è
        possibile salvare il dato nel {feedsName} desiderato.
      </p>
      <h3 id="feed">
        <strong>{feedName}:</strong>
      </h3>
      <p className="text-justify">
        Spazio di memoria che accomoda i dati. Ogni {feedName} ha una unità di misura; questa può essere associata
        manualmente ad un {feedName} alla volta, oppure in maniera massiva tramite il bottone{' '}
        <button className="btn btn-primary">Modifica U.M. massivamente</button>. Basterà quindi scrivere una porzione di
        testo che accumuna tutti i feed a cui associare l’unità di misura desiderata.
      </p>
    </div>
  );
};
