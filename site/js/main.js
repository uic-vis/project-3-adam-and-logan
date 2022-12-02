// loading data, drawing charts

const color_names = [
  "blue",
  "green",
  "yellow",
  "red",
  "orange",
  "brown",
  "purple",
  "pink",
];

const rgb_values = [
  "#00A1DE",
  "#009B3A",
  "#F9E300",
  "#C60C30",
  "#F9461C",
  "#62361B",
  "#522398",
  "#E27EA6",
];

const gray = "#565a5c";

main();

async function main() {
  const lstations = await loadLstations();
  const ridership = await loadRidership(lstations);
  const raillines = await fetchLocal("data/raillines.geojson", "json");
  const zipcodes = await fetchLocal("data/zipcodes.geojson", "json");
  const weather = await loadWeather();

  bars(ridership);
  drawHistogram(ridership);
  drawLineChart(ridership);
  drawInteractiveLineChart(ridership);
  drawMap(ridership, lstations, raillines, zipcodes);
  drawLinkedMap(ridership, lstations, raillines, zipcodes);
  drawLinkedChart(weather, ridership, lstations);
}

function barChartLines() {
  // set up
  const visWidth = 800;
  const visHeight = 400;
  const margin = { top: 10, right: 20, bottom: 50, left: 50 };
  const totalWidth = visWidth + margin.left + margin.right;
  const totalHeight = visHeight + margin.top + margin.bottom;

  const svg = d3.create("svg")
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, totalWidth, totalHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  const x = d3.scaleLinear().range([0, visWidth]);

  let lineColor = d3.scaleOrdinal().domain(color_names).range(rgb_values);

  const y = d3
    .scaleBand()
    .domain(color_names)
    .range([0, visHeight])
    .padding(0.2);

  // create and add axes
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Total Ridership");

  const yAxis = d3.axisLeft(y);
  const yAxisGroup = g
    .append("g")
    .call(yAxis)
    // remove baseline from the axis
    .call((g) => g.select(".domain").remove());

  let barsGroup = g.append("g");

  function update(month, year, ridership) {
    // something is causing ridership to not have .filter method
    console.log(
      "filtered Ridership: ",
      ridership.filter(
        (item) =>
          item.date.getMonth() == month && item.date.getFullYear() == year
      )
    );
    const data = ridership.filter(
      (item) => item.date.getMonth() == month && item.date.getFullYear() == year
    );

    // update sums
    var lineCounts = new Map();
    for (let i = 0; i < color_names.length; i++) {
      lineCounts.set(
        color_names[i],
        d3.sum(data, (d) => d[color_names[i]])
      );
    }

    // update x scale
    x.domain([0, d3.max(lineCounts.values())]).nice();

    // update x axis
    const t = svg.transition().ease(d3.easeLinear).duration(200);

    xAxisGroup.transition(t).call(xAxis);

    // draw bars
    barsGroup
      .selectAll("rect")
      .data(lineCounts, ([line, count]) => line)
      .join("rect")
      .attr("fill", ([line, count]) => lineColor(line))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", ([line, count]) => y(line))
      .transition(t)
      .attr("width", ([line, count]) => x(count));
  }

  return Object.assign(svg.node(), { update });
}

function bars(ridership) {
  let width = 400;
  let height = 600;
  let interactiveMonth = document.getElementById("monthSlider").value;
  let interactiveYear = document.getElementById("yearSlider").value;

  var monthSlider = document.getElementById("monthSlider");
  var yearSlider = document.getElementById("yearSlider");

  var outputMonth = document.getElementById("month");
  var outputYear = document.getElementById("year");

  // show initial values
  outputMonth.innerHTML = parseInt(monthSlider.value) + 1;
  interactiveMonth = monthSlider.value;
  outputYear.innerHTML = yearSlider.value;
  interactiveYear = yearSlider.value;

  const bar = barChartLines();
  bar.update(interactiveMonth, interactiveYear, ridership);

  monthSlider.onchange = () => {
    outputMonth.innerHTML = parseInt(monthSlider.value) + 1;
    interactiveMonth = monthSlider.value;
    bar.update(interactiveMonth, interactiveYear, ridership);
  };

  yearSlider.onchange = () => {
    outputYear.innerHTML = yearSlider.value;
    interactiveYear = yearSlider.value;
    bar.update(interactiveMonth, interactiveYear, ridership);
  };

  d3.select("#barchart")
    .append(() => bar)
    .attr("viewbox", `0 0 1px 0`)
    .attr("class", "svg-item");
  return bar;
}

