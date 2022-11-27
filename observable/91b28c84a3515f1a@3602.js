import define1 from "./8d5ef3030dfd3bad@478.js";

function _1(md){return(
md`# CTA 'L' Ridership Data

## Adam Beigel and Logan Stein

CS 424: Project 2

4 November 2022`
)}

function _2(htl){return(
htl.html`<hr/>`
)}

function _3(md){return(
md`## Average Daily Ridership

Histogram frequency represents the number of stations with the corresponding average daily ridership for the entire span of the data.`
)}

function _4(Histogram,d3,ridership,width,rgb_values){return(
Histogram(
  d3.rollup(
    ridership.filter(d => d.date.getFullYear() == 2019),
    group => group.reduce((sum, item) => sum + item.rides, 0),
    d => d.station_id
  ),
  {
    value: d => d[1] / 365,
    width,
    height: 300,
    color: rgb_values[3]
  }
)
)}

function _5(md){return(
md`Most stations have an average daily ridership between 500 and 3500.`
)}

function _6(md){return(
md`## Ridership by Year

We see the steep drop in ridership at the beginning of 2020 corresponding with the start of the COVID-19 pandemic.`
)}

function _7(lineChart,ridership)
{
  var chart = lineChart();
  chart.update(ridership);
  return chart;
}


