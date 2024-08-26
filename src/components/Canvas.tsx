import { useCallback, useEffect, useRef } from 'react';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Node } from 'konva/lib/Node';

const CANVAS_SIZE = 512;

export default function Canvas2() {
  const source = '/images/bottle.jpeg';
  const stageRef = useRef<Stage | null>(null);
  const layerRef = useRef<Layer | null>(null);
  const imageRef = useRef<Node | null>(null);

  /* 1. Stage와 Layer를 생성 */
  const initialize = useCallback(() => {
    const stage = new Konva.Stage({
      container: 'container', // <div id='container'></div>의 id와 연결
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer();
    layerRef.current = layer;
    stage.add(layer);
  }, []);

  /* 2. 위에서 생성한 Layer위에 이미지 객체를 올려주기. */
  const drawImage = useCallback(async () => {
    if (layerRef.current) {
      const imageObj = new Image();
      imageObj.src = source;
      try {
        await new Promise((resolve, reject) => {
          imageObj.onload = resolve;
          imageObj.onerror = reject;
        });

        const imageOpt = {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          image: imageObj,
          id: 'imageId',
          draggable: true, //true로 설정 시 캔버스 내에서 이미지를 여기저기 옮길 수 있다.
        };

        const defaultImage = new Konva.Image(imageOpt);

        imageRef.current = defaultImage;
        layerRef?.current?.add(defaultImage);
      } catch (error) {
        alert('이미지 로드에 실패했다!');
      }
    }
  }, []);

  /* 3. DOM이 렌더 된 뒤에 실행되어야 하므로 useEffect안에서 initialize, drawImage를 순서대로 실행해준다. */
  useEffect(() => {
    if (!source) return;
    initialize();
    drawImage();
  }, [initialize, drawImage]);

  return <div id='container'></div>;
}
