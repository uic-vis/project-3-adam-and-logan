// loading data, drawing charts

const color_names = ["blue", "green", "yellow", "red", "orange", "brown", "purple", "pink"];
const rgb_values = ["#00A1DE", "#009B3A", "#F9E300", "#C60C30", "#F9461C", "#62361B", "#522398", "#E27EA6"];

main();

async function main() {
	const lstations = await loadLstations();
	const ridership = await loadRidership(lstations);
	console.log(ridership);
	console.log(lstations);

	drawHistogram(ridership);
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
		return d3.csv(filepath, d3.autoType);
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

	var ridershipHistogram = Histogram(
		d3.rollup(
		  ridership.filter(d => d.date.getFullYear() == 2019),
		  group => group.reduce((sum, item) => sum + item.rides, 0),
		  d => d.station_id
		),
		{
		  value: d => d[1] / 365,
			width: width,
			height: height,
		  color: rgb_values[3],
			normalize: true,
		}
	);

	d3.select("#hist-container")
		.append(() => ridershipHistogram);
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/histogram
function Histogram(data, {
  value = d => d, // convenience alias for x
  domain, // convenience alias for xDomain
  label, // convenience alias for xLabel
  format, // convenience alias for xFormat
  type = d3.scaleLinear, // convenience alias for xType
  x = value, // given d in data, returns the (quantitative) x-value
  y = () => 1, // given d in data, returns the (quantitative) weight
  thresholds = 40, // approximate number of bins to generate, or threshold function
  normalize, // whether to normalize values to a total of 100%
  marginTop = 20, // top margin, in pixels
  marginRight = 30, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width of chart, in pixels
  height = 400, // outer height of chart, in pixels
  insetLeft = 0.5, // inset left edge of bar
  insetRight = 0.5, // inset right edge of bar
  xType = type, // type of x-scale
  xDomain = domain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  xLabel = label, // a label for the x-axis
  xFormat = format, // a format specifier string for the x-axis
  yType = d3.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  yLabel = "↑ Frequency", // a label for the y-axis
  yFormat = normalize ? "%" : undefined, // a format specifier string for the y-axis
  color = "currentColor" // bar fill color
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y0 = d3.map(data, y);
  const I = d3.range(X.length);

  // Compute bins.
  const bins = d3.bin().thresholds(thresholds).value(i => X[i])(I);
  const Y = Array.from(bins, I => d3.sum(I, i => Y0[i]));
  if (normalize) {
    const total = d3.sum(Y);
    for (let i = 0; i < Y.length; ++i) Y[i] /= total;
  }

  // Compute default domains.
  if (xDomain === undefined) xDomain = [bins[0].x0, bins[bins.length - 1].x1];
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  yFormat = yScale.tickFormat(100, yFormat);

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  svg.append("g")
      .attr("fill", color)
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => xScale(d.x0) + insetLeft)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
      .attr("y", (d, i) => yScale(Y[i]))
      .attr("height", (d, i) => yScale(0) - yScale(Y[i]))
    .append("title")
      .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, yFormat(Y[i])].join("\n"));

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call(g => g.append("text")
          .attr("x", width - marginRight)
          .attr("y", 27)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(xLabel));
	
  return svg.node();
}