async function main() {
  const lstations = await loadLstations();
  const ridership = await loadRidership(lstations);
  const raillines = await fetchLocal("data/raillines.geojson", "json");
  const zipcodes = await fetchLocal("data/zipcodes.geojson", "json");
  const weather = await loadWeather();

  bars(ridership);
  drawHistogram(ridership);
  drawLineChart(ridership);
  drawInteractiveLineChart(ridership);
  drawMap(ridership, lstations, raillines, zipcodes);
  drawLinkedMap(ridership, lstations, raillines, zipcodes);
  drawLinkedChart(weather, ridership, lstations);
}

function barChartLines() {
  // set up
  const visWidth = 800;
  const visHeight = 400;
  const margin = { top: 10, right: 20, bottom: 50, left: 50 };
  const totalWidth = visWidth + margin.left + margin.right;
  const totalHeight = visHeight + margin.top + margin.bottom;

  const svg = d3.create("svg")
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, totalWidth, totalHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  const x = d3.scaleLinear().range([0, visWidth]);

  let lineColor = d3.scaleOrdinal().domain(color_names).range(rgb_values);

  const y = d3
    .scaleBand()
    .domain(color_names)
    .range([0, visHeight])
    .padding(0.2);

  // create and add axes
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Total Ridership");

  const yAxis = d3.axisLeft(y);
  const yAxisGroup = g
    .append("g")
    .call(yAxis)
    // remove baseline from the axis
    .call((g) => g.select(".domain").remove());

  let barsGroup = g.append("g");

  function update(month, year, ridership) {
    // something is causing ridership to not have .filter method
    console.log(
      "filtered Ridership: ",
      ridership.filter(
        (item) =>
          item.date.getMonth() == month && item.date.getFullYear() == year
      )
    );
    const data = ridership.filter(
      (item) => item.date.getMonth() == month && item.date.getFullYear() == year
    );

    // update sums
    var lineCounts = new Map();
    for (let i = 0; i < color_names.length; i++) {
      lineCounts.set(
        color_names[i],
        d3.sum(data, (d) => d[color_names[i]])
      );
    }

    // update x scale
    x.domain([0, d3.max(lineCounts.values())]).nice();

    // update x axis
    const t = svg.transition().ease(d3.easeLinear).duration(200);

    xAxisGroup.transition(t).call(xAxis);

    // draw bars
    barsGroup
      .selectAll("rect")
      .data(lineCounts, ([line, count]) => line)
      .join("rect")
      .attr("fill", ([line, count]) => lineColor(line))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", ([line, count]) => y(line))
      .transition(t)
      .attr("width", ([line, count]) => x(count));
  }

  return Object.assign(svg.node(), { update });
}

function bars(ridership) {
  let width = 400;
  let height = 600;
  let interactiveMonth = document.getElementById("monthSlider").value;
  let interactiveYear = document.getElementById("yearSlider").value;

  var monthSlider = document.getElementById("monthSlider");
  var yearSlider = document.getElementById("yearSlider");

  var outputMonth = document.getElementById("month");
  var outputYear = document.getElementById("year");

  // show initial values
  outputMonth.innerHTML = parseInt(monthSlider.value) + 1;
  interactiveMonth = monthSlider.value;
  outputYear.innerHTML = yearSlider.value;
  interactiveYear = yearSlider.value;

  const bar = barChartLines();
  bar.update(interactiveMonth, interactiveYear, ridership);

  monthSlider.onchange = () => {
    outputMonth.innerHTML = parseInt(monthSlider.value) + 1;
    interactiveMonth = monthSlider.value;
    bar.update(interactiveMonth, interactiveYear, ridership);
  };

  yearSlider.onchange = () => {
    outputYear.innerHTML = yearSlider.value;
    interactiveYear = yearSlider.value;
    bar.update(interactiveMonth, interactiveYear, ridership);
  };

  d3.select("#barchart")
    .append(() => bar)
    .attr("viewbox", `0 0 1px 0`)
    .attr("class", "svg-item");
  return bar;
}

