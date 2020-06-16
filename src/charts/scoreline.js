import { select as d3Select } from "d3-selection";


export default function() {
  var height = 23;
  var team_width = 45;
  var score_width = 40;
  var clock_width = 40;
  var width = 2*team_width + score_width + clock_width;
  var teams = [
    {"label": "H", "color": "#87CEEB"},
    {"label": "A", "color": "#FDB913"}
  ];
  var score = [0, 0];
  var updateScore;
  var clock = 0;
  var updateClock;

  function chart(g) {
    g.each(function() {
      var elem = d3Select(this);
      // Home team
      var elem_team1 = elem.append('g');
      elem_team1.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", team_width)
        .attr("height", height)
        .attr('fill', teams[0].color);
      elem_team1.append('text')
        .text(teams[0].label)
        .attr("x", 5)
        .attr("y", height/2)
        .attr("dominant-baseline", "middle")
        .attr("fill", "white");

      // Away time
      var elem_team2 = elem.append('g')
        .attr('transform', `translate(${team_width + score_width}, 0)`);
      elem_team2.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", team_width + 6)
        .attr("height", height)
        .attr('fill', teams[1].color);
      elem_team2.append('text')
        .text(teams[1].label)
        .attr("x", 5)
        .attr("y", height/2)
        .attr("dominant-baseline", "middle")
        .attr("fill", "white");

      // Score
      elem.append('text')
        .attr("id", "scoreline")
        .text(`${score[0]} : ${score[1]}`)
        .attr("x", 5 + team_width)
        .attr("y", height/2)
        .attr("dominant-baseline", "middle")
        .attr("fill", "black");

      // Clock
      var elem_clock = elem.append('g');
      elem_clock.append('polyline')
        .attr('points', `${width - clock_width},${height / 2}
                         ${width - clock_width + 6},0
                         ${width},0
                         ${width},${height}
                         ${width - clock_width + 6},${height}`)
        .attr("fill", "white");

      elem_clock.append('text')
        .attr("id", "clock")
        .text(`${clock}'`)
        .attr("x", width - clock_width + 15)
        .attr("y", height/2)
        .attr("dominant-baseline", "middle")
        .attr("fill", "black");

      // Background
      elem
        .append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr('fill', 'rgba(0,0,0,0)')
        .attr('stroke', 'black')
        .attr('stroke-width', .5)

      updateClock = function() {
        elem.select('#clock').text(`${clock}'`)
      };

      updateScore = function() {
        elem.select('#scoreline').text(`${score[0]} : ${score[1]}`)
      };

    });

  }

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = +_;
    return chart;
  };

  chart.teams = function(value) {
    if (!arguments.length) return teams;
    teams = value;
    return chart;
  };

  chart.score = function(value) {
    if (!arguments.length) return score;
    score = value;
    if (typeof updateScore === 'function') updateScore();
    return chart;
  };

  chart.clock = function(value) {
    if (!arguments.length) return clock;
    clock = value;
    if (typeof updateClock === 'function') updateClock();
    return chart;
  };

  return chart;
}
