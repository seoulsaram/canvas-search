import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';

export default function Canvas2() {
  const source: string = '/images/250-1.png';
  const [imageTest, setImage] = useState<any>(null);
  const stageRef = useRef<any>();
  const layerRef = useRef<any>();

  useEffect(() => {
    // 1. initialize
    const stage = new Konva.Stage({
      container: 'container',
      width: 512,
      height: 512,
    });

    stageRef.current = stage;

    const layer = new Konva.Layer();
    layerRef.current = layer;
    stage.add(layer);

    const imageObj = new Image();
    imageObj.src = source;
    imageObj.onload = function () {
      const defaultImage = new Konva.Image({
        x: 0,
        y: 0,
        image: imageObj,
        width: 200,
        height: 200,
        id: 'imageId',
        draggable: true,
      });
      layer.add(defaultImage);
      var tr = new Konva.Transformer({
        anchorSize: 6,
        rotateLineVisible: true,
        anchorFill: '#F1C232',
        borderStroke: '#F1C232',
        anchorStroke: '#F1C232',
        rotateAnchorOffset: 10,
      });
      //   tr.children[1].attrs.stroke = '#F1C232';
      //   tr.children[1].attrs.colorKey = '#F1C232';
      console.log('tr.children[1].attrs.stroke', tr.children[1].attrs.stroke);
      layer.add(tr);
      tr.nodes([defaultImage]);
      console.log('tr', tr);
    };
  }, []);

  //   useEffect(() => {
  //     const tt = stageRef.current.find('#imageId');
  //     var tr = new Konva.Transformer();
  //     layerRef.current.add(tr);
  //     tr.nodes(tt);
  //   }, [imageTest]);

  function getData() {
    // console.log('stage', stageRef.current);
    const data = stageRef.current.toJSON();
    console.log('data', JSON.parse(data));
  }

  return (
    <>
      <div id='container'></div>
      <button onClick={getData}>get data</button>
    </>
  );
}
