/*********************
**** NearMe **********
**********************
Demo Application-specific code
*/

var entities = {}
var vertical_index = null
var verticals = [ ['restaurants', 'Restaurants', 'restaurants'],
                  ['food-and-drink:coffee-houses', 'Coffee Shops', 'cafes'],
                  ['arts-entertainment-and-nightlife:bars', 'Bars', 'bars'],
                  ['financial:banks', 'Banks & ATMs', 'atms'],
                  ['automotive:gas-stations-and-convenience-stores', 'Gas Stations', 'gasstations'],
                  ['tourist-center:parking', 'Parking', 'parking'],
                  ['shopping', 'Shopping', 'shopping'],
                  ['food-and-drink:grocery-and-convenience-stores', 'Supermarkets & Groceries', 'groceries']
                ]

// Initialize by listing verticals
function init() {
  $.each(verticals, function(i) {
    var li = '<li><a class="vertical" onclick="javascript:show_vertical(' + i + ')">' + 
             '<img src="/images/img/cat-' + verticals[i][2] + '18x.png"> '+
             verticals[i][1] + '</a></li>'
    $("#vertical_list").append(li)
  })
  get_location()
}

// Search for businesses in the selected vertical and display them in a list
function show_vertical(vertical_index) {  
  _vertical_index = vertical_index
  var vertical = verticals[vertical_index]
  $("#mapButton").show()
  $("#results").attr("title", vertical[1])
  location_query(_lat, _lon, '1km', vertical[0], 20, 
                 function(result) {
                   $("#results").html("")
                   entities = {}
                   $.each(result.entity, 
                          function(i) {
                            var entity = result.entity[i]
                            entities[entity.guid] = entity
                            var address = entity['view.listing']['address']
			    var li = '<li onclick="javasript:window.location=\'http://skipola.com/room/' + entity.guid + '/\'">'+
                            // var li = '<li onclick="javasript:window.location=\'http://skipola.com/room/' + entity.name.toLowerCase().replace(/\s/g, "-") + '/\'">'+
                            // '"javascript:show_map_entity(\'' + entity.guid + '\')">'+
                                     '<span class="entityName">' + entity.name + '</span> '+
                                     '<br/><span class="entityAddress">' + address[0] + ', ' + address[1] + 
                                     ' (' + entity['distance-from-origin'] + ')</span></li>'
                            $("#results").append(li)
                          })
                   showPage($("#results")[0])
                 })
}

// Show a single entity on the map
function show_map_entity(guid) {
  var entity = entities[guid]
  $("#map").attr("title", entity.name)
  show_map(function() {
    add_entity_to_map(entity)
  })
}

// Show the current list of entities on a map
function show_map_results() {
  var vertical = verticals[_vertical_index]
  $("#map").attr("title", vertical[1])
  show_map(function() {
    $.each(entities, function(i){
      var entity = entities[i]
      add_entity_to_map(entity)
    })
  })    
}

// Add an entity to the map
function add_entity_to_map(entity) {
  var point  = new google.maps.LatLng(entity.geom.coordinates[1], entity.geom.coordinates[0])
  var marker = add_map_point(entity.name, point) 
  var address = entity['view.listing']['address']
  var contentString = '<div class="infoWindow">' + 
                      '<div class="entityName">' + entity.name + '</div>' +
                      '<div class="entityAddress">' + address[0] + ', ' + address[1] + '</div>' +
                      '<div class="entityAddress">' + entity['view.listing']['phone'] + '</div>' + 
                      '</div>'
  var infowindow = new google.maps.InfoWindow({content: contentString});
  google.maps.event.addListener(marker, 'click', function() {infowindow.open(_map, marker);});
}


/*********************
**** Maps & Location *
**********************
Maps and browser location related information
*/
var _map = null;
var _lat = null;
var _lon = null;


// If browser supports geolocation (iPhone or Gears), use that,
// otherwise use a default location
function get_location(fn) {
  if (navigator.geolocation) {
    get_device_location(fn)
  } else {
    alert("Your browser does not support geo location. We will assume a location in San Francisco.")
    _lat = 37.7649888
    _lon = -122.4285356
    if (fn)
        fn(_lat, _lon)
  }
}

// Get location from the browser
function get_device_location(fn) {
  navigator.geolocation.getCurrentPosition(
    function(position){
      _lat = position.coords.latitude
      _lon = position.coords.longitude
      if (fn)
        fn(_lat, _lon)
    },
    function(error){
      if (error.code == 1)
        _lat = 37.7649888
        _lon = -122.4285356
	if (fn)
          fn(_lat, _lon)
    });
}

