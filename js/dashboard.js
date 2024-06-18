$(document).ready(() => {
    let metadataUrl = "https://dataset.api.hub.geosphere.at/v1/timeseries/historical/inca-v1-1h-1km/metadata";
    axios.get(metadataUrl)
        .then((response) => {
            let params = response.data.parameters;
            console.log(response.data);
            let paramSelect = $("#paramSelect");
            params.forEach((param) => {
                let option = `<option value='${param.name}'>${param.long_name}</option>`;
                paramSelect.append(option);
            });
            citylocation();
            startup();
        });

    $("#fetchData").click(() => {
        citylocation();
        startup();
    });
    
    function citylocation() {
        let selectedCity = $("#citySelect").val();
        $.ajax({
            method: 'GET',
            url: `https://api.api-ninjas.com/v1/geocoding?city=${selectedCity}&country=AT`,
            headers: { 'X-Api-Key': 'Sp2fuko/q1ww1IB4W9v5qA==11U4tZSjf0kURBSK' },
            contentType: 'application/json',
            success: function (result) {
                console.log(result);
                if (result.length > 0) {
                    let lat = result[0].latitude;
                    let long = result[0].longitude;
                    console.log(lat, long);
                    startup(lat, long);
                } else {
                    console.error('No data available for the specified city.');
                }
            },
            error: function ajaxError(jqXHR) {
                console.error('Error: ', jqXHR.responseText);
            }
        });
    }

    function startup(lat, long) {
        let selectedParam = $("#paramSelect").val();
        let fromTime = new Date($("#fromTime").val()).toISOString();
        let toTime = new Date($("#toTime").val()).toISOString();
        let dataUrl = `https://dataset.api.hub.geosphere.at/v1/timeseries/historical/inca-v1-1h-1km?parameters=${selectedParam}&start=${fromTime}&end=${toTime}&lat_lon=${lat},${long}&output_format=geojson`;
        console.log(dataUrl);
        axios.get(dataUrl)
            .then((response) => {
                console.log(response);
                let features = response.data.features;
                if (features.length === 0) {
                    console.error('No data available for the selected parameter and time range.');
                    return;
                }

                let timestamps = response.data.timestamps;
                let paramData = features[0].properties.parameters[selectedParam];

                if (!paramData) {
                    console.error(`No data available for parameter: ${selectedParam}`);
                    return;
                }

                let seriesData = [{
                    name: paramData.name,
                    data: paramData.data.map((value, index) => [Date.parse(timestamps[index]), value])
                }];

                let chartType = $("#chartType").val(); // Get selected chart type
                let unit = paramData.unit; // Get unit of selected parameter

                Highcharts.chart('chartContainer', {
                    chart: {
                        type: chartType
                    },
                    title: {
                        text: 'Datagraph'
                    },
                    xAxis: {
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {
                            text: unit
                        }
                    },
                    series: seriesData
                });
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }
});