async function fetchURL(url) {
  console.log("fetching from URL...");
  const data = await fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
  return data;
}

function fetchLocal(filepath, type) {
  console.log("fetching from filepath...");
  if (type == "csv") {
    return d3.csv(filepath, d3.autoType);
  } else if (type == "json") {
    return d3.json(filepath);
  }
}

async function loadLstations() {
  const raw = await fetchLocal("data/lstations.csv", "csv");
  const arr = raw.map(({ geometry, ...item }) => ({
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
    latitude: item.LATITUDE,
  }));

  return new Map(arr.map((item) => [item.station_id, { ...item }]));
}

async function loadRidership(lstations) {
  const raw = await fetchLocal("data/ridership.csv", "csv");
  const parseTime = d3.timeParse("%m/%d/%Y");
  return raw
    .map((item) => {
      const station = lstations.get(item.station_id);
      const num = numLines(item);

      var rides_ratio = {};
      for (const i in color_names) {
        rides_ratio[color_names[i]] = station[color_names[i]]
          ? Math.round(item.rides / num)
          : null;
      }

      return {
        ...item,
        date: parseTime(item.date),
        ...rides_ratio,
      };
    })
    .sort((a, b) => {
      return b.date - a.date;
    });

  // returns the number of lines a station serves
  function numLines(item) {
    return Object.values(lstations.get(item.station_id))
      .slice(3, 11)
      .filter(Boolean).length;
  }
}

async function loadWeather() {
  const raw = await fetchLocal("data/weather.csv", "csv");

  const parseDate = d3.timeParse("%Y%b");
  var weather = raw
    .map((d) => ({
      date: parseDate(d.year + d.month),
      temp: d.avg_temp,
    }))
    .sort((a, b) => {
      return a.date - b.date;
    });
  weather = d3.filter(weather, d => d.date >= new Date(2005, 0))
  return weather;
}

function drawHistogram(ridership) {
  // constants
  const width = 1000;
  const height = 500;

  var ridershipHistogram = Histogram(
    d3.rollup(
      ridership.filter((d) => d.date.getFullYear() == 2019),
      (group) => group.reduce((sum, item) => sum + item.rides, 0),
      (d) => d.station_id
    ),
    {
      value: (d) => d[1] / 365,
      width: width,
      height: height,
      color: rgb_values[3],
      normalize: true,
    }
  );

  d3.select("#hist-container")
    .append(() => ridershipHistogram)
    .attr("class", "svg-item");
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/histogram
function Histogram(
  data,
  {
    value = (d) => d, // convenience alias for x
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
    color = "currentColor", // bar fill color
  } = {}
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y0 = d3.map(data, y);
  const I = d3.range(X.length);

  // Compute bins.
  const bins = d3
    .bin()
    .thresholds(thresholds)
    .value((i) => X[i])(I);
  const Y = Array.from(bins, (I) => d3.sum(I, (i) => Y0[i]));
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
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(width / 80, xFormat)
    .tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  yFormat = yScale.tickFormat(100, yFormat);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1)
    )
    .call((g) =>
      g
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(yLabel)
    );

  svg
    .append("g")
    .attr("fill", color)
    .selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => xScale(d.x0) + insetLeft)
    .attr("width", (d) =>
      Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight)
    )
    .attr("y", (d, i) => yScale(Y[i]))
    .attr("height", (d, i) => yScale(0) - yScale(Y[i]))
    .append("title")
    .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, yFormat(Y[i])].join("\n"));

  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .call((g) =>
      g
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", 27)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(xLabel)
    );

  return svg.node();
}

