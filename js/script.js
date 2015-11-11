// Variables

// Data
var globalIATA, globalRanking, globalGDP;
// still missing globalGDPDelta;

var rankingYear = 2014;
var paxVolMax, paxVolMin;



// Functions: Loading Data

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
                    return d["rank"];
                   });

  ul_ranking.enter().append("li").attr("class", "ranking-item").html(function(d){
    return '<div class="ranking-item--label"><img src="images/flags/'+d["image_name"]+'" class="flag"><div class="title">'+d["iata_code"]+'</div></div><div class="ranking-item--chart"><div class="indicator quartile negative"></div><div class="indicator quartile zero"></div><div class="indicator quartile positive"></div><div class="indicator gdp" style="left: 33%;">&nbsp;</div><div class="indicator pax" style="left: 66%;">&nbsp;</div><div class="bar" style="width: '+d["bar_width"]+'%; left: '+d["bar_position"]+'%;">'+d["pax_volume"]+'</div></div>';
  });
}

