var map;
var zones = [];

var currentParkingZone = null;

$(function() {
    loadData();

    // bind event to park button
    $(document).on('click', '.btn-park', function(event) {
        event.preventDefault();
        var selectedId = $(this).attr('href');
        var selectedZone = _.find(zones, function(zone) {
            return zone.id == selectedId;
        });
        $('#selectedZone').html(selectedZone.name);

        if (currentParkingZone) {
            currentParkingZone.gmapPolygon.setOptions (
                {
                    'fillColor': getZoneColor(currentParkingZone),
                    'strokeColor': getZoneColor(currentParkingZone)
                }
            );
        }

        selectedZone.gmapPolygon.setOptions (
            {
                'fillColor': 'blue',
                'strokeColor': 'blue'
            }
        );
        currentParkingZone = selectedZone;
    });
});

function initMap(center, bounds, zones) {
    map = new google.maps.Map(document.getElementById('map'));
    map.setCenter(center);
    map.fitBounds(bounds);

    zones.forEach(function(zone) {
        zone.gmapPolygon.setMap(map);
    });

    var marker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: center
    });

    marker.addListener('dragend', function(pos) {
        var droppedZone = null;
        zones.forEach(function(zone) {
            if (google.maps.geometry.poly.containsLocation(pos.latLng, zone.gmapPolygon)) {
                droppedZone = zone;
            }
        });

        if (droppedZone) {
            // TODO: display zone information here
            fillZoneInfo(droppedZone);
        }
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
        data.location_data.zones.forEach(function(zone) {
            zone.gmapPolygon = getZonePolygon(zone);
            zones.push(zone);
        });

        initMap(center, bounds, zones);
    });
}

function strToLatLng(str, separator) {
    var lat = parseFloat(str.split(separator)[0]);
    var lng = parseFloat(str.split(separator)[1]);
    return new google.maps.LatLng(lat, lng);
}

function getZoneColor(zone) {
    return zone.payment_is_allowed === "0" ? 'red' : 'green';
}

function getZonePolygon(zone) {
    var coords = [];
    zone.polygon.split(', ').forEach(function(point) {
        coords.push(strToLatLng(point, ' '));
    });

    var color = getZoneColor(zone);

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

function showConsole(msg) {
    $('#console').removeClass('visible');
    $('#console').addClass('visible');
    $('#console').html(msg);
}

function fillZoneInfo(zone) {
    var infoContent = '<li><span class="title">Name: </span>' + zone.name + '</li>' +
        '<li><span class="title">Provider: </span>' + zone.provider_name + '</li>' +
        '<li><span class="title">Allowed payment: </span>' + zone.payment_is_allowed + '</li>' +
        '<li><span class="title">Price: </span>' + zone.service_price + zone.currency + '</li>' +
        '<li><span class="title">Max duration: </span>' + zone.max_duration + ' min.</li>' +
        '<li><span class="title">Require sticker: </span>' + zone.sticker_required + '</li>' +
        '<li><a class="btn btn-success btn-park" href="' + zone.id + '">Park now</a></li>';

    $('#info').html(infoContent);
}