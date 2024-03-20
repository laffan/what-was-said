import { useState, useEffect } from "react";
import { RiMarkov } from "rita";
import useDataStore from "./useDataStore";

function useMarkov(length) {
  const texts = useDataStore((state) => state.texts);
  const [markovArray, setMarkovArray] = useState([]);

  useEffect(() => {
    const rmkv = new RiMarkov(2);

    texts.forEach((text) => {
      rmkv.addText(text);
    });

    try {
      const output = rmkv.generate(length, {
        temperature: 0.5,
        maxLength: 15,
        allowDuplicates: false,
      });
      
      setMarkovArray(output);

    } catch (error) {
      console.error("Error generating Markov text:", error);
    }
  }, [texts, length]);

  return markovArray;
}

export default useMarkov;
