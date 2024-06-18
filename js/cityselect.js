document.getElementById('citySelect').addEventListener('change', function() {
    var selectedCity = this.options[this.selectedIndex].text;
    document.getElementById('cityInfo').innerText = 'Currently the data is fetched from the location of the inner city of ' + selectedCity;
});