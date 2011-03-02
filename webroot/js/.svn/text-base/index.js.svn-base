$(function(){

// temporarily added
  _lat = 40.755645
  _lon = -73.990259
      if (!_lat) {
          get_location(get_venues);
      } else {
          get_venues();
      }
});

var entities = {}

// Location            
function setDisplay(text) {
    $('.info').empty().append(text)
}

// var _lat = null;
// var _lon = null;

// If browser supports geolocation (iPhone or Gears), use that,
// otherwise use a default location
function get_location(fn) {
    if (navigator.geolocation) {
  get_device_location(fn)
    } else {
  alert("Your browser does not support geo location. We will assume a location in New York.")
  _lat = 40.7413026
  _lon = -73.9999411
  if (fn)
      fn()
    }
}

// Get location from the browser
function get_device_location(fn) {
    navigator.geolocation.getCurrentPosition(
  function(position){
      _lat = position.coords.latitude
      _lon = position.coords.longitude
      
      setDisplay('Latitude: ' + _lat + '<br />Longitude: ' + _lon);
      
      if (fn)
    fn();
  },
  function(error){
      if (error.code == 1) {
	  _lat = 40.7413026
	  _lon = -73.9999411
      if (fn)
          fn();
      }
  });
}

// Search for businesses and display them in a list
function get_venues() {
    get_venues_from_skipola();
    get_venues_from_geoapi();
}

function get_venues_from_geoapi() {
    venue_query_geoapi(_lat, _lon, '1km', 'restaurants', 20, function(result) {
  if (result.entity.length == 0) {
      $("#results-limited").html("<li>No venues found.</li>");
  }
  else {
      $("#results-limited").html("");
      $.each(result.entity, function(i) {
    var entity = result.entity[i];
    var address = entity['view.listing']['address'];
    var li = '<form id="product-' + entity.name + '" action="http://' + window.location.hostname + '/unclaimed/' + entity.guid + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
       '<ul class="edgetoedge">' +
       '<li><a href="#" class="submit">' +
       '<span class="entityName">' + entity.name + '</span> '+
       '<span style="font-size:8pt;font-weight:normal;">' + address[0] + ', ' + address[1] + 
       ' (' + entity['distance-from-origin'] + ')</span>' +
       '</a></li></ul></form>'; 
          $("#results-limited").append(li);
      });
  }
    })
}

function get_venues_from_skipola() {
    venue_query_skipola(_lat, _lon, '1km', 20, function(result) {
  if (result.entity.length == 0) {
      $("#results-full").html("<li>No venues found.</li>");
  }
  else {
      $("#results-full").html("");
      $.each(result.entity, function(i) {
    var entity = result.entity[i];
    var address = entity['view.listing']['address'];
    var li = '<form id="product-' + entity.name + '" action="http://' + window.location.hostname + '/' + entity.guid + '/" method="POST" class="form" style="margin-bottom:-2px;">' +
       '<ul class="edgetoedge">' +
       '<li><a href="#" class="submit">' +
       '<span class="entityName">' + entity.name + '</span> '+
       '<span style="font-size:8pt;font-weight:normal;">' + address[0] + ', ' + address[1] + 
       /*' (' + entity['distance-from-origin'] + ')' */ '</span>' +
       '</a></li></ul></form>';
    $("#results-full").append(li);
      });
  }
    })
}

// GeoAPI & location related code

// API cache to avoid duplicating requests on a single page load.
var api_cache = {}

// Simple wrapper around search query
function venue_query_geoapi(lat, lon, radius, vertical, limit, match_fn) {
    // Build the search query
    var server = 'http://api.geoapi.com/v1'
    var url = server + '/q'
    q = {
	lat: lat, 
	lon: lon,
	"entity": [{
	    "guid": null,
	    "name": null,
	    "geom": null,
	    "distance-from-origin": null,
	    "type": "business",
	    "view.listing": {
	       "*": null
	    }
	}]
    }
    if (radius) { // search radius (ex. 1km)
  q.radius = radius
    }
    if (limit) { // number of results to return (ex. 20)
  q.limit = limit
    }
   if (vertical) {
  q.entity[0]['view.listing']['verticals'] = vertical
    }

    url += "?q=" + JSON.stringify(q) + "&apikey=VlRKFBnkt8&jsoncallback=?"
    $.getJSON(url, match_fn);
    /*
    var qid = JSON.stringify(q)
    var callspec = {callback_fn: match_fn}
    if (api_cache[qid]) { // If the same query has already been requested
  api_cache[qid].callbacks.push(callspec)
  if (api_cache[qid].response) { // If the query has already returned a response
      callspec.callback_fn(api_cache[qid].response)
  }
    } else { // If it's the first time the query is requested, actually make the call
  api_cache[qid] = {callbacks: [callspec]};
  url += "?q=" + JSON.stringify(q) + "&apikey=VlRKFBnkt8";
  $.getJSON(url, function(resp) {
      alert('asdf')
      var my_callbacks = api_cache[qid].callbacks
      api_cache[qid].response = resp
      for (var j = 0; j < my_callbacks.length; j++) {
    var callspec = my_callbacks[j] 
    callspec.callback_fn(resp)
      }
  });
    }*/
}

function venue_query_skipola(lat, lon, radius, limit, match_fn) {
    $.getJSON(
  'http://' + location.host + '/venue-search/?lat=' + lat + '&lon=' + lon + '&limit=20&rnd=' + Math.random(),
  match_fn
    );
}