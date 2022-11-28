// loading data, drawing charts

const color_names = ["blue", "green", "yellow", "red", "orange", "brown", "purple", "pink"];
const rgb_values = ["#00A1DE", "#009B3A", "#F9E300", "#C60C30", "#F9461C", "#62361B", "#522398", "#E27EA6"];
const gray = "#565a5c"

main();

async function main() {
	const lstations = await loadLstations();
	const ridership = await loadRidership(lstations);
	const raillines = await fetchLocal('data/raillines.geojson', 'json');
	const zipcodes = await fetchLocal('data/zipcodes.geojson', 'json');
	const weather = await fetchLocal('data/weather.csv', 'csv');

	drawHistogram(ridership);
	drawLineChart(ridership);
	drawMap(ridership, lstations, raillines, zipcodes);
	drawLinkedMap();
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
		.append(() => ridershipHistogram)
		.attr('viewBox', `0 0 ${width} ${height}`)
		.attr('class', 'svg-item');
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

function drawLineChart(ridership) {
	// set up
	const margin = {top: 10, right: 20, bottom: 50, left: 100};
	const visWidth = 1000;
	const visHeight = 400;
	const totalWidth = visWidth + margin.left + margin.right;
	const totalHeight = visHeight + margin.top + margin.bottom

	const svg = d3.select('#linechart-container')
		.append('svg')
		.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
	
	const g = svg.append('g')
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// create scales
		var x = d3.scaleTime()
		.domain(d3.extent(ridership, d => d.date))
		.range([0, visWidth]);

	const y = d3.scaleLinear()
		.range([visHeight, 0]);

	// create and add axes
	const xAxis = d3.axisBottom(x);
	const xAxisGroup = g.append("g")
		.call(xAxis)
		.attr("transform", `translate(0, ${visHeight})`);
	xAxisGroup.append('text')
		.attr('x', visWidth / 2)
		.attr('y', 40)
		.attr('fill', 'black')
		.attr('text-anchor', 'middle')
		.text('Date');

	const yAxis = d3.axisLeft(y).tickSizeOuter(0);
	const yAxisGroup = g.append("g")
	yAxisGroup.append("text")
		.attr("x", -visHeight / 2)
		.attr("y", -70)
		.attr("fill", "black")
		.attr("text-anchor", "middle")
		.attr('transform', 'rotate(-90)')
		.text("Ridership Total");
	
	update(ridership);

	function update(data) {
		// get the number of rides for each month
		const dailyCounts = d3.rollup(
			data,
			group => group.reduce((sum, item) => sum + item.rides, 0),
			d => d.date.getFullYear() + '-' + ("0" + (d.date.getMonth() + 1)).slice(-2)
		);

		// update y scale
		y.domain([0, d3.max(dailyCounts.values())]).nice()

		// update y axis
		const t = svg.transition()
			.ease(d3.easeLinear)
			.duration(200);

		yAxisGroup
			.transition(t)
			.call(yAxis);

		const parseTime = d3.timeParse("%Y-%m");

		svg.append("path")
			.datum(dailyCounts)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 1.5)
			.attr(
				"d",
				d3.line().x(([date, count]) => x(parseTime(date)) + margin.left).y(([date, count]) => y(count) + margin.top)
			)
	}
}

