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

// main();

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
    return d3.csv(filepath);
  } else if (type == "json") {
    return d3.json(filepath);
  }
}

async function main() {
  console.log("async test");
  const lstations = await loadLstations();
  const ridership = await loadRidership(lstations);
  console.log(ridership);
  console.log(lstations);
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