function _lineChart(d3,ridership){return(
function lineChart() {
  // set up
  const margin = {top: 10, right: 20, bottom: 50, left: 100};
  const visWidth = 1000;
  const visHeight = 400;

  const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${visWidth + margin.left + margin.right} ${visHeight + margin.top + margin.bottom}`);
  // .attr('width', visWidth + margin.left + margin.right)
  // .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
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

  return Object.assign(svg.node(), { update });
}
)}

function _9(md){return(
md`## Ridership by Line`
)}

function _10(md){return(
md`Month with the coldest average temperature:`
)}

function _11(monthly_avg_temp){return(
monthly_avg_temp.reduce( (prev, cur) => {
  return (cur.avg_temp < prev.avg_temp && cur.avg_temp != null) ? cur : prev;
})
)}

function _12(barChartLines)
{
  let interactiveMonth = document.getElementById("monthSlider").value
  let interactiveYear = document.getElementById("yearSlider").value

  var monthSlider = document.getElementById("monthSlider")
  var yearSlider = document.getElementById("yearSlider")

  var outputMonth = document.getElementById("month")
  var outputYear = document.getElementById("year")

  // show initial values
  outputMonth.innerHTML = parseInt(monthSlider.value) + 1
  interactiveMonth = monthSlider.value
  outputYear.innerHTML = yearSlider.value
  interactiveYear = yearSlider.value

  const bar = barChartLines();
  bar.update(interactiveMonth, interactiveYear)

  monthSlider.onchange = () => {
    outputMonth.innerHTML = parseInt(monthSlider.value) + 1
    interactiveMonth = monthSlider.value
    bar.update(interactiveMonth, interactiveYear);
  }

  yearSlider.onchange = () => {
    outputYear.innerHTML = yearSlider.value
    interactiveYear = yearSlider.value
    bar.update(interactiveMonth, interactiveYear);
  }

  return bar;
}


function _13(htl){return(
htl.html`<div id="slider-container">
  Year: <span id="year"></span>
  <input id="yearSlider" type="range" min=2001 max=2022 step=1 value=2015 />
  Month: <span id="month"></span>
  <input id="monthSlider" type="range" min=0 max=11 step=1 value=1 />
  <!--   <p id="selectorYear"></p> -->
</div>`
)}

function _barChartLines(d3,color_names,rgb_values,ridership){return(
function barChartLines() {
  // set up
  const visWidth = 800;
  const visHeight = 400;
  const margin = {top: 10, right: 20, bottom: 50, left: 50};

  const svg = d3.create('svg')
    .attr('width', visWidth + margin.left + margin.right)
    .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  const x = d3.scaleLinear()
    .range([0, visWidth]);

  let lineColor = d3.scaleOrdinal().domain(color_names).range(rgb_values)

  const y = d3.scaleBand()
    .domain(color_names)
    .range([0, visHeight])
    .padding(0.2);

  // create and add axes
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  const xAxisGroup = g.append("g")
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Total Ridership");

  const yAxis = d3.axisLeft(y);
  const yAxisGroup = g.append("g")
    .call(yAxis)
    // remove baseline from the axis
    .call(g => g.select(".domain").remove());

  let barsGroup = g.append("g");

  function update(month, year) {
    const data = ridership.filter(item => item.date.getMonth() == month && item.date.getFullYear() == year); 
    
    // update sums
    var lineCounts = new Map();
    for (let i = 0; i < color_names.length; i++) {
      lineCounts.set( color_names[i], d3.sum(data, d => d[color_names[i]]) )
    }

    // update x scale
    x.domain([0, d3.max(lineCounts.values())]).nice()

    // update x axis
    const t = svg.transition()
      .ease(d3.easeLinear)
      .duration(200);

    xAxisGroup
      .transition(t)
      .call(xAxis);

    // draw bars
    barsGroup.selectAll("rect")
      .data(lineCounts, ([line, count]) => line)
      .join("rect")
      .attr("fill", ([line, count]) => lineColor(line))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", ([line, count]) => y(line))
      .transition(t)
      .attr("width", ([line, count]) => x(count))    
  }

  return Object.assign(svg.node(), { update });;
}
)}

function _15(md){return(
md`## Mapping

Area of the circle represents the station's proportion of total ridership for the selected year and month.`
)}

function _16(drawMap)
{
  let interactiveMonth = document.getElementById("map-monthSlider").value
  let interactiveYear = document.getElementById("map-yearSlider").value

  var monthSlider = document.getElementById("map-monthSlider")
  var yearSlider = document.getElementById("map-yearSlider")

  var outputMonth = document.getElementById("map-month")
  var outputYear = document.getElementById("map-year")

  // draw map with initial values
  updateSliderNum();
  const chicago_map = drawMap();
  chicago_map.updateRadius(interactiveMonth, interactiveYear);

  // monthSlider on change
  monthSlider.onchange = () => {
    updateSliderNum();
    chicago_map.updateRadius(interactiveMonth, interactiveYear);
  }

  // yearSlider on change
  yearSlider.onchange = () => {
    updateSliderNum();
    chicago_map.updateRadius(interactiveMonth, interactiveYear);
  }

  function updateSliderNum() {
    interactiveMonth = monthSlider.value
    interactiveYear = yearSlider.value
    
    outputMonth.innerHTML = parseInt(monthSlider.value) + 1
    outputYear.innerHTML = yearSlider.value
  }

  return chicago_map;
}


function _17(htl){return(
htl.html`<div id="map-slider-container">
  Year: <span id="map-year"></span>
  <input id="map-yearSlider" type="range" min=2001 max=2022 step=1 value=2015 />
  Month: <span id="map-month"></span>
  <input id="map-monthSlider" type="range" min=0 max=11 step=1 value=1 />
  <!--   <p id="map-selectorYear"></p> -->
</div>`
)}

function _drawMap(d3,mapWidth,mapHeight,addBoundaries,addLines,lstations,projection,gray,ridership){return(
function drawMap() {  
  // variables
  const margin = ({top: 0, right: 0, bottom: 0, left: 0});
  
  // create SVG
  const svg = d3.create("svg")
    .attr('width', mapWidth + margin.left + margin.right)
    .attr('height', mapHeight + margin.top + margin.bottom)
    .attr('id', 'content');

  const g = svg.append('g')
    .attr('class', 'map')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  addBoundaries(svg);
  addLines(svg);

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
)}

function _19(md){return(
md`## Interactive Linked View: Map and Bar Chart

As above, area of the circle represents the station's proportion of total ridership for the selected year and month.

Drag a brush onto the map to see the selected stations' ridership in the adjacent bar chart.`
)}

function _20(brushableMap,barChartStations,d3,station_totals,html)
{
  const map = brushableMap();
  const bar = barChartStations();

  let interactiveYear = document.getElementById("inter-yearSlider").value
  var yearSlider = document.getElementById("inter-yearSlider")
  var outputYear = document.getElementById("inter-year")

  // update the bar chart when the map selection changes
  d3.select(map).on('input', () => {
    // map.value: list of station_ids that are selected
    if (map.value == null) {
      bar.update(null);
    } else {
      bar.update( data.filter(d => map.value.includes(d.station_id)) );
    }
  });

  updateSliderNum();
  var data = station_totals(interactiveYear);
  map.update(data);

  // yearSlider on change
  yearSlider.onchange = () => {
    updateSliderNum()
    interactiveYear = yearSlider.value
    data = station_totals(interactiveYear);
    map.update(data);    
  }

  function updateSliderNum() {
    outputYear.innerHTML = yearSlider.value
  }

  // use HTML to place the two charts next to each other
  return html`<div style="display: flex">${map}${bar}</div>`;
}


function _21(htl){return(
htl.html`<div id="inter-slider-container">
  Year: <span id="inter-year"></span>
  <input id="inter-yearSlider" type="range" min=2001 max=2022 step=1 value=2021 />
<!--   <p id="inter-selectorYear"></p> -->
</div>`
)}

function _brushableMap(lstations,d3,mapWidth,mapHeight,addBoundaries,addLines,getCoords,gray){return(
function brushableMap() {  
  // variables
  const margin = ({top: 0, right: 0, bottom: 0, left: -40});

  const station_ids = Array.from(lstations.values()).map( d => ({station_id: d.station_id}) )

  // create SVG
  const svg = d3.create("svg")
    .attr('width', mapWidth + margin.left + margin.right)
    .attr('height', mapHeight + margin.top + margin.bottom)
    .attr('id', 'content');

  const g = svg.append('g')
    .attr('class', 'map')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  addBoundaries(svg);
  addLines(svg);

  function update(data) {
    // update scale
    const radius_scale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.sum)]).nice()
      .range([1, 12]);

    // draw circles
    svg.select('#content g.map')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => getCoords(d.station_id)[0])
      .attr('cy', d => getCoords(d.station_id)[1])
      .attr('r', d => radius_scale(d.sum))
      .attr('fill', gray)
      .attr('fill-opacity', 0.6)
      .attr('stroke', 'black')
      .attr('opacity', 0.4);
  }

  // brush
  const brush = d3.brush()
    .extent([[0, 0], [mapWidth, mapHeight]])
    .on("brush", onBrush)
    .on("end", endBrush);

  g.append('g')
    .attr('id', 'brush_g')
    .call(brush);

  function onBrush(event) {
    const [[x1, y1], [x2, y2]] = event.selection;

    // return true if the dot is in the brush box, false otherwise
    function isBrushed(d) {
      const [cx, cy] = getCoords(d.station_id);
      return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
    }

    // style the dots
    svg.select('#content g.map')
      .selectAll('circle')
      .attr('fill-opacity', d => isBrushed(d) ? 0.6 : 0.1)
      .attr('opacity', d => isBrushed(d) ? 0.4 : 0.1);

    svg.property('value', station_ids.filter(isBrushed).map(d => d.station_id)).dispatch('input');
  }

  function endBrush(event) {
    if (event.selection == null) {
      svg.select('#content g.map')
        .selectAll('circle')
        .attr('fill', gray)
        .attr('fill-opacity', 0.6)
        .attr('stroke', 'black')
        .attr('opacity', 0.4);

      // send data to bar chart
      svg.property('value', null).dispatch('input');
    }
  }

  return Object.assign(svg.node(), { update });
}
)}

