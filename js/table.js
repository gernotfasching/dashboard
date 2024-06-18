$(document).ready(() => {
    let metadataUrl = "https://dataset.api.hub.geosphere.at/v1/timeseries/historical/inca-v1-1h-1km/metadata";
    axios.get(metadataUrl)
        .then(() => {
            citylocation();
        });

    $("#fetchData").click(() => {
        citylocation();
    });

    function citylocation() {
        let selectedCity = $("#citySelect").val();
        $.ajax({
            method: 'GET',
            url: `https://api.api-ninjas.com/v1/geocoding?city=${selectedCity}&country=AT`,
            headers: { 'X-Api-Key': 'Sp2fuko/q1ww1IB4W9v5qA==11U4tZSjf0kURBSK' },
            contentType: 'application/json',
            success: function (result) {
                if (result.length > 0) {
                    let lat = result[0].latitude;
                    let long = result[0].longitude;
                    fetchTemperatureData(lat, long);
                } else {
                    console.error('No data available for the specified city.');
                }
            },
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        });
    }

    function fetchTemperatureData(lat, long) {
        let fromTime = new Date();
        fromTime.setDate(fromTime.getDate() - 7);
        let toTime = new Date();

        let dataUrl = `https://dataset.api.hub.geosphere.at/v1/timeseries/historical/inca-v1-1h-1km?parameters=T2M&start=${fromTime.toISOString()}&end=${toTime.toISOString()}&lat_lon=${lat},${long}&output_format=geojson`;

        axios.get(dataUrl)
            .then((response) => {
                let features = response.data.features;
                if (features.length === 0) {
                    console.error('No data available for the selected parameter and time range.');
                    return;
                }

                let timestamps = response.data.timestamps;
                let paramData = features[0].properties.parameters['T2M'];

                if (!paramData) {
                    console.error(`No data available for parameter: T2M`);
                    return;
                }

                let data = paramData.data;
                let dateTempMap = {};

                timestamps.forEach((timestamp, index) => {
                    let date = new Date(timestamp).toISOString().split('T')[0];
                    if (!dateTempMap[date]) {
                        dateTempMap[date] = [];
                    }
                    dateTempMap[date].push(data[index]);
                });

                let tableData = [];
                for (let date in dateTempMap) {
                    let temps = dateTempMap[date];
                    let avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
                    tableData.push({ date: date, avgTemp: avgTemp });
                }

                updateTemperatureTable(tableData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }

    function updateTemperatureTable(data) {
        let tableBody = $("#temperatureTable tbody");
        tableBody.empty();

        data.forEach((day) => {
            let row = `<tr>
                           <td>${day.date}</td>
                           <td>${day.avgTemp.toFixed(2)}</td>
                       </tr>`;
            tableBody.append(row);
        });
    }
    citylocation();
});
