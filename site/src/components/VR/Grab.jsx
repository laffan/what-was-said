import {
  useImperativeHandle,
  forwardRef,
  useMemo,
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
} from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  VRButton,
  XR,
  Hands,
  useXR,
  Interactive,
  useHitTest,
  useController,
  RayGrab,
  Controllers,
} from "@react-three/xr";

/*
   Return root object of scene to raycast against
  */
function getRootObject(mesh) {
  let obj = mesh;

  while (obj.parent !== null) {
    obj = obj.parent;
  }

  return obj;
}

/*
    Return array of intersections with ray
  */

const tempMatrix = new THREE.Matrix4();
const tempVector = new THREE.Vector3();

function getIntersections(controller, target) {
  const tempMatrix = new THREE.Matrix4();
  const raycaster = new THREE.Raycaster();

  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  // Perform raycasting only on the children of the target object
  return raycaster.intersectObjects(target.children, true);
}

const GrabContext = createContext();

const useGrabContext = () => {
  return useContext(GrabContext);
};

const Grab = ({ children, limits, fixed, isNested = false, ...rest }) => {
  const controlRef = useRef();
  const initialDistance = useRef();
  const hitOffset = useRef();
  const groupRef = useRef(null);
  const initialPosition = useRef();
  const [parentMatrixAtGrabStart, setParentMatrixAtGrabStart] = useState(null);

  useEffect(() => {
    if (groupRef.current) {
      initialPosition.current = groupRef.current.position.clone();
    }
  }, []);

  /* =============================================
  Calculations
  */

  function applyLimits(targetPosition) {
    if (!limits || !initialPosition.current) return;

    const { x, y, z } = limits;

    if (x && Array.isArray(x) && x.length === 2) {
      targetPosition.x = THREE.MathUtils.clamp(
        targetPosition.x,
        initialPosition.current.x + x[0],
        initialPosition.current.x + x[1]
      );
    }

    if (y && Array.isArray(y) && y.length === 2) {
      targetPosition.y = THREE.MathUtils.clamp(
        targetPosition.y,
        initialPosition.current.y + y[0],
        initialPosition.current.y + y[1]
      );
    }

    if (z && Array.isArray(z) && z.length === 2) {
      targetPosition.z = THREE.MathUtils.clamp(
        targetPosition.z,
        initialPosition.current.z + z[0],
        initialPosition.current.z + z[1]
      );
    }
  }

  function applyFixed(targetPosition) {
    if (!fixed || !initialPosition.current) return;

    const { x, y, z } = fixed;

    if (x) {
      targetPosition.setX(groupRef.current.position.x);
    }
    if (y) {
      targetPosition.setY(groupRef.current.position.y);
    }
    if (z) {
      targetPosition.setZ(groupRef.current.position.z);
    }
  }

  /* =============================================
  Calculations
  */

  function updateOffsets(intersections) {
    const firstIntersectionPt = intersections[0].point.clone();

    // Calculate the hitOffset vector in the controller's local space
    const controllerInverseMatrix = tempMatrix.invert(
      controlRef.current.matrixWorld
    );
    const localFirstIntersectionPt = firstIntersectionPt.applyMatrix4(
      controllerInverseMatrix
    );

    hitOffset.current = new THREE.Vector3().subVectors(
      groupRef.current.position.clone().applyMatrix4(controllerInverseMatrix),
      localFirstIntersectionPt
    );

    console.log("offset", hitOffset.current);
  }

  useFrame(() => {
    const controller = controlRef.current;
    if (!controller) return;

    // Calculate the target position
    const controllerWorldPos = new THREE.Vector3().setFromMatrixPosition(
      controller.matrixWorld
    );
    const targetPosition = controllerWorldPos
      .clone()
      .add(hitOffset.current)
      .addScaledVector(
        controller.getWorldDirection(tempVector).negate(),
        initialDistance.current
      );

    // Apply the parent matrix to the target position
    if (parentMatrixAtGrabStart) {
      targetPosition.applyMatrix4(parentMatrixAtGrabStart);
    }

    // Set the group's position to the target position without modifying
    // any of the axis' denoted in the "fixed" prop.
    applyFixed(targetPosition);
    // Limit movement based on the "limits" prop.
    applyLimits(targetPosition);

    groupRef.current.position.lerp(targetPosition, 0.5);
  });

  /* =============================================
  Interaction Handles 
  */
  const handleSelectStart = (e) => {
    const controller = e.target.controller;

    // Get intersections with ray
    const intersections = getIntersections(controller, groupRef.current);

    // If it intersects, update offsets and store the initial position of the object
    if (intersections.length > 0 && !intersections[0].object.noGrab) {
      controlRef.current = controller;
      initialDistance.current = intersections[0].distance;
      updateOffsets(intersections);
      initialPosition.current = groupRef.current.position.clone();

      // Store the matrix in the parent space
      if (groupRef.current.parent) {
        setParentMatrixAtGrabStart(
          groupRef.current.matrixWorld
            .clone()
            .multiply(
              new THREE.Matrix4()(
                groupRef.current.parent.matrixWorld
              )
            )
        );
      } else {
        setParentMatrixAtGrabStart(groupRef.current.matrixWorld.clone());
      }
    }
  };

  const handleSelectEnd = (e) => {
    console.log("Let GO")
    if (controlRef.current) {
      controlRef.current = undefined;
      initialDistance.current = undefined;
      hitOffset.current = undefined;

      if (isNested) {
        setNestedGrabbing(false);
      }
    }
  };

  /* =============================================
  Return
  */
  const [nestedGrabbing, setNestedGrabbing] = useState(false);

  // When the current component is a nested grabbable, and its parent is being grabbed,
  // the current component should not be grabbable.
  const parentGrabbing = useGrabContext();

  // If this component is a nested grabbable and currently being grabbed,
  // its children should not be grabbable.
  const contextValue = isNested ? nestedGrabbing : parentGrabbing;

  return (
    <GrabContext.Provider value={contextValue}>
      <Interactive
        onSelectStart={handleSelectStart}
        onSelectEnd={handleSelectEnd}
        {...rest}
        enabled={!parentGrabbing} // Disable grabbing if parent is being grabbed
      >
        <group ref={groupRef}>{children}</group>
      </Interactive>
    </GrabContext.Provider>
  );
};

export default Grab;
