#!/usr/bin/env node

const { execSync } = require("child_process");

const PATHS = {
  blender: "/Applications/Blender.app/Contents/MacOS/Blender",
  project: "/Users/nate/Documents/local-repos/290A-CMPM-Poetics/what-was-said",
  generator: {
    blendFiles: "generator/blender",
    textFiles: "generator/whisper",
    generateModel: "generator/blender/generateSingleMesh.py",
    textDirectory: "generator/whisper",
  },
  site: {
    modelDir: "site/public/models",
    componentDir: "site/src/components/generated",
  },
};

function exportBlendToGLTF(blendFilename, textFilename) {

  const blendFile = `${PATHS.project}/${PATHS.generator.blendFiles}/${blendFilename}.blend`;
  const exportPath = `${PATHS.project}/${PATHS.generator.blendFiles}/${blendFilename}.gltf`;
  const generator = `${PATHS.project}/${PATHS.generator.generateModel}`
  const textFile = `${PATHS.project}/${PATHS.generator.textFiles}/${textFilename}.txt`;

  process.stdout.write(
    execSync(
      `${PATHS.blender} ${blendFile} --background --python ${generator} -- ${exportPath} ${textFile}`
    ).toString()
  );
}

function exportGLTFToSite(filename, timestamp) {
  // Generate glb
  process.stdout.write(
    execSync(
      `cd ${PATHS.project}/${PATHS.generator.blendFiles}; npx gltfjsx ${filename}.gltf --transform -R 8192`
    ).toString()
  );

  // Undo the weird renaming that gltfjsx does
  process.stdout.write(
    execSync(
      `cd ${PATHS.project}/${PATHS.generator.blendFiles}; mv ${filename}-transformed.glb ${filename}.glb`
    ).toString()
  );

  // Move model
  process.stdout.write(
    execSync(
      `cd ${PATHS.project}/${PATHS.generator.blendFiles}/; mv ${filename}.glb ${PATHS.project}/${PATHS.site.modelDir}/${filename}-${timestamp}.glb`
    ).toString()
  );

  // Clean up
  // process.stdout.write(
  //   execSync(
  //     `cd ${PATHS.project}/${PATHS.generator.blendFiles}; rm ${filename}.gltf; rm ${filename}.bin; rm ${filename}.jsx`
  //   ).toString()
  // );

  return timestamp;
}

// const filename = "DemoGenerate";

function blenderToSite(blendFilename, textFilename, timestamp) {
  exportBlendToGLTF(blendFilename, textFilename);
  exportGLTFToSite(blendFilename, timestamp);
}

module.exports = { blenderToSite, PATHS };

/** 
NOTE TO FUTURE SELF

For the moment we're gonna skipping dynamic JSX creation because
dealing with double, single and angled quotes to parse the regex
is giving me a headache.  So long as there is only one mesh, then
GeneratedSingleMesh.jsx can be used for any model.  If things get
more complex, we might need to try again, though. 

Anyways, this is where we left off : 

// Move component
process.stdout.write(
  execSync(
    `cd ${PATHS.blenderFileDir}; mv ${filename}.jsx ${PATHS.siteComponentDir}/${filename}.jsx`
  ).toString()
);

// Updadate jsx file itself to Re-attach glb
// & add make a default export

const oldPath = `/${filename}-transformed.glb`;
const newPath = `/models/${filename}.glb`;

process.stdout.write(
  execSync(
    `cd ${PATHS.siteComponentDir}; sed -i '' 's|${oldPath}|${newPath}|g' "${filename}.jsx"; echo "\nexport default Model" >> "${filename}.jsx"`
  ).toString()
);

*/