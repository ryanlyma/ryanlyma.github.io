// Variables

// Data
var globalIATA, globalRanking, globalGDP;
// still missing globalGDPDelta;

var rankingYear = 2014;
var paxVolMax, paxVolMin;
var googleMapsStyleArray;

// Functions: Loading Data

d3.json("data/maps_style.json", function(error, data){
  if (error) {
      return console.warn(error);
    }
    else {
      console.log("maps_styles.json loaded.")

      googleMapsStyleArray = data;
    }
});

d3.csv("data/gdp.csv", function(error, data){
  if (error) {
      return console.warn(error);
    }
    else {
      console.log("gdp.csv loaded.")

      // Missing parseFlaot function

      globalGDP = data;
    }
});

d3.csv("data/iata.csv", function(error, data){
  if (error) {
      return console.warn(error);
    }
    else {
      console.log("iata.csv loaded.")
      globalIATA = data;
    }
});

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
    }
});

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

// function positionGDPIndicator(){};
// function positionPAXIndicator(){};

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
                    .style("top", function(d){
                      return "" + ((d["rank"] * 56) - 36)+ "px";
                    }).each(function(d){

    d3.select(this).append("div").attr("class", "ranking-item--label")
    d3.select(this).append("div").attr("class", "ranking-item--chart");

    var itemLabel = d3.select(this).select(".ranking-item--label");
    var itemChart = d3.select(this).select(".ranking-item--chart");

    itemLabel.append("img").attr("class", "flag")
                           .attr("src", "images/flags/"+d["image_name"])
                           .attr("alt", d["iata_code"]);
    itemLabel.append("div").attr("class", "title")
                           .text(d["iata_code"]);
    itemChart.append("div").attr("class", "indicator quartile negative");
    itemChart.append("div").attr("class", "indicator quartile zero");
    itemChart.append("div").attr("class", "indicator quartile positive");
    itemChart.append("div").attr("class", "indicator gdp")
                           .style("left", "33%");
    itemChart.append("div").attr("class", "indicator pax")
                           .style("left", "66%");
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

function initMap() { 
  var myLatLng = {lat: 33.64073 , lng: -84.42770};

  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map-frame'), {
    center: myLatLng,
    scrollwheel: false,
    zoom: 9,
    styles: googleMapsStyleArray
  });

  // Create a marker and set its position.
  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'Hello World!'
  });
}

drawRanking();