function drawMap(ridership, lstations, raillines, zipcodes) {
	const mapWidth = 600;
	const mapHeight = 1000;

	let interactiveMonth = document.getElementById("map-monthSlider").value
  let interactiveYear = document.getElementById("map-yearSlider").value

  var monthSlider = document.getElementById("map-monthSlider")
  var yearSlider = document.getElementById("map-yearSlider")

  var outputMonth = document.getElementById("map-month")
  var outputYear = document.getElementById("map-year")

  // draw map with initial values
  updateSliderNum();
  var svg = svgMap();
	d3.select("#map-container").append(() => svg);
  svg.updateRadius(interactiveMonth, interactiveYear);

  // monthSlider on change
  monthSlider.onchange = () => {
    updateSliderNum();
    svg.updateRadius(interactiveMonth, interactiveYear);
  }

  // yearSlider on change
  yearSlider.onchange = () => {
    updateSliderNum();
		svg.updateRadius(interactiveMonth, interactiveYear);
  }

  function updateSliderNum() {
    interactiveMonth = monthSlider.value
    interactiveYear = yearSlider.value
    
    outputMonth.innerHTML = parseInt(monthSlider.value) + 1
    outputYear.innerHTML = yearSlider.value
  }

	function svgMap() {
		const projection = createProjection(mapWidth, mapHeight, lstations, zipcodes);

		// create SVG
		const svg = d3.create("svg")
			.attr('width', mapWidth)
			.attr('height', mapHeight)
			.attr('id', 'content');
	
		const g = svg.append('g')
			.attr('class', 'map');
	
		addBoundaries(svg, projection, zipcodes);
		addLines(svg, projection, raillines);
	
		// add points
		const dots = svg.select('#content g.map')
			.selectAll('circle')
			.data(lstations)
			.join('circle')
			.attr('cx', d => projection([d[1].longitude, d[1].latitude])[0])
			.attr('cy', d => projection([d[1].longitude, d[1].latitude])[1])
			.attr('fill', gray)
			.attr('fill-opacity', 0.6)
			.attr('stroke', 'black')
			.attr('opacity', 0.4);
	
		function updateRadius(month, year) {
			// update sums
			var rides_sums = d3.rollup(
				ridership.filter(item => item.date.getMonth() == month && item.date.getFullYear() == year),
				group => group.reduce((sum, item) => sum + item.rides, 0),
				d => d.station_id
			)
	
			// update scale
			var radius_scale = d3.scaleSqrt()
				.domain([Math.min(...rides_sums.values()), Math.max(...rides_sums.values())]).nice()
				.range([1, 12]);
	
			// change radius of dots using new sums and scale
			dots.attr('r', d => radius_scale(rides_sums.get(d[1].station_id)));
		}
	
		return Object.assign(svg.node(), { updateRadius });
	}
}

function drawLinkedMap() {}

function createProjection(mapWidth, mapHeight, lstations, zipcodes) {
  // center points: mean([min, max]) of possible longitude/latitude values
  const arr_lstations = Array.from(lstations.values())
  const flat_zipcodes = zipcodes.features.map( item => item.geometry.coordinates ).flat(3)
  
  var centerLon = d3.mean(
    d3.extent(
      d3.merge([
        arr_lstations.map( item => item.longitude ),
        flat_zipcodes.map( item => item[0] )
      ])
    ))
  
  var centerLat = d3.mean(
    d3.extent(
      d3.merge([
        arr_lstations.map( item => item.latitude ),
        flat_zipcodes.map( item => item[1] )
      ])
    ))

  return d3.geoMercator()
    .scale(mapWidth / 0.0028 / Math.PI)
    .rotate([0, 0])
    .center([centerLon, centerLat])
    .translate([mapWidth / 2, mapHeight / 2])
}

function addBoundaries(svg, projection, zipcodes) {
	const geoGenerator = d3.geoPath()
  	.projection(projection);
	
  var g = svg.select('#content g.map')
  .append('g')
    .attr('id', 'zipcodes');
  
  let u = g.selectAll('path')
    .data(zipcodes.features);

  u.enter()
    .append('path')
    .attr('d', geoGenerator)
    .attr('fill', '#fff')
    .attr('stroke', '#555')
    .attr('class', 'zipcode');
}

function addLines (svg, projection, raillines) {
	const geoGenerator = d3.geoPath()
		.projection(projection);

  var legend_rgb = {
    'RD': '#C60C30',
    'BL': '#00A1DE',
    'GR': '#009B3A',
    'BR': '#62361B',
    'PR': '#522398',
    'YL': '#F9E300',
    'PK': '#E27EA6',
    'OR': '#F9461C',
    'ML': '#000000'
  }

  let g = svg.select('#content g.map')
    .append('g')
    .attr('id', 'raillines');

  let u = g.selectAll('path')
    .data(raillines.features);

  u.enter()
    .append('path')
    .attr('d', geoGenerator)
    .attr('stroke', (d) => legend_rgb[d.properties.LEGEND])
    .attr('fill', 'none')
    .attr('stroke-width', '3px')
    .attr('class', 'railline');
}