function _barChartStations(d3,lstations,gray){return(
function barChartStations() {
  // set up
  const visWidth = 500;
  const visHeight = 450;
  const margin = {top: 100, right: 0, bottom: 50, left: 150};

  const svg = d3.create('svg')
    .attr('width', visWidth + margin.left + margin.right)
    .attr('height', visHeight + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales
  const x = d3.scaleLinear()
    .range([0, visWidth]);

  var station_names = Array.from(lstations.values()).map( item => item.station_name )
  const y = d3.scaleBand()
    .domain(station_names)
    .range([0, visHeight])
    .padding(0.2);

  // create and add axes
  const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  const xAxisGroup = g.append("g")
    .attr("transform", `translate(0, ${visHeight})`);
  xAxisGroup.append("text")
    .attr("x", visWidth / 2)
    .attr("y", 40)
    .attr("fill", gray)
    .attr("text-anchor", "middle")
    .text("Total Ridership");

  const yAxis = d3.axisLeft(y);
  const yAxisGroup = g.append("g")
    // remove baseline from the axis
    .call(g => g.select(".domain").remove())

  let barsGroup = g.append("g");

  function update(data) {
    if (data == null) {
      barsGroup.selectAll('rect').remove();

      // clear x
    x.domain([]);
      xAxisGroup.call(xAxis);
      
      // clear y
      y.domain([]);
      yAxisGroup.call(yAxis)
        .call(g => g.select(".domain").remove());
      
      return;
    }

    // update x 
    x.domain([0, d3.max(data, d => d.sum)]).nice()
    const t = svg.transition()
      .ease(d3.easeLinear)
      .duration(200);
    xAxisGroup
      .transition(t)
      .call(xAxis);

    // update y
    y.domain(data.map(d => lstations.get(d.station_id).station_name))
    yAxisGroup.call(yAxis)
      .call(g => g.select(".domain").remove());

    // draw bars
    barsGroup.selectAll("rect")
      .data(data, d => lstations.get(d.station_id).station_name)
      .join("rect")
      .attr("fill", "#565a5c")
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", d => y(lstations.get(d.station_id).station_name))
      .transition(t)
      .attr("width", d => x(d.sum))    
  }

  return Object.assign(svg.node(), { update });
}
)}

function _24(htl){return(
htl.html`<hr/>`
)}

function _25(md){return(
md`## Load Data`
)}

function _26(md){return(
md`### Ridership`
)}

async function _ridership(FileAttachment,d3,lstations,numLines,color_names)
{
  const raw_ridership = await FileAttachment("ridership.csv").csv({typed: true});
  
  const parseTime = d3.timeParse("%m/%d/%Y");
  
  return raw_ridership.map( item => {
      const lstation = lstations.get(item.station_id)
      const num = numLines(item)

      var rides_ratio = {}
      for (const i in color_names) {
        rides_ratio[color_names[i]] = lstation[color_names[i]] ? Math.round(item.rides / num) : null;
      }

      return {
        ...item,
        date: parseTime(item.date),
        ...rides_ratio
      }
    })
    .sort( (a,b) => {return b.date - a.date} )
}


function _28(md){return(
md`### 'L' Stations`
)}

async function _lstations(FileAttachment)
{
  const raw_lstations = await FileAttachment("cta-L-stations.csv").csv({typed: true})
  const arr = raw_lstations.map( ({geometry, ...item}) => ({
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


function _30(md){return(
md`### Weather`
)}

function _monthly_avg_temp(FileAttachment){return(
FileAttachment("monthly-weather-unpivot@1.csv").csv({typed: true})
)}

function _32(md){return(
md`### Zip Code Boundaries`
)}

function _zipcodes(){return(
fetch("https://data.cityofchicago.org/api/geospatial/gdcf-axmw?method=export&format=GeoJSON").then((response) => response.json())
)}

function _34(md){return(
md`### Rail Lines`
)}

function _rail_lines(FileAttachment){return(
FileAttachment("rail_lines.geojson").json()
)}

function _36(htl){return(
htl.html`<hr/>`
)}

function _37(md){return(
md`## Utility`
)}

function _d3(require){return(
require('d3')
)}

function _numLines(lstations){return(
function numLines(item) {
  return Object.values(lstations.get(item.station_id)).slice(3, 11).filter(Boolean).length
}
)}

function _color_names(){return(
["blue", "green", "yellow", "red", "orange", "brown", "purple", "pink"]
)}

function _rgb_values(){return(
["#00A1DE", "#009B3A", "#F9E300", "#C60C30", "#F9461C", "#62361B", "#522398", "#E27EA6"]
)}

function _gray(){return(
"#565a5c"
)}

function _getCoords(projection,lstations){return(
function getCoords(id) {
  return projection(
    [lstations.get(id).longitude, lstations.get(id).latitude]
  );
}
)}

function _station_totals(d3,ridership){return(
function station_totals(year = null) {
  return Array.from(
    d3.rollup(
      !(year >= 2001 && year <= 2022) ? ridership : ridership.filter(d => d.date.getFullYear() == year),
      group => group.reduce((sum, item) => sum + item.rides, 0),
      d => d.station_id
    )
  ).map(([i, s]) => ({station_id: i, sum: s}))
    .sort((a, b) => a.station_id - b.station_id)
}
)}

function _46(md){return(
md`### Map`
)}

function _mapWidth(){return(
500
)}

function _mapHeight(){return(
600
)}

function _addBoundaries(zipcodes,geoGenerator){return(
function addBoundaries(svg) {
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
)}

function _addLines(rail_lines,geoGenerator){return(
function addLines (svg) {
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
    .data(rail_lines.features);

  u.enter()
    .append('path')
    .attr('d', geoGenerator)
    .attr('stroke', (d) => legend_rgb[d.properties.LEGEND])
    .attr('fill', 'none')
    .attr('stroke-width', '3px')
    .attr('class', 'railline');
}
)}

function _projection(lstations,zipcodes,d3,mapWidth,mapHeight)
{
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


function _geoGenerator(d3,projection){return(
d3.geoPath()
  .projection(projection)
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["cta-L-stations.csv", {url: new URL("./files/9f5d9c73bfeefe9107db132084eb54354313fec495bcf2eaff7ad3b57cceea2ea6458955fc53263ee0f2958a4c11345efac1d9837f0888afe927d68448b849e5.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["rail_lines.geojson", {url: new URL("./files/2c4dd8c299b7cbcf0b1d25758675758b3b2ec56c9ad32380a0a0a8e06aa0944d5da6a71b5b96f324dc8be6b03f91be65fa59f3e77ac5c0ed496f810cc03d9cf4.geojson", import.meta.url), mimeType: "application/geo+json", toString}],
    ["ridership.csv", {url: new URL("./files/d4898e2f2be37a7f4fc070fb6fe950aa68435a24c088d88d7a57db2d3c3eeed784505ae5015f9f1973aedfa3e43f2e978956dcb5e422f89a98663ae8c77c3490.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["monthly-weather-unpivot@1.csv", {url: new URL("./files/35a80d1d7bac634b6756c428241897c35e6b110c64e04095b6af54723aec688494e351dad7df81cf8e68c266b568eece354500df6bc730440725d9c1fd791b94.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["htl"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["Histogram","d3","ridership","width","rgb_values"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["lineChart","ridership"], _7);
  main.variable(observer("lineChart")).define("lineChart", ["d3","ridership"], _lineChart);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer()).define(["monthly_avg_temp"], _11);
  main.variable(observer()).define(["barChartLines"], _12);
  main.variable(observer()).define(["htl"], _13);
  main.variable(observer("barChartLines")).define("barChartLines", ["d3","color_names","rgb_values","ridership"], _barChartLines);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer()).define(["drawMap"], _16);
  main.variable(observer()).define(["htl"], _17);
  main.variable(observer("drawMap")).define("drawMap", ["d3","mapWidth","mapHeight","addBoundaries","addLines","lstations","projection","gray","ridership"], _drawMap);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer()).define(["brushableMap","barChartStations","d3","station_totals","html"], _20);
  main.variable(observer()).define(["htl"], _21);
  main.variable(observer("brushableMap")).define("brushableMap", ["lstations","d3","mapWidth","mapHeight","addBoundaries","addLines","getCoords","gray"], _brushableMap);
  main.variable(observer("barChartStations")).define("barChartStations", ["d3","lstations","gray"], _barChartStations);
  main.variable(observer()).define(["htl"], _24);
  main.variable(observer()).define(["md"], _25);
  main.variable(observer()).define(["md"], _26);
  main.variable(observer("ridership")).define("ridership", ["FileAttachment","d3","lstations","numLines","color_names"], _ridership);
  main.variable(observer()).define(["md"], _28);
  main.variable(observer("lstations")).define("lstations", ["FileAttachment"], _lstations);
  main.variable(observer()).define(["md"], _30);
  main.variable(observer("monthly_avg_temp")).define("monthly_avg_temp", ["FileAttachment"], _monthly_avg_temp);
  main.variable(observer()).define(["md"], _32);
  main.variable(observer("zipcodes")).define("zipcodes", _zipcodes);
  main.variable(observer()).define(["md"], _34);
  main.variable(observer("rail_lines")).define("rail_lines", ["FileAttachment"], _rail_lines);
  main.variable(observer()).define(["htl"], _36);
  main.variable(observer()).define(["md"], _37);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  const child1 = runtime.module(define1);
  main.import("Histogram", child1);
  main.variable(observer("numLines")).define("numLines", ["lstations"], _numLines);
  main.variable(observer("color_names")).define("color_names", _color_names);
  main.variable(observer("rgb_values")).define("rgb_values", _rgb_values);
  main.variable(observer("gray")).define("gray", _gray);
  main.variable(observer("getCoords")).define("getCoords", ["projection","lstations"], _getCoords);
  main.variable(observer("station_totals")).define("station_totals", ["d3","ridership"], _station_totals);
  main.variable(observer()).define(["md"], _46);
  main.variable(observer("mapWidth")).define("mapWidth", _mapWidth);
  main.variable(observer("mapHeight")).define("mapHeight", _mapHeight);
  main.variable(observer("addBoundaries")).define("addBoundaries", ["zipcodes","geoGenerator"], _addBoundaries);
  main.variable(observer("addLines")).define("addLines", ["rail_lines","geoGenerator"], _addLines);
  main.variable(observer("projection")).define("projection", ["lstations","zipcodes","d3","mapWidth","mapHeight"], _projection);
  main.variable(observer("geoGenerator")).define("geoGenerator", ["d3","projection"], _geoGenerator);
  return main;
}
