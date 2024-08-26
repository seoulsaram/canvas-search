import { useCallback, useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Node } from 'konva/lib/Node';
import { Transformer } from 'konva/lib/shapes/Transformer';
import {
  CanvasObjType,
  getCanvasObjectData,
  rotateAroundCenter,
} from '../utils/image.utils';
import useUndoableState from '../hooks/useUndoableState';

const CANVAS_SIZE = 512;

export default function Canvas2() {
  const source = '/images/bottle.jpeg';
  const stageRef = useRef<Stage | null>(null);
  const layerRef = useRef<Layer | null>(null);
  const imageRef = useRef<Node | null>(null);
  const transformerRef = useRef<Transformer | null>(null);

  const [degree, setDegree] = useState(0);
  const [data, setData] = useState<CanvasObjType | null>(null);

  const currentDegree = useRef(0);

  const {
    state: imageState,
    setState: setImageState,
    index: stateIndx,
    lastIndex: lastStateIdx,
    goBack,
    goForward,
  } = useUndoableState<CanvasObjType | null>();

  useEffect(() => {
    if (!imageRef.current) return;
    imageRef.current.setAttrs(imageState);
  }, [imageState]);

  const saveImageState = useCallback(() => {
    if (!imageRef.current) return;
    const data = getCanvasObjectData(imageRef.current);
    setImageState(data);
  }, [setImageState]);

  const canUndo = stateIndx > 0;
  const canRedo = stateIndx < lastStateIdx;

  const initialize = useCallback(() => {
    const stage = new Konva.Stage({
      container: 'container',
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer();
    layerRef.current = layer;
    stage.add(layer);
  }, []);

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
          draggable: true,
          crossOrigin: 'anonymous', //=> 이거 추가
          scale: {
            x: 0.9,
            y: 0.9,
          },
        };

        const defaultImage = new Konva.Image(imageOpt);

        imageRef.current = defaultImage;
        layerRef?.current?.add(defaultImage);
      } catch (error) {
        alert('이미지 로드에 실패했다!');
      }
    }
  }, []);

  function addTransformer() {
    const transformer = new Konva.Transformer({
      anchorSize: 10,
      flipEnabled: false,
      borderStroke: '#3bbc55d6',
      anchorStroke: '#3bbc55d6',
      rotateAnchorOffset: 20,
      rotateAnchorCursor: 'grab',
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName('rotater')) {
          anchor.fill('#3bbc55d6');
          // @ts-ignore
          anchor?.cornerRadius(10);
        }
      },
    });
    transformerRef.current = transformer;
    layerRef?.current?.add(transformer);
  }

  function onFocus() {
    if (!transformerRef.current) return;
    transformerRef.current.nodes([imageRef.current as Node]);
  }

  function onFocusOut() {
    if (!transformerRef.current) return;
    transformerRef.current.nodes([]);
  }

  function rotateImage() {
    if (imageRef.current) {
      rotateAroundCenter(imageRef.current, degree + 90);
      setDegree(degree + 90 === 360 ? 0 : degree + 90);

      saveImageState();
    }
  }

  function centerImage() {
    if (imageRef.current) {
      const width = imageRef.current.width() * imageRef.current.scaleX();
      const height = imageRef.current.height() * imageRef.current.scaleY();

      currentDegree.current = imageRef.current.rotation();

      imageRef.current.setAttrs({
        rotation: 0,
      });

      imageRef.current.setAttrs({
        x: (CANVAS_SIZE - width) / 2,
        y: (CANVAS_SIZE - height) / 2,
      });

      rotateAroundCenter(imageRef.current, currentDegree.current);
      saveImageState();
    }
  }

  function getData() {
    if (!imageRef.current) return null;
    const data = getCanvasObjectData(imageRef.current);

    setData(data);
    return data;
  }

  function saveImage() {
    onFocusOut();

    if (stageRef.current) {
      const imageElement = new Image();
      const dataUrl = stageRef.current.toDataURL();
      imageElement.onload = function () {
        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      imageElement.src = dataUrl;
    }
  }

  useEffect(() => {
    if (!source) return;
    initialize();
    drawImage().then(() => {
      addTransformer();
      centerImage();
      saveImageState();
    });
  }, [initialize, drawImage]);

  return (
    <section id='canvas_container'>
      <div
        id='container'
        onMouseEnter={onFocus}
        onMouseLeave={onFocusOut}
        onTouchStart={onFocus}
        onPointerUp={saveImageState}
      ></div>
      <div className='btn_container'>
        <div className='control_btn'>
          <button className='rotate_btn' onClick={rotateImage}>
            회전하기
          </button>
          <button className='rotate_btn center' onClick={centerImage}>
            중앙정렬
          </button>
          <button className='rotate_btn data' onClick={getData}>
            데이터 추출
          </button>
        </div>
        <div className='control_btn'>
          <button
            className='rotate_btn redo'
            disabled={!canRedo}
            onClick={() => goForward()}
          >
            Redo
          </button>
          <button
            className='rotate_btn undo'
            disabled={!canUndo}
            onClick={() => goBack()}
          >
            Undo
          </button>
          <button className='rotate_btn save' onClick={() => saveImage()}>
            이미지 저장
          </button>
        </div>
      </div>
      <div className='imageData' style={{ display: !data ? 'none' : 'block' }}>
        {data &&
          Object.entries(data).map(([key, value]) => (
            <p key={key}>
              {key}:
              {typeof value === 'object'
                ? `x : ${value.x}, y : ${value.y}`
                : value}
            </p>
          ))}
      </div>
    </section>
  );
}
