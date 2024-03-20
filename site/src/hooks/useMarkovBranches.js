import { useState, useEffect } from "react";
import { RiMarkov } from "rita";
import useDataStore from "./useDataStore";

// Calculate required phrases @ each depth
// Credit: LLM
function totalSegments(depth, branches) {
  if (branches === 1) return depth; // Special case where tree doesn't branch out
  return (1 - Math.pow(branches, depth)) / (1 - branches);
}

function useMarkovBranches(depth, branchCount) {
  const texts = useDataStore((state) => state.texts);
  const [markovArray, setMarkovArray] = useState([]);
  const phraseCount = totalSegments(depth, branchCount);

  // Generate an array of nested branches
  // Credit : LLM
  function createBranchingTree(
    depth,
    branches,
    textArray,
    startX = 0,
    startY = 0,
    startZ = 0,
    angle = 90,
    step = 10,
    id = 0
  ) {
    if (depth === 0) return null;

    let node = {
      id: id,
      text: textArray[id % textArray.length],
      position: [startX, startY, startZ],
      branches: [],
    };

    for (let i = 0; i < branches; i++) {
      let angleRad = (angle / 180) * Math.PI;
      let x = startX + Math.cos(angleRad) * step;
      let y = startY + Math.sin(angleRad) * step;
      let z = startZ + (depth * step) / 2; // Simple z increment
      let child = createBranchingTree(
        depth - 1,
        branches,
        textArray,
        x,
        y,
        z,
        angle + (i * 360) / branches,
        step,
        id + 1 + i
      );
      if (child) {
        node.branches.push(child);
        id += child.id; 
      }
    }

    return node;
  }

  useEffect(() => {
    // fresh instance each run
    const rmkv = new RiMarkov(2);

    texts.forEach((text) => {
      rmkv.addText(text);
    });

    try {
      const textArray = rmkv.generate(phraseCount, {
        temperature: 0.5,
        maxLength: 15,
        allowDuplicates: false,
      });

      let tree = createBranchingTree(depth, branchCount, textArray);

      setMarkovArray(tree);
    } catch (error) {
      console.error("Error generating Markov text:", error);
    }
  }, [texts, length]);

  return markovArray;
}

export default useMarkovBranches;
