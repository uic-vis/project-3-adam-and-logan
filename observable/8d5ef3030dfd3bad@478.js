// https://observablehq.com/@d3/histogram@478
import define1 from "./7a9e12f9fb3d8e06@459.js";

function _1(md){return(
md`# Histogram

A histogram visualizes a one-dimensional distribution by grouping continuous values into discrete bins. This example shows the unemployment rate of U.S. counties as of August 2016. Data: [Bureau of Labor Statistics](http://www.bls.gov/lau/#tables)`
)}

function _chart(Histogram,unemployment,width){return(
Histogram(unemployment, {
  value: d => d.rate,
  label: "Unemployment rate (%) →",
  width,
  height: 500,
  color: "steelblue"
})
)}

function _unemployment(FileAttachment){return(
FileAttachment("unemployment-x.csv").csv({typed: true})
)}

function _4(howto){return(
howto("Histogram")
)}

function _5(altplot){return(
altplot(`Plot.rectY(unemployment, Plot.binX({y: "count"}, {x: "rate"})).plot()`)
)}

function _Histogram(d3){return(
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
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["unemployment-x.csv", {url: new URL("./files/8a6057f29caa4e010854bfc31984511e074ff9042ec2a99f30924984821414fbaeb75e59654e9303db359dfa0c1052534691dac86017c4c2f992d23b874f9b6e.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["Histogram","unemployment","width"], _chart);
  main.variable(observer("unemployment")).define("unemployment", ["FileAttachment"], _unemployment);
  main.variable(observer()).define(["howto"], _4);
  main.variable(observer()).define(["altplot"], _5);
  main.variable(observer("Histogram")).define("Histogram", ["d3"], _Histogram);
  const child1 = runtime.module(define1);
  main.import("howto", child1);
  main.import("altplot", child1);
  return main;
}
