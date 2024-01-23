import React, { useEffect, useRef, useState } from 'react';
import './App.css';

/*
TODO List
1. 캔버스에 이미지를 그린다. 누끼 이미지, 마스킹 이미지를 겹쳐서 마스킹 이미지의 opacity를 0으로 세팅한다.
2. 캔버스 사이즈는 512*512
3. 이미지에 호버하면 이미지바운더리가 선택된다.
4. 이미지 바운더리를 통해 resize할 수 있다.
5. center align기능이 있다.
6. alt키를 누른 채로 이미지 바운더리를 늘리면 중앙 축을 중심으로 resize된다.
7. 이미지를 회전할 수 있다.
8. 결과 이미지에서 아래의 데이터를 추출할 수 있다.
  픽셀 변화값 : 가로,세로
  중심 좌표 : x,y
  회전 값 : degree

  !React에서 Canvas를 랜더링하기 위해선
  canvas의 HTML element reference를 가져오기
  컴포넌트의 re-rendering을 일으켜 변경된 화면을 보여주기

*/

interface Size {
  width: number;
  height: number;
}

interface Rectangle extends Size {
  x: number;
  y: number;
}

const MAX_CANVAS_WIDTH = 512;
const MAX_CANVAS_HEIGHT = 512;

const RIGHT_ANGLE = 90;
const STRAIGHT_ANGLE = 180;
const COMPLETE_ANGLE = 360;

function Canvas() {
  const source: string = '/images/250-1.png';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isDragging, setDragging] = useState(false);
  const [boundingBox, setBoundingBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      drawImage(source, context);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      const handleMouseOverEvent = (e: MouseEvent) => {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        if (mouseX >= 0 && mouseX <= 500 && mouseY >= 0 && mouseY <= 500) {
          setDragging(true);
          const boundingInfo = getImageBoundary(canvas, context);
          if (boundingInfo) {
            setBoundingBox(boundingInfo);
          }
        }
      };
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const mouseX = e.clientX - canvas.getBoundingClientRect().left;
          const mouseY = e.clientY - canvas.getBoundingClientRect().top;

          // context?.clearRect(0, 0, canvas.width, canvas.height);
          // context?.drawImage(image, 0, 0, 500, 500);
          // context?.strokeRect(offsetX, offsetY, width, height);
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (isDragging) {
          setDragging(false);
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.beginPath();
          drawImage(source, context);
        }
      };

      canvas.addEventListener('mouseover', handleMouseOverEvent);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseUp);

      return () => {
        canvas.removeEventListener('mouseover', handleMouseOverEvent);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className='canvas_container'>
      <div
        className='canvas'
        style={{
          width: `${MAX_CANVAS_WIDTH}px`,
          height: `${MAX_CANVAS_HEIGHT}px`,
        }}
      >
        <canvas
          style={{ border: '1px solid black' }}
          ref={canvasRef}
          width={MAX_CANVAS_WIDTH}
          height={MAX_CANVAS_HEIGHT}
        />
      </div>
      <button onClick={() => setRotationAngle((angle) => (angle + 90) % 360)}>
        회전
      </button>
    </div>
  );
}

export default Canvas;

function drawImage(source: string, context: CanvasRenderingContext2D) {
  const image = new Image();
  image.src = source;

  image.onload = () => {
    context.drawImage(
      image,
      0,
      0,
      image.width / 0.8,
      image.height / 0.8,
      0,
      0,
      MAX_CANVAS_WIDTH,
      MAX_CANVAS_HEIGHT
    );
  };
}

function getImageBoundary(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

  let counter = 0;
  const pixels = Array.from(imgData.data).filter(() => {
    if (counter === 3) {
      counter = 0;
      return true;
    }
    counter++;
    return false;
  });

  let top = null;
  let bottom = null;
  let left = canvas.width;
  let right = 0;
  for (let y = 0; y < pixels.length - canvas.width; y += canvas.width) {
    const row = pixels.slice(y, y + canvas.width);
    if (row.some((pixel) => pixel > 0)) {
      if (top === null) top = y === 0 ? 0 : y / canvas.width;
      bottom = y / canvas.width;

      let leftmost = null;
      let rightmost = null;
      for (let x = 0; x < row.length; x++) {
        if (!!row[x]) {
          if (leftmost === null) leftmost = x;
          rightmost = x;
        }
      }

      if (leftmost !== null && leftmost < left) left = leftmost;
      if (rightmost !== null && rightmost > right) right = rightmost;
    }
  }
  if (top !== null && bottom !== null) {
    context.beginPath();
    context.strokeStyle = 'green';
    context.rect(left, top, right - left, bottom - top);
    context.stroke();
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }
}