function drawLineChart(ridership) {
  // set up
  const margin = { top: 10, right: 20, bottom: 50, left: 100 };
  const visWidth = 1000;
  const visHeight = 500;
  const totalWidth = visWidth + margin.left + margin.right;
  const totalHeight = visHeight + margin.top + margin.bottom;

  const svg = d3
    .select("#linechart-container")
    .append("svg")
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, totalWidth, totalHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  var x = d3
    .scaleTime()
    .domain(d3.extent(ridership, (d) => d.date))
    .range([0, visWidth]);

  const y = d3.scaleLinear().range([visHeight, 0]);

  // create and add axes
  const xAxis = d3.axisBottom(x);
  const xAxisGroup = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Date");

  const yAxis = d3.axisLeft(y).tickSizeOuter(0);
  const yAxisGroup = g.append("g");
  yAxisGroup
    .append("text")
    .attr("x", -visHeight / 2)
    .attr("y", -70)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Ridership Total");

  update(ridership);

  function update(data) {
    // get the number of rides for each month
    const dailyCounts = d3.rollup(
      data,
      (group) => group.reduce((sum, item) => sum + item.rides, 0),
      (d) =>
        d.date.getFullYear() + "-" + ("0" + (d.date.getMonth() + 1)).slice(-2)
    );

    // update y scale
    y.domain([0, d3.max(dailyCounts.values())]).nice();

    // update y axis
    const t = svg.transition().ease(d3.easeLinear).duration(200);

    yAxisGroup.transition(t).call(yAxis);

    const parseTime = d3.timeParse("%Y-%m");

    svg
      .append("path")
      .datum(dailyCounts)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(([date, count]) => x(parseTime(date)) + margin.left)
          .y(([date, count]) => y(count) + margin.top)
      );
  }
}

function drawInteractiveLineChart(ridership) {
  // set up
  const margin = { top: 10, right: 20, bottom: 50, left: 100 };
  const visWidth = 1000;
  const visHeight = 500;
  const totalWidth = visWidth + margin.left + margin.right;
  const totalHeight = visHeight + margin.top + margin.bottom;

  const svg = d3
    .select("#secondLine-container")
    .append("svg")
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .attr("viewBox", [0, 0, totalWidth, totalHeight])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  var x = d3
    .scaleTime()
    .domain(d3.extent(ridership, (d) => d.date))
    .range([0, visWidth]);

  const y = d3.scaleLinear().range([visHeight, 0]);

  // create and add axes
  const xAxis = d3.axisBottom(x);
  const xAxisGroup = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup
    .append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Date");

  const yAxis = d3.axisLeft(y).tickSizeOuter(0);
  const yAxisGroup = g.append("g");
  yAxisGroup
    .append("text")
    .attr("x", -visHeight / 2)
    .attr("y", -70)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Ridership Total");

  let line_select = document.getElementById("line-select");
  line_select.onchange = () => {
    let line = line_select.value;
    update(ridership, line);
  };

  update(ridership, "blue");

  function update(data, dropDownColor) {
    // get the number of rides for each month
    const dailyCounts = d3.rollup(
      data,
      (group) => group.reduce((sum, item) => sum + item[dropDownColor], 0),
      (d) =>
        d.date.getFullYear() + "-" + ("0" + (d.date.getMonth() + 1)).slice(-2)
    );

    // update y scale
    y.domain([0, d3.max(dailyCounts.values())]).nice();

    // update y axis
    const t = svg.transition().ease(d3.easeLinear).duration(200);

    yAxisGroup.transition(t).call(yAxis);

    const parseTime = d3.timeParse("%Y-%m");

    svg.selectAll('.line').remove();
    svg
      .append("path")
      .datum(dailyCounts)
      .attr("fill", "none")
      .attr("stroke", rgb_values[color_names.indexOf(dropDownColor)])
      .attr("stroke-width", 1.5)
      .attr('class', 'line')
      .attr(
        "d",
        d3
          .line()
          .x(([date, count]) => x(parseTime(date)) + margin.left)
          .y(([date, count]) => y(count) + margin.top)
      );
  }
}

