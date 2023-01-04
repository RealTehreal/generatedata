#!/usr/bin/env node

const yargs = require('yargs/yargs');
const colors = require('ansi-colors');
const cliProgress = require('cli-progress');
const { hideBin } = require('yargs/helpers');
const { generate } = require('../dist');
const { getConfigFile, applyAndValidateCommandLineArgs } = require("../src/utils/bin");

const args = yargs(hideBin(process.argv)).argv;

const configFileContent = getConfigFile(args, process.exit);
applyAndValidateCommandLineArgs(configFileContent);


const progressBar = new cliProgress.SingleBar({
    format: 'Generating |' + colors.grey('{bar}') + '| {percentage}% || {value}/{total} rows',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

const updatedConfigFile = {
    ...configFileContent,
    generationSettings
};

const numResults = configFileContent.generationSettings.numResults;
progressBar.start(numResults, 0);

generate(updatedConfigFile, {
    onBatchComplete: ({ numGeneratedRows, isLastBatch }) => {
        progressBar.update(numGeneratedRows);

        if (isLastBatch) {
            progressBar.stop();
        }
    }
});

/*
const file = fs.createWriteStream('path/to/file');
  file.write("...");
}
file.end();
*/
