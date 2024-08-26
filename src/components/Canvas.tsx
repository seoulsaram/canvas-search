import { useCallback, useEffect, useRef } from 'react';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { Node } from 'konva/lib/Node';
import { Transformer } from 'konva/lib/shapes/Transformer';

const CANVAS_SIZE = 512;

export default function Canvas2() {
  const source = '/images/bottle.jpeg';
  const stageRef = useRef<Stage | null>(null);
  const layerRef = useRef<Layer | null>(null);
  const imageRef = useRef<Node | null>(null);
  const transformerRef = useRef<Transformer | null>(null);

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

  useEffect(() => {
    if (!source) return;
    initialize();
    drawImage().then(() => addTransformer());
  }, [initialize, drawImage]);

  return (
    <div
      id='container'
      onMouseEnter={onFocus}
      onMouseLeave={onFocusOut}
      onTouchStart={onFocus}
    ></div>
  );
}
