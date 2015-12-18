// Variables

// Data
var globalIATA, globalRanking, globalGDP;
var airportSelected;

var rankingYear = 2014;
var rankingYearMax = 2014;
var rankingYearMin = 2001;
var paxVolMax, paxVolMin;


d3.csv("data/gdp.csv", function(error, data){
  if (error) {
      return console.warn(error);
    }
    else {
      console.log("gdp.csv loaded.")

      // Missing parseFlaot function

      globalGDP = data;

      d3.csv("data/iata.csv", function(error, data){
        if (error) {
            return console.warn(error);
          }
          else {
            console.log("iata.csv loaded.")
            globalIATA = data;

            d3.csv("data/airport_ranking.csv", function(error, data){
              if (error) {
                  return console.warn(error);
                }
                else {
                  console.log("airport_ranking.csv loaded.")
                  data.forEach(function(d){
                    d["year"] = parseFloat(d["year"]);
                    d["rank"] = parseFloat(d["rank"]);
                    d["pax_volume"] = parseFloat(d["pax_volume"]);
                    d["rank_change"] = parseFloat(d["rank_change"]);
                    d["rank_change_percentage"] = parseFloat(d["rank_change_percentage"]);
                  });

                  globalRanking = data;

                  paxVolMin = d3.min(data, function(d){
                    return d["pax_volume"];
                  });

                  paxVolMax = d3.max(data, function(d){
                    return d["pax_volume"];
                  });

                  drawRanking();
                  updateYearIndicator();
                }
            });
          }
      });
    }
});

d3.select("html").on("keydown", function(event){
  
  var code = d3.event.keyCode;

  if (code == 37) {
    // Left arrow = one year previous.
    rankingYearDown();
  } else if (code == 39) {
    // Right arrow = one year after.
    rankingYearUp();
  }
});

d3.select(".d3-left-arrow").on("click", function(){
  console.log("mousedown detected.");
  rankingYearDown();
});

d3.select(".d3-right-arrow").on("click", function(){
  console.log("mousedown detected.");
  rankingYearUp();
});

function rankingYearDown(){
  if (rankingYear > rankingYearMin) {
    rankingYear = rankingYear - 1;
    drawRanking();
    updateYearIndicator();
  }
};

function rankingYearUp(){
  if (rankingYear < rankingYearMax) {
    rankingYear = rankingYear + 1;
    drawRanking();
    updateYearIndicator();
  }
};

function updateYearIndicator(){
  d3.select(".d3-year-indicator").text(rankingYear);
};

function imageLookup(code){

  var imageName = globalIATA.filter(function(d){
    return d["iata_code"] == code;
  });
  return imageName[0]["image_name"];
}

function calculateBarWidth(value){
  var scale = d3.scale.linear()
                  .domain([paxVolMin, paxVolMax])
                  .range([20, 95]);

  return scale(value);
}

function drawRanking(){

  year_data = globalRanking.filter(function(d){
    return d["year"] == rankingYear;
  }).sort(function(a, b){
    return a["rank"] - b["rank"];
  });

  year_data.forEach(function(d){
    var code = d["iata_code"];
    var paxVol = d["pax_volume"];
    d["image_name"] = imageLookup(code);
    d["bar_width"] = calculateBarWidth(paxVol);
    d["bar_position"] = ((100 - d["bar_width"]) / 2);
  });

  console.log(year_data);

  var ul_ranking = d3.select(".d3-ranking").selectAll("li")
                   .data(year_data, function(d, i){
                    return d["iata_code"];
                   });

  ul_ranking.enter().append("li").attr("class", "ranking-item")
                    .attr("data-iata", function(d){
                      return d["iata_code"];
                    })
                    .style("top", function(d){
                      return "" + ((d["rank"] * 56) - 36)+ "px";
                    })
                    .on("click", function(d){
                      airportSelected = d["iata_code"];
                      console.log(airportSelected);
                      updateInfoPanel();
                    })
                    .each(function(d){

    d3.select(this).append("div").attr("class", "ranking-item--label")
    d3.select(this).append("div").attr("class", "ranking-item--chart");

    var itemLabel = d3.select(this).select(".ranking-item--label");
    var itemChart = d3.select(this).select(".ranking-item--chart");

    itemLabel.append("img").attr("class", "flag")
                           .attr("src", "images/flags/"+d["image_name"])
                           .attr("alt", d["iata_code"]);
    itemLabel.append("div").attr("class", "title")
                           .text(d["iata_code"]);
    itemChart.append("div").attr("class", "marker negative");
    itemChart.append("div").attr("class", "marker zero");
    itemChart.append("div").attr("class", "marker positive");
    itemChart.append("div").attr("class", "bar")
                           .style("width", d["bar_width"]+"%")
                           .style("left", d["bar_position"]+"%")
                           .text(d["pax_volume"]);
  });


  ul_ranking.each(function(d){

    var itemLabel = d3.select(this).select(".ranking-item--label");
    var itemChart = d3.select(this).select(".ranking-item--chart");

    itemChart.select("div.gdp").style("left", "33%");
    itemChart.select("div.pax").style("left", "66%");
    itemChart.select("div.bar").style("width", d["bar_width"]+"%")
                               .style("left", d["bar_position"]+"%")
                               .text(d["pax_volume"]);
    
  }).style("top", function(d){
    return "" + ((d["rank"] * 56) - 36)+ "px";
  }).transition().duration(500);

  ul_ranking.exit().remove();
}

