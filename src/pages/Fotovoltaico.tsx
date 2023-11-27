import React, { FC } from 'react';

import '../css/inputs.css';

export const Fotovoltaico: FC = () => {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  let ts = date.getTime();
  let tsTo = Math.round(ts / 1000);
  let tsFrom = ts - 86400;

  return (
    <div className="container">
      <h1 className="text-center">Fotovoltaico</h1>
      <iframe
        src="http://srv2.atolstudio.com:3000/d/efBmBPx7z/analisi-bilanciamento-fotovoltaico?orgId=1&from={tsFrom}&to={tsTo}&kiosk"
        data-oldsrc="http://srv2.atolstudio.com:3000/d-solo/efBmBPx7z/analisi-bilanciamento-fotovoltaico?orgId=1&from={tsFrom}&to={tsTo}&panelId=8"
        width="100%"
        height="800"
        frameBorder="0"
      ></iframe>
    </div>
  );
};
