import { useRef, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import GeneratedSingleMesh from "./../components/generated/GeneratedSingleMesh";

import useMarkov from "../hooks/useMarkov";
import useFiles from "../hooks/useFiles";

function BackgroundColor() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color('black');
  }, [scene]);

  return null;
}

export default function App() {
  const ref = useRef();

  // Socket

  const [socketUrl, setSocketUrl] = useState("ws://localhost:3000");
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const [modelFilename, setModelFilename] = useState(false); // State to hold the key

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
      console.log("Message last");
      setModelFilename(lastMessage.data); // Update key to force re-mounting of the model
      console.log(lastMessage);
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  // End Socket
  useFiles([
    "how-to-be-an-inventor.txt",
    "jungle-book.txt",
    "the-eternal-moment-forrester.txt",
  ]);

  return (
    <>
      <p
        style={{
          position: "fixed",
          fontFamily: "Sans-Serif",
          fontWeight: "bold",
          fontSize: 11,
          top: 0,
          right: 30,
          textAlign: "right",
          color: "gray",
          zIndex: 300
        }}
      >
        WSS : {connectionStatus}
      </p>
      <div ref={ref} className="container">
        <Canvas
          shadows
          frameloop="demand"
          camera={{ position: [0, 0, 4] }}
          style={{ pointerEvents: "none", backgroundColor: 'black' }}
          eventSource={ref}
          eventPrefix="offset"
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            castShadow
            shadow-mapSize={[2024, 2024]}
          />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          {modelFilename && (
            <GeneratedSingleMesh modelFilename={modelFilename} />
          )}
          <OrbitControls />
          <Grid
            infiniteGrid
            fadeDistance={20}
            sectionThickness={0.3}
            cellSize={0.5}
            followCamera
          />

          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport
              axisColors={["red", "green", "blue"]}
              labelColor="white"
            />
          </GizmoHelper>
        </Canvas>
      </div>
    </>
  );
}
