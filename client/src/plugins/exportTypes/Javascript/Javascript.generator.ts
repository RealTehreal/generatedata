import { ETMessageData, ETOnMessage } from '~types/exportTypes';
const context: Worker = self as any;

let workerUtilsLoaded = false;
context.onmessage = (e: ETOnMessage) => {
	const { stripWhitespace, workerUtilsUrl } = e.data;
	if (!workerUtilsLoaded) {
		importScripts(workerUtilsUrl);
		workerUtilsLoaded = true;
	}
	context.postMessage(generate(e.data, stripWhitespace));
};

export const generate = (data: ETMessageData, stripWhitespace: boolean): string => {
	const { isFirstBatch, isLastBatch, rows, columns, settings } = data;
	const newline = (stripWhitespace) ? '' : '\n';
	const tab = (stripWhitespace) ? '' : '\t';

	let content = '';
	if (isFirstBatch) {
		if (settings.jsExportFormat === 'variable') {
			content += `var data = [${newline}`;
		} else if (settings.jsExportFormat == 'es6') {
			content += `export default [${newline}`;
		} else {
			content += `module.exports = [${newline}`;
		}
	}

	rows.forEach((row: any, rowIndex: number) => {
		content += `${tab}{${newline}${tab}${tab}`;

		const pairs: string[] = [];
		columns.forEach(({ title }, colIndex) => {
			const currValue = row[colIndex];
			// if ($this->isNumeric($j, $currValue) || $this->isBoolean($j, $currValue)) {
			// 	$pairs[] = "\"{$data["colData"][$j]}\": {$currValue}";
			// } else {
			pairs.push(`"${title}": "${currValue}"`);
			// }
		});

		content += pairs.join(`,${newline}${tab}${tab}`);

		if (isLastBatch && rowIndex == rows.length - 1) {
			content += `${newline}${tab}}${newline}`;
		} else {
			content += `${newline}${tab}},${newline}`;
		}
	});

	if (isLastBatch) {
		content += `];${newline}`;
	}

	return content;
};

