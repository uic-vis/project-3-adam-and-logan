// loading data, drawing charts

import {Histogram} from "@d3/histogram"

const color_names = ["blue", "green", "yellow", "red", "orange", "brown", "purple", "pink"];
const rgb_values = ["#00A1DE", "#009B3A", "#F9E300", "#C60C30", "#F9461C", "#62361B", "#522398", "#E27EA6"];

main();

async function main() {
	const lstations = await loadLstations();
	const ridership = await loadRidership(lstations);
	console.log(ridership);
	console.log(lstations);

	drawHistogram();
}

async function fetchURL(url) {
	console.log("fetching from URL...")
	const data = await fetch(url)
		.then(res => res.json())
		.catch(err => { throw err; });
	return data;
}

function fetchLocal(filepath, type) {
	console.log("fetching from filepath...")
	if (type == 'csv') {
		return d3.csv(filepath);
	} else if (type == 'json') {
		return d3.json(filepath);
	}
}

async function loadLstations() {
	const raw = await fetchLocal('data/lstations.csv', 'csv');
	const arr = raw.map( ({geometry, ...item}) => ({
		station_id: item.STATION_ID,
		station_name: item.STATION_NAME,
		ada: item.ADA == "True",
		red: item.RED == "True",
		blue: item.BLUE == "True",
		green: item.GREEN == "True",
		brown: item.BROWN == "True",
		purple: item.PURPLE == "True",
		yellow: item.YELLOW == "True",
		pink: item.PINK == "True",
		orange: item.ORANGE == "True",
		longitude: item.LONGITUDE,
		latitude: item.LATITUDE
	}) );

	return new Map( arr.map(item => [item.station_id, {...item}]) );
}

async function loadRidership(lstations) {
	const raw = await fetchLocal('data/ridership.csv', 'csv');
	const parseTime = d3.timeParse("%m/%d/%Y");
	return raw.map( item => {
		const station = lstations.get(item.station_id);
		const num = numLines(item);

		var rides_ratio = {}
		for (const i in color_names) {
			rides_ratio[color_names[i]] = station[color_names[i]] ? Math.round(item.rides / num) : null;
		}

		return {
			...item,
			date: parseTime(item.date),
			...rides_ratio
		}
	}).sort( (a,b) => {return b.date - a.date} )

	// returns the number of lines a station serves
	function numLines(item) {
		return Object.values(lstations.get(item.station_id)).slice(3, 11).filter(Boolean).length
	}
}

function drawHistogram(ridership) {
	// constants
	const width = 1000;
	const height = 400;
	const margin = {top:50, left:90, bottom:30, right:15};
  const totalWidth = width + margin.left + margin.right;
  const totalHeight = height + margin.top + margin.bottom;

	var svg = d3.select('#hist-container')
		.append('svg')
		.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
		.attr('id', 'histogram');
	
	console.log(svg);

	// ridershipHistogram = Histogram(
	// 	d3.rollup(
	// 	  ridership.filter(d => d.date.getFullYear() == 2019),
	// 	  group => group.reduce((sum, item) => sum + item.rides, 0),
	// 	  d => d.station_id
	// 	),
	// 	{
	// 	  value: d => d[1] / 365,
	// 	  width,
	// 	  height: 300,
	// 	  color: rgb_values[3]
	// 	}
	//   );
}
