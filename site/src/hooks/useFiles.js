import { useState, useEffect, useRef } from 'react';
import useDataStore from './useDataStore';

function useFiles( filePaths ) {

  const addText = useDataStore((state) => state.addText)

  // let [markovArray, setMarkovArray] = useState(["Loading..."]);
  let [filesLoaded, setFilesLoaded] = useState(false);

  useEffect(() => {
    Promise.all(filePaths.map((file) => fetch(`./src/texts/${file}`).then((r) => r.text())))
      .then((texts) => {
        texts.forEach((text) => {
          addText(text); 
        });
      })
      .then(() => {
        setFilesLoaded(true); 
      })
      .catch((error) => console.error("Error loading files: ", error)); 
  }, []); 

  return filesLoaded; 
}

export default useFiles;
