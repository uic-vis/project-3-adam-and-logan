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

function parseJSONToCSVStr(jsonData) {
  if (jsonData.length == 0) {
    return '';
  }

  let keys = Object.keys(jsonData[0]);

  let columnDelimiter = ',';
  let lineDelimiter = '\n';

  let csvColumnHeader = keys.join(columnDelimiter);
  let csvStr = csvColumnHeader + lineDelimiter;

  jsonData.forEach(item => {
    keys.forEach((key, index) => {
      if ((index > 0) && (index < keys.length)) {
        csvStr += columnDelimiter;
      }
      csvStr += item[key];
    });
    csvStr += lineDelimiter;
  });

  return encodeURIComponent(csvStr);
}

function exportToCsvFile(jsonData) {
  let csvStr = parseJSONToCSVStr(jsonData);
  let dataUri = 'data:text/csv;charset=utf-8,' + csvStr;

  let exportFileDefaultName = 'data.csv';

  let linkElement = document.createElement('a');
  linkElement.href = dataUri;
  linkElement.download = exportFileDefaultName;
  linkElement.click();
}

main();

async function main() {
  console.log('loading data...');
  const lstations = await loadLstations();
  const ridership = await loadRidership(lstations);
  console.log('done!');

  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() < 2005));
  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() >= 2005 && d.date.getFullYear() < 2009));
  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() >= 2009 && d.date.getFullYear() < 2013));
  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() >= 2013 && d.date.getFullYear() < 2017));
  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() >= 2017 && d.date.getFullYear() < 2021));
  exportToCsvFile(d3.filter(ridership, d => d.date.getFullYear() >= 2021));
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