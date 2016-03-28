var map;
var zones = [];
var currentParkingZone = null;

var COLOR_RED = '#e74c3c';
var COLOR_GREEN = '#2ecc71';
var COLOR_BLUE = '#3498db';

var PARKED_SELECTED_ZONE_TEXT = 'You are parking at:';

$(function () {
    loadData();

    // bind event to park button
    $(document).on('click', '.btn-park', function (event) {
        event.preventDefault();
        // get selected zone object
        var selectedId = $(this).attr('href');
        var selectedZone = _.find(zones, function (zone) {
            return zone.id == selectedId;
        });
        // set selected zone text
        var currentTime = new Date();
        var currentTimeStr = toTwoDigits(currentTime.getHours()) + ':'  + toTwoDigits(currentTime.getMinutes()) + ' - ' +
            currentTime.getDate() + '/' + (currentTime.getMonth() + 1) + '/' + currentTime.getFullYear();

        $('#selectedZone').empty().html(
            '<p>' + PARKED_SELECTED_ZONE_TEXT + '</p>' +
            '<h3>' + selectedZone.name + '</h3>' +
            '<p><b>From: </b>' + currentTimeStr + '</p>');

        if (currentParkingZone) {
            currentParkingZone.gmapPolygon.setOptions(
                {
                    fillColor: getZoneColor(currentParkingZone),
                    strokeColor: getZoneColor(currentParkingZone)
                }
            );
        }

        selectedZone.gmapPolygon.setOptions(
            {
                fillColor: COLOR_BLUE,
                strokeColor: COLOR_BLUE
            }
        );
        currentParkingZone = selectedZone;

        // hide info box
        $('#zoneInfo').addClass('hidden');
    });
});

function initMap(center, bounds, zones) {
    map = new google.maps.Map(document.getElementById('map'));
    map.setCenter(center);
    map.fitBounds(bounds);

    zones.forEach(function (zone) {
        zone.gmapPolygon.setMap(map);
    });

    var marker = new google.maps.Marker({
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: center
    });

    marker.addListener('dragend', function (pos) {
        var droppedZone = null;
        zones.forEach(function (zone) {
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
    $.get('assets/js/json.json', function (data) {
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
        data.location_data.zones.forEach(function (zone) {
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

function boolNumToText(input) {
    if (parseInt(input) == 0) {
        return "No";
    }
    return "Yes";
}

function getZoneColor(zone) {
    return zone.payment_is_allowed === "0" ? COLOR_RED : COLOR_GREEN;
}

function getZonePolygon(zone) {
    var coords = [];
    zone.polygon.split(', ').forEach(function (point) {
        coords.push(strToLatLng(point, ' '));
    });

    var color = getZoneColor(zone);

    var polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: color,
        fillOpacity: 0.8
    });

    return polygon;
}

function fillZoneInfo(zone) {
    var infoContent = '<h4>' + zone.name + '</h4>' +
        '<p class="provider"><span class="title">by: </span>' + zone.provider_name + '</p>' +
        '<p><span class="title">Allowed payment: </span>' + boolNumToText(zone.payment_is_allowed) + '</p>' +
        '<p><span class="title">Price: </span>' + zone.service_price + zone.currency + '</p>' +
        '<p><span class="title">Max duration: </span>' + zone.max_duration + ' min.</p>' +
        '<p><span class="title">Require sticker: </span>' + boolNumToText(zone.sticker_required) + '</p>' +
        '<p class="text-center"><a class="btn btn-success btn-park" href="' + zone.id + '">Park now</a></p>';

    $('#zoneInfo').removeClass('hidden').html(infoContent);
}

function toTwoDigits(num) {
    return (num < 10 ? '0' :'' ) + num;
}

function applyAnimation(element, animationName) {
    element.removeClass(animationName).addClass(animationName + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass(animationName);
    });
}