// Initialize the map
function init_map() {
  var useragent = navigator.userAgent;
  var mapdiv = $("#map_canvas").get(0);

  /*if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '300px';
    mapdiv.style.height = '300px';
  } else {
    mapdiv.style.width = '500px';
    mapdiv.style.height = '300px';
  }*/
  
  var opts = {
    zoom: 15,
    center: new google.maps.LatLng(_lat, _lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  _map = new google.maps.Map(mapdiv, opts);
  _map.bounds = new google.maps.LatLngBounds();
}

// Show the map. Use a timeout to allow the page to settle down
// before initializing the map
function show_map(fn) {
  showPage($("#map")[0])
  setTimeout(function() {
    init_map()
    fn()
    add_current_location_to_map()
    _map.fitBounds(_map.getBounds())
  }, 0)    
}


// Add a point to the map
function add_map_point(name, point, icon) {
    var opts = { position: point,
    						 map: _map,
    						 title: name
    					 }
    if (icon) {
      opts.icon = icon
      opts.shadow = ''
    }
    var marker = new google.maps.Marker(opts);
    _map.bounds.extend(point);
    return marker
}

// Add current location to the map
function add_current_location_to_map(){
		var point = new google.maps.LatLng(_lat, _lon);
		var image = new google.maps.MarkerImage('images/img/blue_dot_circle.png',
			new google.maps.Size(38, 38), // size
			new google.maps.Point(0, 0), // origin
			new google.maps.Point(19, 19) // anchor
		);
		add_map_point("You are here", point, image)
}


/*********************
**** GeoAPI **********
**********************
GeoAPI & location related code
*/
// API cache to avoid duplicating requests on a single page load.
var api_cache = {}

// Simple wrapper around search query
function location_query(lat, lon, radius, vertical,
                                limit, match_fn) {
    // Build the search query
    var server = 'http://api.geoapi.com/v1'
    var url = server + '/q'
    q = {lat: lat, 
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
    qid = JSON.stringify(q)
    var callspec = {callback_fn: match_fn}
    if (api_cache[qid]) { // If the same query has already been requested
        api_cache[qid].callbacks.push(callspec)
        if (api_cache[qid].response) { // If the query has already returned a response
            callspec.callback_fn(api_cache[qid].response)
        }
    } else { // If it's the first time the query is requested, actually make the call
        api_cache[qid] = {callbacks: [callspec]}
        url += "?q=" + JSON.stringify(q) + "&apikey=VlRKFBnkt8&jsoncallback=?"
        $.getJSON(url, /*{q: $.toJSON(q), apikey: "VlRKFBnkt8", jsoncallback: "?"},*/ function(resp) {
          var my_callbacks = api_cache[qid].callbacks
          api_cache[qid].response = resp
          for (var j = 0; j < my_callbacks.length; j++) {
            var callspec = my_callbacks[j] 
            callspec.callback_fn(resp)
          }
        })
    }
}


/*********************
**** iPhone Nav ******
**********************
iPhone navigation related code. This is based on Joe Hewitt's iPhone
web app navigation template (http://joehewitt.com/files/iphone/navigation.html)
*/
var animateX = -20;
var animateInterval = 24;

var currentPage = null;
var currentDialog = null;
var currentWidth = 0;
var pageHistory = [];

addEventListener("load", function(event)
{
    var body = document.getElementsByTagName("body")[0];
    for (var child = body.firstChild; child; child = child.nextSibling)
    {
        if (child.nodeType == 1 && child.getAttribute("selected") == "true")
        {
            showPage(child);
            break;
        }
    }

    setInterval(checkOrientation, 300);
    setTimeout(scrollTo, 0, 0, 1);
}, false);
    
addEventListener("click", function(event)
{
    event.preventDefault();

    var link = event.target;
    while (link && link.localName && link.localName.toLowerCase() != "a")
        link = link.parentNode;

    if (link && link.hash)
    {
        var page = document.getElementById(link.hash.substr(1));
        showPage(page);
    }
}, true);

function checkOrientation()
{
    if (window.outerWidth != currentWidth)
    {
        currentWidth = window.outerWidth;
        var orient = currentWidth == 320 ? "profile" : "landscape";
        document.body.setAttribute("orient", orient);
    }

}
    
function showPage(page)
{
    if (page == $("#results")[0]) {
        $("#mapButton").show()
    } else {
        $("#mapButton").hide()
    }
    
    var homeButton = document.getElementById("homeButton");
    backwards = pageHistory.length > 1 && pageHistory[pageHistory.length-2][0] == page.id;
    if (backwards) {
        pageHistory.pop();
    } else {
        pageHistory.push([page.id, page.title]);
    }
    if (pageHistory.length > 1) {
        homeButton.href = "#"+pageHistory[pageHistory.length-2][0]
        var title = pageHistory[pageHistory.length-2][1]
        homeButton.innerHTML = title.substring(0, 4) + '..' 
        homeButton.style.display = "inline"
    } else {
        homeButton.style.display = "none"
    }
    var fromPage = currentPage;
        currentPage = page;

    var pageTitle = document.getElementById("pageTitle");
    pageTitle.innerHTML = page.title || "";

    if (fromPage) {
        setTimeout(swipePage, 0, fromPage, page, backwards);
    }
}

function swipePage(fromPage, toPage, backwards)
{   
    toPage.style.left = "100%";
    toPage.setAttribute("selected", "true");
    scrollTo(0, 1);
    
    var percent = 100;
    var timer = setInterval(function()
    {
        percent += animateX;
        if (percent <= 0)
        {
            percent = 0;
            fromPage.removeAttribute("selected");
            clearInterval(timer);
        }

        fromPage.style.left = (backwards ? (100-percent) : (percent-100)) + "%"; 
        toPage.style.left = (backwards ? -percent : percent) + "%"; 
    }, animateInterval);
}

