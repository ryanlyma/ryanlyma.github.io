var googleMapsStyleArray;

d3.json("data/maps_style.json", function(error, data){
  if (error) {
      return console.warn(error);
    }
    else {
      console.log("maps_styles.json loaded.")

      googleMapsStyleArray = data;
    }
});

function initMap() { 
  var myLatLng = {lat: 33.64073 , lng: -84.42770};

  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map-frame'), {
    center: myLatLng,
    scrollwheel: false,
    zoom: 4,
    overviewMapControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    styles: googleMapsStyleArray
  });

  // Create a marker and set its position.
  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'Hello World!'
  });
}