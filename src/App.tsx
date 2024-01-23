import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Canvas from './components/Canvas1';
import Canvas2 from './components/Canvas2';
import Canvas3 from './components/Canvas3';

function App() {
  return (
    <div>
      {/* <Canvas/> */}
      <Canvas2 />
      {/* <Canvas3 /> */}
    </div>
  );
}

export default App;