function drawMap(ridership, lstations, raillines, zipcodes) {
  let interactiveMonth = document.getElementById("map-monthSlider").value;
  let interactiveYear = document.getElementById("map-yearSlider").value;

  var monthSlider = document.getElementById("map-monthSlider");
  var yearSlider = document.getElementById("map-yearSlider");

  var outputMonth = document.getElementById("map-month");
  var outputYear = document.getElementById("map-year");

  // draw map with initial values
  updateSliderNum();
  var svg = svgMap();
  d3.select("#map-container").append(() => svg);
  svg.updateRadius(interactiveMonth, interactiveYear);

  // monthSlider on change
  monthSlider.onchange = () => {
    updateSliderNum();
    svg.updateRadius(interactiveMonth, interactiveYear);
  };

  // yearSlider on change
  yearSlider.onchange = () => {
    updateSliderNum();
    svg.updateRadius(interactiveMonth, interactiveYear);
  };

  function updateSliderNum() {
    interactiveMonth = monthSlider.value;
    interactiveYear = yearSlider.value;

    outputMonth.innerHTML = parseInt(monthSlider.value) + 1;
    outputYear.innerHTML = yearSlider.value;
  }

  function svgMap() {
    const mapWidth = 500,
      mapHeight = 650;
    const projection = createProjection(
      mapWidth,
      mapHeight,
      lstations,
      zipcodes
    );

    // create SVG
    const svg = d3
      .create("svg")
      .attr("width", mapWidth)
      .attr("height", mapHeight)
      .attr("viewBox", [0, 0, mapWidth, mapHeight])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("id", "content");

    const g = svg.append("g").attr("class", "map");

    addBoundaries(svg, projection, zipcodes);
    addLines(svg, projection, raillines);

    // add points
    const dots = svg
      .select("#content g.map")
      .selectAll("circle")
      .data(lstations)
      .join("circle")
      .attr("cx", (d) => projection([d[1].longitude, d[1].latitude])[0])
      .attr("cy", (d) => projection([d[1].longitude, d[1].latitude])[1])
      .attr("fill", gray)
      .attr("fill-opacity", 0.6)
      .attr("stroke", "black")
      .attr("opacity", 0.4);

    function updateRadius(month, year) {
      // update sums
      var rides_sums = d3.rollup(
        ridership.filter(
          (item) =>
            item.date.getMonth() == month && item.date.getFullYear() == year
        ),
        (group) => group.reduce((sum, item) => sum + item.rides, 0),
        (d) => d.station_id
      );

      // update scale
      var radius_scale = d3
        .scaleSqrt()
        .domain([
          Math.min(...rides_sums.values()),
          Math.max(...rides_sums.values()),
        ])
        .nice()
        .range([1, 12]);

      // change radius of dots using new sums and scale
      dots.attr("r", (d) => radius_scale(rides_sums.get(d[1].station_id)));
    }

    return Object.assign(svg.node(), { updateRadius });
  }
}

