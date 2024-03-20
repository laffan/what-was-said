import { useState, useEffect } from "react";
import { RiTa } from "rita";
import useDataStore from "./useDataStore";

function useRandomSample(count, lengthPer) {
  const texts = useDataStore((state) => state.texts);
  const [randArray, setRandArray] = useState([]);

  useEffect(() => {
    const corpus = [];
    let returnArray = [];

    // Create a word corpus from the texts
    texts.forEach((text) => {
      const cleanTxt = text.replace(/[^\w\s]/gi, '').replace(/\n/g, " ");

      let words = RiTa.tokenize(cleanTxt)
      corpus.push(...words);
    });

    // Add ranom from that list
    try {
      for (let i = 0; i < count; i++) {
        returnArray.push(RiTa.articlize(RiTa.randomWord(corpus, { 
          minLength: 4,
          pos: "n"
           })));
      }

      setRandArray(returnArray);
    } catch (error) {
      console.error("Error generating random samples:", error);
    }
  }, [texts]);

  return randArray;
}

export default useRandomSample;
