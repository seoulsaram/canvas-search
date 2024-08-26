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
