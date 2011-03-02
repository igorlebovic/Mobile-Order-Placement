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
      window.location.href='/categories/?lat=' + _lat + '&lon=' + _lon
    },
    function(error){
      if (error.code == 1)
        _lat = 37.7649888
        _lon = -122.4285356
	if (fn)
          fn(_lat, _lon)
    });
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

