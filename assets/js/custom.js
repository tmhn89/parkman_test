$(function() {
    initMap();
    loadData();
});

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}

function loadData() {
    console.log('reindeer');
    $.get('assets/js/json.json', function(data) {
        console.log(data);
    });
}