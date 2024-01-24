import Konva from 'konva';
import { Node } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Image as KonvaImage } from 'konva/lib/shapes/Image';
import { Rect } from 'konva/lib/shapes/Rect';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { useEffect, useRef } from 'react';

const CANVAS_SIZE = 512;

export default function Canvas2() {
  const source: string = '/images/250-1.png';
  const stageRef = useRef<Stage | null>(null);
  const layerRef = useRef<any>();
  const imageRef = useRef<KonvaImage | null>(null);
  const textRef = useRef<any>();
  const trRef = useRef<Transformer | null>(null);

  const testData = {
    x: 407.23164338942246,
    y: 219.1683486963983,
    rotation: 148.98138914159705,
    width: 200,
    height: 200,
    scaleX: 0.9999999999999779,
    scaleY: 1.0000000000000555,
  };

  useEffect(() => {
    // 1. initialize
    const stage = new Konva.Stage({
      container: 'container',
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
    });

    stageRef.current = stage;

    // 2. add layer
    const layer = new Konva.Layer();
    layerRef.current = layer;
    stage.add(layer);

    // 3. draw image
    const imageObj = new Image();
    imageObj.src = source;
    imageObj.onload = function () {
      const defaultImage = new Konva.Image({
        // x: 0,
        // y: 0,
        // width: 200,
        // height: 200,
        ...testData,
        image: imageObj,
        id: 'imageId',
        draggable: true,
      });
      imageRef.current = defaultImage;
      layer.add(defaultImage);

      // 4. transform image (move, rotate, etc..)
      const transformer = new Konva.Transformer({
        anchorSize: 8,
        rotateLineVisible: true,
        borderStroke: '#FF00E5',
        anchorStroke: '#FF00E5',
        rotateAnchorOffset: 20,
        rotateAnchorCursor: 'grab',
        enabledAnchors: [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ],
        anchorStyleFunc: (anchor) => {
          if (anchor.hasName('rotater')) {
            anchor.fill('#FF00E5');
            // @ts-ignore
            anchor?.cornerRadius(10);
          }
        },
      });
      trRef.current = transformer;
      layer.add(transformer);

      const text = new Konva.Text({
        x: 5,
        y: 5,
      });
      layerRef.current.add(text);
      textRef.current = text;
    };
  }, []);

  function getData() {
    if (!stageRef.current || !trRef.current) return;
    console.log('trRef', trRef.current);
  }

  function updateText() {
    if (textRef.current !== null) {
      const lines = [
        'x: ' + imageRef.current?.x(),
        'y: ' + imageRef.current?.y(),
        'rotation: ' + imageRef.current?.rotation(),
        'width: ' + imageRef.current?.width(),
        'height: ' + imageRef.current?.height(),
        'scaleX: ' + imageRef.current?.scaleX(),
        'scaleY: ' + imageRef.current?.scaleY(),
      ];
      textRef.current.text(lines.join('\n'));
    }
  }

  function centerImage() {
    if (imageRef.current) {
      const width = imageRef.current.getWidth() * imageRef.current.scaleX();
      const height = imageRef.current.getHeight() * imageRef.current.scaleY();

      imageRef.current.setAttrs({
        x: CANVAS_SIZE / 2 - width / 2,
        y: CANVAS_SIZE / 2 - height / 2,
        rotation: 0,
      });
    }
  }

  // focus on
  function onFocus() {
    if (!trRef.current) return;
    trRef.current.nodes([imageRef.current as Node]);
  }

  // focus out
  function onFocusOut() {
    if (!trRef.current) return;
    trRef.current.nodes([]);
  }

  function getRotationCenter(
    x: number,
    y: number,
    rotation: number,
    width: number,
    height: number,
    scaleX: number,
    scaleY: number
  ): { x: number; y: number } {
    // 이미지의 중심 좌표 계산
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 회전 각도를 라디안으로 변환
    const radians = (rotation * Math.PI) / 180;
    console.log('radians', radians);

    // 이미지가 회전될 때 변화하는 너비와 높이 계산
    const rotatedWidth =
      Math.abs(width * scaleX * Math.cos(radians)) +
      Math.abs(height * scaleY * Math.sin(radians));
    const rotatedHeight =
      Math.abs(width * scaleX * Math.sin(radians)) +
      Math.abs(height * scaleY * Math.cos(radians));

    // 회전 중심 좌표 계산
    const rotationCenterX = centerX - width / 2 + rotatedWidth / 2;
    const rotationCenterY = centerY - height / 2 + rotatedHeight / 2;

    return { x: rotationCenterX, y: rotationCenterY };
  }

  // 회전 중심 좌표 구하기

  function create() {
    const rotationCenter = getRotationCenter(
      testData.x,
      testData.y,
      testData.rotation,
      testData.width,
      testData.height,
      testData.scaleX,
      testData.scaleY
    );
    const { x, y } = rotationCenter;
    console.log('x,', x, y);
    var circle = new Konva.Circle({
      x,
      y,
      radius: 5,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // add the shape to the layer
    layerRef.current?.add(circle);

    // add the layer to the stage
    stageRef.current?.add(layerRef.current);
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', marginRight: '2px' }}
    >
      <div
        id='container'
        onMouseOut={updateText}
        onMouseEnter={onFocus}
        onMouseLeave={onFocusOut}
        onTouchStart={onFocus}
      ></div>
      <button onClick={getData}>get data</button>
      <button onClick={centerImage}>center image</button>
      <button onClick={create}>도형</button>
    </div>
  );
}