function updateInfoPanel() {
  var airportVolume, airportLat, airportLng, airportMetro, airportName;
  var localRanking = globalRanking.filter(function(d){
    return d["iata_code"] == airportSelected && d["year"] <= rankingYearMax ;
  })
  var localIATA = globalIATA.filter(function(d){
    return d["iata_code"] == airportSelected;
  })

  airportVolume = localRanking;
  airportLat = getAirportLat();
  airportLng = getAirportLng();
  airportMetro = getAirportMetro();
  airportName = getAirportName();

  function getAirportLat() {
    return parseFloat(localIATA[0]["lat"]);
  }

  function getAirportLng() {
    return parseFloat(localIATA[0]["lng"]);
  }

  function getAirportMetro() {
    return localIATA[0]["metro"];
  }

  function getAirportName() {
    return localIATA[0]["airport"];
  }

  function updateSelectedItem() {
    $('.ranking-item').removeClass("selected");
    $('.ranking-item[data-iata="'+airportSelected+'"]').addClass("selected");
  }

  function updateAirportInfo() {
    d3.select(".d3-metro").text(airportMetro);
    d3.select(".d3-location").text(airportName);
    d3.select(".d3-hero").attr("style", function(){
      return "background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.66) 100%), url('images/location/"+airportSelected+".jpg');";
    })
  }

  function updateMap() {

    var newLatLng = {lat: airportLat, lng: airportLng};

    var map = new google.maps.Map(document.getElementById('map-frame'), {
      center: newLatLng,
      scrollwheel: false,
      zoom: 4,
      overviewMapControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      styles: googleMapsStyleArray
    });

    var marker = new google.maps.Marker({
      map: map,
      position: newLatLng,
      title: 'Hello World!'
    });

  }

  function clearAirportChart() {
    d3.select("#visualization").selectAll("*").remove();
  }

  function updateAirportChart() {
    var vis = d3.select('#visualization'),
      WIDTH = 720,
      HEIGHT = 340,
      MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
      },
      xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([(rankingYearMin - 1), (rankingYearMax + 1)]),
      yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(airportVolume, function(d) {
        return d["pax_volume"];
      }), d3.max(airportVolume, function(d) {
        return d["pax_volume"];
      })]),
      xAxis = d3.svg.axis()
        .scale(xRange)
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(d3.format(""))
        .tickSubdivide(true),
      yAxis = d3.svg.axis()
        .scale(yRange)
        .tickPadding(8)
        .outerTickSize(0)
        .innerTickSize(-WIDTH)
        .tickFormat(d3.format("s"))
        .orient('left')
        .tickSubdivide(true);

    vis.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis);

    vis.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(yAxis);

    var lineFunc = d3.svg.line()
      .x(function(d) {
        return xRange(d["year"]);
      })
      .y(function(d) {
        return yRange(d["pax_volume"]);
      })
      .interpolate('linear');

    vis.append('svg:path')
    .attr('d', lineFunc(airportVolume))
    .attr('class', 'trendline');

  }

  updateAirportInfo();
  updateMap();
  updateSelectedItem();
  clearAirportChart();
  updateAirportChart();

}


function initMap() { 
  var myLatLng = {lat: 33.64073 , lng: -84.42770};

  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map-frame'), {
    center: myLatLng,
    scrollwheel: false,
    zoom: 9,
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

