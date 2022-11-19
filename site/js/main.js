console.log('Console message.');

fetchZipcodes().then(drawMap);

async function fetchZipcodes() {
	const url = "https://data.cityofchicago.org/api/geospatial/gdcf-axmw?method=export&format=GeoJSON";
	const data = await fetch(url)
		.then(res => res.json())
		.catch(err => { throw err; });
	return data;
}

function drawMap(data) {
	console.log(data);
}