function drawLinkedMap(ridership, lstations, raillines, zipcodes) {
  var svgMap = brushableMap();
  var svgBar = barChartStations();

  d3.select("#linkedmap-container").append(() => svgMap);
  d3.select("#linkedmap-container").append(() => svgBar);

  var interactiveYear = document.getElementById("inter-yearSlider").value;
  var yearSlider = document.getElementById("inter-yearSlider");
  var outputYear = document.getElementById("inter-year");

  // update the bar chart when the map selection changes
  d3.select(svgMap).on("input", () => {
    // map.value: list of station_ids that are selected
    if (svgMap.value == null) {
      svgBar.update(null);
    } else {
      svgBar.update(data.filter((d) => svgMap.value.includes(d.station_id)));
    }
  });

  updateSliderNum();
  var data = station_totals(interactiveYear);
  svgMap.update(data);

  // yearSlider on change
  yearSlider.onchange = () => {
    updateSliderNum();
    interactiveYear = yearSlider.value;
    data = station_totals(interactiveYear);
    svgMap.update(data);
  };

  function updateSliderNum() {
    outputYear.innerHTML = yearSlider.value;
  }

  function station_totals(year = null) {
    return Array.from(
      d3.rollup(
        !(year >= 2001 && year <= 2022)
          ? ridership
          : ridership.filter((d) => d.date.getFullYear() == year),
        (group) => group.reduce((sum, item) => sum + item.rides, 0),
        (d) => d.station_id
      )
    )
      .map(([i, s]) => ({ station_id: i, sum: s }))
      .sort((a, b) => a.station_id - b.station_id);
  }

  function brushableMap() {
    // variables
    const mapWidth = 500,
      mapHeight = 600;

    const projection = createProjection(
      mapWidth,
      mapHeight,
      lstations,
      zipcodes
    );

    const station_ids = Array.from(lstations.values()).map((d) => ({
      station_id: d.station_id,
    }));

    // create SVG
    const svg = d3
      .create("svg")
      .attr("width", mapWidth)
      .attr("height", mapHeight)
      .attr("viewBox", [0, 0, mapWidth, mapHeight])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("id", "content");

    const g = svg.append("g").attr("class", "map");
    // .attr('transform', `translate(${margin.left}, ${margin.top})`);

    addBoundaries(svg, projection, zipcodes);
    addLines(svg, projection, raillines);

    function update(data) {
      // update scale
      const radius_scale = d3
        .scaleSqrt()
        .domain([0, d3.max(data, (d) => d.sum)])
        .nice()
        .range([1, 12]);

      // draw circles
      svg
        .select("#content g.map")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d) => getCoords(d.station_id)[0])
        .attr("cy", (d) => getCoords(d.station_id)[1])
        .attr("r", (d) => radius_scale(d.sum))
        .attr("fill", gray)
        .attr("fill-opacity", 0.6)
        .attr("stroke", "black")
        .attr("opacity", 0.4);
    }

    // brush
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [mapWidth, mapHeight],
      ])
      .on("brush", onBrush)
      .on("end", endBrush);

    g.append("g").attr("id", "brush_g").call(brush);

    function onBrush(event) {
      const [[x1, y1], [x2, y2]] = event.selection;

      // return true if the dot is in the brush box, false otherwise
      function isBrushed(d) {
        const [cx, cy] = getCoords(d.station_id);
        return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
      }

      // style the dots
      svg
        .select("#content g.map")
        .selectAll("circle")
        .attr("fill-opacity", (d) => (isBrushed(d) ? 0.6 : 0.1))
        .attr("opacity", (d) => (isBrushed(d) ? 0.4 : 0.1));

      svg
        .property(
          "value",
          station_ids.filter(isBrushed).map((d) => d.station_id)
        )
        .dispatch("input");
    }

    function endBrush(event) {
      if (event.selection == null) {
        svg
          .select("#content g.map")
          .selectAll("circle")
          .attr("fill", gray)
          .attr("fill-opacity", 0.6)
          .attr("stroke", "black")
          .attr("opacity", 0.4);

        // send data to bar chart
        svg.property("value", null).dispatch("input");
      }
    }

    return Object.assign(svg.node(), { update });

    function getCoords(id) {
      return projection([
        lstations.get(id).longitude,
        lstations.get(id).latitude,
      ]);
    }
  }

  function barChartStations() {
    // set up
    const visWidth = 600,
      visHeight = 500;
    const margin = { top: 0, right: 30, bottom: 50, left: 150 };
    const totalWidth = visWidth + margin.left + margin.right;
    const totalHeight = visHeight + margin.top + margin.bottom;

    const svg = d3
      .create("svg")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .attr("viewBox", [0, 0, totalWidth, totalHeight])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create scales
    const x = d3.scaleLinear().range([0, visWidth]);

    var station_names = Array.from(lstations.values()).map(
      (item) => item.station_name
    );
    const y = d3
      .scaleBand()
      .domain(station_names)
      .range([0, visHeight])
      .padding(0.2);

    // create and add axes
    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0, ${visHeight})`);
    xAxisGroup
      .append("text")
      .attr("x", visWidth / 2)
      .attr("y", 40)
      .attr("fill", gray)
      .attr("text-anchor", "middle")
      .text("Total Ridership");

    const yAxis = d3.axisLeft(y);
    const yAxisGroup = g
      .append("g")
      // remove baseline from the axis
      .call((g) => g.select(".domain").remove());

    let barsGroup = g.append("g");

    function update(data) {
      if (data == null) {
        barsGroup.selectAll("rect").remove();

        // clear x
        x.domain([]);
        xAxisGroup.call(xAxis);

        // clear y
        y.domain([]);
        yAxisGroup.call(yAxis).call((g) => g.select(".domain").remove());

        return;
      }

      // update x
      x.domain([0, d3.max(data, (d) => d.sum)]).nice();
      const t = svg.transition().ease(d3.easeLinear).duration(200);
      xAxisGroup.transition(t).call(xAxis);

      // update y
      y.domain(data.map((d) => lstations.get(d.station_id).station_name));
      yAxisGroup.call(yAxis).call((g) => g.select(".domain").remove());

      // draw bars
      barsGroup
        .selectAll("rect")
        .data(data, (d) => lstations.get(d.station_id).station_name)
        .join("rect")
        .attr("fill", "#565a5c")
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("y", (d) => y(lstations.get(d.station_id).station_name))
        .transition(t)
        .attr("width", (d) => x(d.sum));
    }

    return Object.assign(svg.node(), { update });
  }
}

function createProjection(mapWidth, mapHeight, lstations, zipcodes) {
  // center points: mean([min, max]) of possible longitude/latitude values
  const arr_lstations = Array.from(lstations.values());
  const flat_zipcodes = zipcodes.features
    .map((item) => item.geometry.coordinates)
    .flat(3);

  var centerLon = d3.mean(
    d3.extent(
      d3.merge([
        arr_lstations.map((item) => item.longitude),
        flat_zipcodes.map((item) => item[0]),
      ])
    )
  );

  var centerLat = d3.mean(
    d3.extent(
      d3.merge([
        arr_lstations.map((item) => item.latitude),
        flat_zipcodes.map((item) => item[1]),
      ])
    )
  );

  return d3
    .geoMercator()
    .scale(mapWidth / 0.0028 / Math.PI)
    .rotate([0, 0])
    .center([centerLon, centerLat])
    .translate([mapWidth / 2, mapHeight / 2]);
}

function addBoundaries(svg, projection, zipcodes) {
  const geoGenerator = d3.geoPath().projection(projection);

  var g = svg.select("#content g.map").append("g").attr("id", "zipcodes");

  let u = g.selectAll("path").data(zipcodes.features);

  u.enter()
    .append("path")
    .attr("d", geoGenerator)
    .attr("fill", "#fff")
    .attr("stroke", "#555")
    .attr("class", "zipcode");
}

function addLines(svg, projection, raillines) {
  const geoGenerator = d3.geoPath().projection(projection);

  var legend_rgb = {
    RD: "#C60C30",
    BL: "#00A1DE",
    GR: "#009B3A",
    BR: "#62361B",
    PR: "#522398",
    YL: "#F9E300",
    PK: "#E27EA6",
    OR: "#F9461C",
    ML: "#000000",
  };

  let g = svg.select("#content g.map").append("g").attr("id", "raillines");

  let u = g.selectAll("path").data(raillines.features);

  u.enter()
    .append("path")
    .attr("d", geoGenerator)
    .attr("stroke", (d) => legend_rgb[d.properties.LEGEND])
    .attr("fill", "none")
    .attr("stroke-width", "3px")
    .attr("class", "railline");
}

function drawLinkedChart(weather, ridership, lstations) {
  const lineCounts = d3.rollup(
    ridership,
    (v) => ({
      blue: d3.sum(v, (d) => d.blue),
      green: d3.sum(v, (d) => d.green),
      yellow: d3.sum(v, (d) => d.yellow),
      red: d3.sum(v, (d) => d.red),
      orange: d3.sum(v, (d) => d.orange),
      brown: d3.sum(v, (d) => d.brown),
      purple: d3.sum(v, (d) => d.purple),
      pink: d3.sum(v, (d) => d.pink),
    }),
    (d) => d.date
  );
  console.log(lineCounts);

  var svgWeather = brushableLineChart();
  var svgRidership = multipleLineChart();

  d3.select("#linkedchart-container").append(() => svgWeather);
  d3.select("#linkedchart-container").append(() => svgRidership);

  // update the line chart when the weather selection changes
  d3.select(svgWeather).on("input", () => {
    console.log(svgWeather.value);

    // map.value: list of station_ids that are selected
    if (svgWeather.value == null) {
      svgRidership.update(null);
    } else {
      svgRidership.update(
        ridership.filter((d) => {
          return d.date > svgWeather.value[0] && d.date < svgWeather.value[1];
        })
      );
    }
  });

  function brushableLineChart() {
    // setup
    const margin = { top: 10, right: 20, bottom: 50, left: 100 };
    const visWidth = 1000;
    const visHeight = 100;
    const totalWidth = visWidth + margin.left + margin.right;
    const totalHeight = visHeight + margin.top + margin.bottom;

    // svg
    const svg = d3
      .create("svg")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .attr("viewBox", [0, 0, totalWidth, totalHeight])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(weather, (d) => d.date))
      .range([0, visWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(weather, (d) => d.temp)])
      .range([visHeight, 0]);

    // create and add axes
    const xAxis = d3.axisBottom(x);
    const xAxisGroup = g
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${visHeight})`);
    xAxisGroup
      .append("text")
      .attr("x", visWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Date");

    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    const yAxisGroup = g.append("g").call(yAxis);
    yAxisGroup
      .append("text")
      .attr("x", -visHeight / 2)
      .attr("y", -70)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Temperature");

    svg
      .append("path")
      .datum(weather)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.date) + margin.left)
          .y((d) => y(d.temp) + margin.top)
      );

    // brush
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [visWidth, visHeight],
      ])
      .on("end", endBrush);

    svg
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, [500, 525])

    // removes handle to resize the brush
    d3.selectAll('.brush>.handle').remove();
    // removes crosshair cursor
    d3.selectAll('.brush>.overlay').remove();

    function endBrush(event) {
      if (event.selection == null) {
        // send data to bar chart
        svg.property("value", null).dispatch("input");
        return;
      }

      // return true if the dot is in the brush box, false otherwise
      function isBrushed(d) {
        const cx = x(d.date);
        const cy = y(d.temp);
        return cx >= x1 && cx <= x2;
      }

      const [x1, x2] = event.selection;
      const brushed = weather.filter(isBrushed);

      if (brushed.length) {
        svg
          .property(
            "value",
            d3.extent(brushed, (d) => d.date)
          )
          .dispatch("input");
      }
    }

    return svg.node();
  }

  function multipleLineChart() {
    // set up
    const margin = { top: 10, right: 20, bottom: 50, left: 100 };
    const visWidth = 1000;
    const visHeight = 300;
    const totalWidth = visWidth + margin.left + margin.right;
    const totalHeight = visHeight + margin.top + margin.bottom;

    const svg = d3
      .create("svg")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .attr("viewBox", [0, 0, totalWidth, totalHeight])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create scales
    var x = d3
      .scaleTime()
      .domain(d3.extent(ridership, (d) => d.date))
      .range([0, visWidth]);

    const y = d3.scaleLinear().range([visHeight, 0]);

    // create and add axes
    const xAxis = d3.axisBottom(x);
    const xAxisGroup = g
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${visHeight})`);
    xAxisGroup
      .append("text")
      .attr("x", visWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Date");

    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    const yAxisGroup = g.append("g");
    yAxisGroup
      .append("text")
      .attr("x", -visHeight / 2)
      .attr("y", -70)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Ridership Total");

    update(null);

    function update(data) {
      var updateY = false;
      if (data == null) {
        data = ridership;
        updateY = true;
      }

      // get the number of rides for each month
      const dailyCounts = d3.rollup(
        data,
        (group) => group.reduce((sum, item) => sum + item.rides, 0),
        (d) =>
          d.date.getFullYear() + "-" + ("0" + (d.date.getMonth() + 1)).slice(-2)
      );

      const parseTime = d3.timeParse("%Y-%m");

      // update x scale
      x.domain(d3.extent(dailyCounts.keys(), (d) => parseTime(d))).nice();

      // update x axis
      const t = svg.transition().ease(d3.easeLinear).duration(200);

      xAxisGroup.transition(t).call(xAxis);

      if (updateY) {
        // update y scale
        y.domain([0, d3.max(dailyCounts.values())]).nice();

        // update y axis
        yAxisGroup.transition(t).call(yAxis);
      }

      svg.selectAll(".line").remove();

      svg
        .append("path")
        .datum(dailyCounts)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr(
          "d",
          d3
            .line()
            .x(([date, count]) => x(parseTime(date)) + margin.left)
            .y(([date, count]) => y(count) + margin.top)
        );
    }
    return Object.assign(svg.node(), { update });
  }
}
