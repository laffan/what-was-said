// Copied from https://codesandbox.io/s/e3yc3
// Retrofit https://ada.is/blog/2020/05/18/using-vr-controllers-and-locomotion-in-threejs/

// Also https://github.com/Sean-Bradley/TeleportVR may be useful 

// mapping
// 1: Trigger
// 2: Grip
// 4: Stick Buttons
// 5: A/X
// 6: B/Y

// axes
// 2: XStick
// 3: YStick

import { Raycaster, Vector3 } from "three";
import { useXR, Interactive } from "@react-three/xr";
import { useFrame } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";

export function TeleportIndicator(props) {
  return (
    <>
      <pointLight position={[0, 0.5, 0]} args={[0xff00ff, 2, 0.6]} />
      <mesh position={[0, 0.25, 0]}>
        <coneBufferGeometry args={[0.1, 0.5, 6]} attach="geometry" />
        <meshBasicMaterial attach="material" color={0xff00ff} />
      </mesh>
    </>
  );
}

export default function TeleportTravel(props) {
  const { centerOnTeleport, Indicator = TeleportIndicator } = props;
  const [isHovered, setIsHovered] = useState(false);
  const target = useRef();
  const targetLoc = useRef();
  const ray = useRef(new Raycaster());

  const rayDir = useRef({
    pos: new Vector3(),
    dir: new Vector3(),
  });

  const { controllers, player } = useXR();

  useFrame(() => {
    if (
      isHovered &&
      controllers.length > 0 &&
      ray.current &&
      target.current &&
      targetLoc.current
    ) {
      controllers[0].controller.getWorldDirection(rayDir.current.dir);
      controllers[0].controller.getWorldPosition(rayDir.current.pos);
      rayDir.current.dir.multiplyScalar(-1);
      ray.current.set(rayDir.current.pos, rayDir.current.dir);

      const [intersection] = ray.current.intersectObject(target.current);

      if (intersection) {
        targetLoc.current.position.copy(intersection.point);
      }
    }
  });

  const click = useCallback(() => {
    if (isHovered) {
      player.position.copy(targetLoc.current.position);
    }
  }, [centerOnTeleport, isHovered]);

  return (
    <>
      {isHovered && (
        <group ref={targetLoc}>
          <Indicator />
        </group>
      )}
      <Interactive
        onSelect={click}
        onHover={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <group ref={target}>{props.children}</group>
      </Interactive>
    </>
  );
}
