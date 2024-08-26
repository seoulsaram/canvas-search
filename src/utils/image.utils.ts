import Konva from 'konva';
import { Node } from 'konva/lib/Node';

const rotatePoint = ({ x, y }: { x: number; y: number }, rad: number) => {
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};

export function rotateAroundCenter(node: Node, rotation: number) {
  const topLeft = {
    x: -(node.width() * node.scaleX()) / 2,
    y: -(node.height() * node.scaleY()) / 2,
  };
  const current = rotatePoint(topLeft, Konva.getAngle(node.rotation()));
  const rotated = rotatePoint(topLeft, Konva.getAngle(rotation));
  const dx = rotated.x - current.x,
    dy = rotated.y - current.y;

  node.rotation(rotation);
  node.x(node.x() + dx);
  node.y(node.y() + dy);
}

export function degToRad(angle: number) {
  return (angle / 180) * Math.PI;
}

export function getCenter(shape: Node) {
  const angleRad = degToRad(shape.rotation() || 0);
  return {
    x:
      shape.x() +
      ((shape.width() * shape.scaleX()) / 2) * Math.cos(angleRad) +
      ((shape.height() * shape.scaleY()) / 2) * Math.sin(-angleRad),
    y:
      shape.y() +
      ((shape.height() * shape.scaleY()) / 2) * Math.cos(angleRad) +
      ((shape.width() * shape.scaleX()) / 2) * Math.sin(angleRad),
  };
}

export type CanvasObjType = {
  x: number;
  y: number;
  imgCenter: { x: number; y: number };
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  rotation: number;
};

export function getCanvasObjectData(node: Node): CanvasObjType {
  const attrs = {
    x: node.x(),
    y: node.y(),
    width: node.width(),
    height: node.height(),
    rotation: node.rotation(),
  };
  const center = getCenter(node);
  return {
    ...attrs,
    imgCenter: center,
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
  };
}
