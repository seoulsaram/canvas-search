import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';

interface URLImageProps {
  src: string;
  x: number;
  y: number;
}

const Canvas3: React.FC = () => {
  const [image, setImage] = useState<any>(null);
  const imageNodeRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/images/250-1.png';
    img.addEventListener('load', handleLoad);

    return () => {
      img.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleLoad = () => {
    setImage(new window.Image());
  };

  return <Image x={0} y={0} image={image} ref={imageNodeRef} />;
};

export default Canvas3;
