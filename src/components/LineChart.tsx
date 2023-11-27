import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Label } from 'recharts';
import feedStore from 'stores/feedStore';
//unita di misura su asse y
export default function LineChartFeeds(props: any) {
  const [data, setData] = useState<any[]>([]);
  const [height, setHeight] = useState<string>('90%');

  const min = new Date().setDate(new Date().getDate() - 1);
  const [minVal, setMinVal] = useState<number>(0);
  const [maxVal, setMaxVal] = useState<number>(0);

  useEffect(() => {
    feedStore
      .getData(props.id, new Date(new Date().setDate(new Date().getDate() - 1)).getTime(), new Date().getTime())
      .then((res) => res.json())
      .then((json) => {
        let _min = 0,
          _max = 0;
        setData(
          json.data.data.map((x: any, index: number) => {
            if (index === 0) {
              _min = x.grf_1;
              _max = x.grf_1;
            } else {
              if (_min < x.grf_1) {
                _min = x.grf_1;
              }
              if (_max > x.grf_1) {
                _max = x.grf_1;
              }
            }
            return { name: props.name, x: x.ts, y: x.grf_1 };
          })
        );
        setMinVal(_min);
        setMaxVal(_max);
        window.dispatchEvent(new Event('resize'));
      });
  }, [props.id, props.name]);
  setTimeout(function () {
    setHeight('95%');
  }, 500);
  return (
    <Modal isOpen={true} ariaHideApp={false} onRequestClose={props.onCloseModal}>
      <div className="container">
        <div className="row">
          <div className="col-sm-12 text-center">{props.name}</div>
        </div>
      </div>
      <div
        style={{
          marginBottom: '2rem',
          height: height,
          width: '90%',
          minHeight: '28vh',
          overflow: 'hidden',
          //maxHeight: '100%',
        }}
      >
        {data && (
          <LineChart width={window.innerWidth * 0.6} height={window.innerHeight * 0.6} data={data}>
            <CartesianGrid stroke="#222" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[min, Date.now()]}
              height={40}
              tickFormatter={(val: any, index: number) => {
                return new Date(val).toDateString();
              }}
            >
              {/* <Label value="Tempo" position="insideBottom" style={{ fill: 'white' }} /> */}
            </XAxis>
            <YAxis
              domain={[minVal - (maxVal - minVal) * 0.1, maxVal + (maxVal - minVal) * 0.1]}
              tickFormatter={(val: any, index: number) => {
                return (+val).toFixed(2);
              }}
              unit={props.udm}
              width={50}
            >
              <Label value={props.udm} position="insideBottom" style={{ fill: 'white' }} />
            </YAxis>
            <Line type="monotone" dataKey="y" key="y" stroke="#FFF" dot={false} />
          </LineChart>
        )}
      </div>
    </Modal>
  );
}
