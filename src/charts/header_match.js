import { select as d3Select } from "d3-selection";

export default function() {

  var hed = "Premier League";
  var logo_home = undefined;
  var logo_away = undefined;
  var score = [0,0];


  function chart(g) {
    g.each(function() {
      var scoreboard = d3Select(this).append('g')
        .attr('id', 'scoreboard')
        .attr('class', '.hed');
      scoreboard.append("svg:image")
        .attr("xlink:href", logo_home)
        .attr("width", 40)
        .attr("x", 0)
        .attr("y", 25);
      scoreboard.append("svg:image")
        .attr("xlink:href", logo_away)
        .attr("width", 40)
        .attr("x", 130)
        .attr("y", 25);
      scoreboard.append('text')
        .attr("x", 0)
        .attr("y", 10)
        .style("font-size", "16px")
        .style('fill', 'grey')
        .text(hed);
      scoreboard.append('text')
        .attr("x", 55)
        .attr("y", 55)
        .attr("font-weight", 'bold')
        .style("font-size", "32px")
        .style('fill', 'black')
        .text(`${score[0]} : ${score[1]}`);
    })
  }

  chart.hed = function (_) {
    if (!arguments.length) return hed;
    hed = _;
    return chart;
  };

  chart.logoHome = function (_) {
    if (!arguments.length) return logo_home;
    logo_home = _;
    return chart;
  };

  chart.logoAway = function (_) {
    if (!arguments.length) return logo_away;
    logo_away = _;
    return chart;
  };

  chart.score = function (_) {
    if (!arguments.length) return score;
    score = _;
    return chart;
  };


  return chart;
}
