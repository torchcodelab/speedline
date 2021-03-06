#!/usr/bin/env node
'use strict';

var path = require('path');
var meow = require('meow');
var babar = require('babar');
var loudRejection = require('loud-rejection');

var speedIndex = require('./lib');

const OUTPUT_GREEN = '\x1b[32m';
const OUTPUT_BOLD = '\x1b[1m';
const OUTPUT_RESET = '\x1b[22m\x1b[39m';

function display(res) {
	const startTs = res.frames[0].getTimeStamp();
	const visualProgress = res.frames.map(frame => {
		const ts = Math.floor(frame.getTimeStamp() - startTs);
		return `${ts}=${Math.floor(frame.getProgress())}%`;
	}).join(', ');

	const log = [
		`First Visual Change: ${res.first}`,
		`Visually Complete: ${res.complete}`,
		`Speed Index: ${res.speedIndex}`,
		`Visual Progress: ${visualProgress}`
	].join(`\n`);
	console.log(log);
}

function displayPretty(res) {
	const green = (content) => OUTPUT_GREEN + content + OUTPUT_RESET;
	const bold = (content) => OUTPUT_BOLD + content + OUTPUT_RESET;

	console.log([
		`${bold('Recording duration')}: ${green(res.duration + ' ms')}`,
		`${bold('First visual change')}: ${green(res.first + ' ms')}`,
		`${bold('Last visual change')}: ${green(res.complete + ' ms')}`,
		`${bold('Speed Index')}: ${green(res.speedIndex)}`,
		`${bold('Perceptual Speed Index')}: ${green(res.perceptualSpeedIndex)}`,
		'',
		`${bold('Histogram visual progress:')}`
	].join('\n'));

	var baseTs = res.frames[0].getTimeStamp();

	var progress = res.frames.map(frame => [frame.getTimeStamp() - baseTs, frame.getProgress()]);
	console.log(babar(progress));

	console.log(bold('Histogram perceptual visual progress:'));
	var perceptualProgress = res.frames.map(frame => [frame.getTimeStamp() - baseTs, frame.getPerceptualProgress()]);
	console.log(babar(perceptualProgress));
}

function handleError(err) {
	console.error(err.message);
	console.log(Object.keys(err));
	if (err.stack) {
		console.log(err.stack);
	}

	process.exit(1);
}

loudRejection();

var cli = meow([
	'Usage',
	'  $ speedline <timeline>',
	'',
	'Options',
	'  -p, --pretty  Pretty print the output',
	'',
	'Examples',
	'  $ speedline ./timeline.json'
]);

if (cli.input.length !== 1) {
	const err = new Error('You should specify a file path!');
	handleError(err);
}

var filePath = path.resolve(process.cwd(), cli.input[0]);

speedIndex(filePath).then(function (res) {
	if (cli.flags.pretty) {
		return displayPretty(res);
	}

	display(res);
});
