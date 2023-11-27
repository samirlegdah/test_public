import React, { FC } from 'react';

import '../css/inputs.css';

export const Pompadicalore: FC = () => {
  return (
    <div className="container">
      <h1 className="text-center">Pompa di calore</h1>
      <iframe
        src="http://srv2.atolstudio.com:3000/d-solo/LoBiBExnz/analisi-consumi-ed-efficienza-pompa-di-calore?orgId=1&from=1650506341008&to=1650527941008&panelId=2"
        width="100%"
        height="500"
        frameBorder="0"
      ></iframe>
    </div>
  );
};
