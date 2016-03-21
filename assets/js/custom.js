var map;

$(function() {
    loadData();
});

function initMap(center, bounds, zones) {
    map = new google.maps.Map(document.getElementById('map'));
    map.setCenter(center);
    map.fitBounds(bounds);

    zones.forEach(function(zone) {
        zone.setMap(map);
    });
}

function loadData() {
    $.get('assets/js/json.json', function(data) {
        console.log(data);
        // center
        var center = strToLatLng(data.current_location, ', ');

        // bounds
        var boundSW = {
            lat: data.location_data.bounds.south,
            lng: data.location_data.bounds.west
        };
        var boundNE = {
            lat: data.location_data.bounds.north,
            lng: data.location_data.bounds.east
        };
        var bounds = new google.maps.LatLngBounds(boundSW, boundNE);

        // zones
        var zones = [];
        data.location_data.zones.forEach(function(zone) {
            zones.push(getZonePolygon(zone));
        });

        initMap(center, bounds, zones);
    });
}

function strToLatLng(str, separator) {
    var lat = parseFloat(str.split(separator)[0]);
    var lng = parseFloat(str.split(separator)[1]);
    return new google.maps.LatLng(lat, lng);
}

function getZonePolygon(zone) {
    var coords = [];
    zone.polygon.split(', ').forEach(function(point) {
        coords.push(strToLatLng(point, ' '));
    });

    var color = zone.payment_is_allowed === "0" ? 'red' : 'green';

    var polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.35
    });

    return polygon;
}