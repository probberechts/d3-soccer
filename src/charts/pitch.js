import { select as d3Select } from "d3-selection";
import { arc as d3Arc } from "d3-shape";
import { pitchLenght, pitchWidth } from "../config";
import css from '../styles/styles.css';


export default function() {

  var clip = {top: 0, right: pitchLenght, bottom: pitchWidth, left: 0};
  var height = 300;
  var rotated = false;
  var width = (-clip.left + clip.right)/(-clip.top + clip.bottom)*height;
  var pitchstrokewidth = .5;
  var dirOfPlay = false;
  var shadeMiddleThird = false;
  var drawGoalsFn = drawGoalsAsLine;

  function drawGoalsAsBox(lines) {
    lines
      .append("rect")
      .style("stroke-width", pitchstrokewidth)
      .style("fill", "none")
      .attr("x", -2)
      .attr("y", pitchWidth/2 - 3.66)
      .attr("width", 2)
      .attr("height", 7.32);
    lines
      .append("rect")
      .style("stroke-width", pitchstrokewidth)
      .style("fill", "none")
      .attr("x", pitchLenght)
      .attr("y", pitchWidth/2 - 3.66)
      .attr("width", 2)
      .attr("height", 7.32);
  }

  function drawGoalsAsLine(lines) {
    lines
      .append("rect")
      .style("stroke-width", 0)
      .attr("x", -pitchstrokewidth*1.5)
      .attr("y", pitchWidth/2 - 3.66)
      .attr("width", pitchstrokewidth*3)
      .attr("height", 7.32);
    lines
      .append("rect")
      .style("stroke-width", 0)
      .attr("x", pitchLenght-pitchstrokewidth*1.5)
      .attr("y", pitchWidth/2 - 3.66)
      .attr("width", pitchstrokewidth*3)
      .attr("height", 7.32);
  }

  function chart(g) {
    g.each(function() {
      var pitch = d3Select(this).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", () => {
          let width = (clip.right - clip.left)
          let height = (clip.bottom - clip.top)
          let xdim, ydim, xpad, ypad;
          if (rotated) {
            xpad = height === pitchWidth ? 4 : 2;
            ypad = width === pitchLenght ? 4 : 2;
            xdim = (-clip.left + clip.right + ypad)
            ydim = (-clip.top + clip.bottom + xpad)
          } else {
            xpad = height === pitchWidth ? 4 : 2;
            ypad = width === pitchLenght ? 4 : 2;
            ydim = (-clip.top + clip.bottom + xpad)
            xdim = (-clip.left + clip.right + ypad)
          }
          return `-2 -2 ${xdim} ${ydim}`
        })
        .append("g")
        .attr("id", "pitch")
        .attr("transform", `translate(${- clip.left}, ${- clip.top})rotate(${rotated ? -90 : 0} 0 0)translate(${rotated ? -105 : 0} 0)`);

      pitch.append("g")
        .attr("id", "below")

      var lines = pitch.append("g")
        .attr("id", "lines")
        .attr("class", css.pitch)
        .attr("pointer-events", "none")

      // Halfway line
      lines
        .append("line")
        .style("stroke-width", pitchstrokewidth)
        .attr("x1", pitchLenght / 2)
        .attr("y1", 0)
        .attr("x2", pitchLenght / 2)
        .attr("y2", pitchWidth);

      // Centre circle 
      lines
        .append("circle")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", 'none')
        .attr("cx", pitchLenght / 2)
        .attr("cy", pitchWidth / 2)
        .attr("r", 9.15);
      lines
        .append("circle")
        .style("stroke-width", 0)
        .attr("cx", pitchLenght / 2)
        .attr("cy", pitchWidth / 2)
        .attr("r", pitchstrokewidth);

      // Penalty arcs
      var arc1 = d3Arc()
        .innerRadius(9.15)
        .outerRadius(9.15)
        .startAngle(38 * (Math.PI/180)) //converting from degs to radians
        .endAngle(142 * (Math.PI/180)); //just radians
      lines.append("path")
        .style("stroke-width", pitchstrokewidth)
        .attr("d", arc1)
        .attr("transform", "translate(11,"+pitchWidth/2+")");
      var arc2 = d3Arc()
        .innerRadius(9.15)
        .outerRadius(9.15)
        .startAngle(218 * (Math.PI/180)) //converting from degs to radians
        .endAngle(322 * (Math.PI/180)); //just radians
      lines.append("path")
        .style("stroke-width", pitchstrokewidth)
        .attr("d", arc2)
        .attr("transform", "translate(" + (pitchLenght - 11) +","+pitchWidth/2+")");

      // Goal areas
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", 'none')
        .attr("x", 0)
        .attr("y", pitchWidth/2 - 9.16)
        .attr("width", 5.5)
        .attr("height", 18.32);
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", 'none')
        .attr("x", pitchLenght-5.5)
        .attr("y", pitchWidth/2 - 9.16)
        .attr("width", 5.5)
        .attr("height", 18.32);

      // Penalty areas
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", "none")
        .attr("x", 0)
        .attr("y", pitchWidth/2 - 20.16)
        .attr("width", 16.5)
        .attr("height", 40.32);
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", "none")
        .attr("x", pitchLenght-16.5)
        .attr("y", pitchWidth/2 - 20.16)
        .attr("width", 16.5)
        .attr("height", 40.32);

      // Penalty marks
      lines
        .append("circle")
        .style("stroke-width", 0)
        .attr("cx", 11)
        .attr("cy", pitchWidth/2)
        .attr("r", pitchstrokewidth);
      lines
        .append("circle")
        .style("stroke-width", 0)
        .attr("cx", pitchLenght-11)
        .attr("cy", pitchWidth/2)
        .attr("r", pitchstrokewidth);

      // Direction of play
      if (dirOfPlay) {
        lines.append("polygon")
          .attr("class", css.shaded)
          .attr("points", `
                  25,${pitchWidth/2 - 2} 
                  35,${pitchWidth/2 - 2} 
                  35,${pitchWidth/2 - 5} 
                  40,${pitchWidth/2} 
                  35,${pitchWidth/2 + 5} 
                  35,${pitchWidth/2 + 2} 
                  25,${pitchWidth/2 + 2} 
                  25,${pitchWidth/2 - 2}
                `);
      }

      // Pitch boundaries
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .attr("fill", "none")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", pitchLenght)
        .attr("height", pitchWidth);

      // Goals
      drawGoalsFn(lines);

      pitch.append("g")
        .attr("id", "above")

      // Middle third
      if (shadeMiddleThird) {
        lines
          .append("rect")
          .attr("class", css.shaded)
          .attr("fill", "#fff")
          .attr("x", 35)
          .attr("y", 0)
          .attr("width", 35)
          .attr("height", pitchWidth);
      }
    });
  }

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = +_;
    width = (-clip.left + clip.right)/(-clip.top + clip.bottom)*height;
    return chart;
  };

  chart.width = function () {
    return width;
  };

  chart.rotate = function (_) {
    if (!arguments.length) return rotated;
    rotated = Boolean(_);
    return chart;
  };

  chart.showDirOfPlay = function (_) {
    if (!arguments.length) return dirOfPlay;
    dirOfPlay = Boolean(_);
    return chart;
  };

  chart.shadeMiddleThird = function (_) {
    if (!arguments.length) return shadeMiddleThird;
    shadeMiddleThird = Boolean(_);
    return chart;
  };

  chart.pitchStrokeWidth = function (_) {
    if (!arguments.length) return pitchstrokewidth;
    pitchstrokewidth = +_;
    return chart;
  };

  chart.goals = function (_) {
    if (!arguments.length) return drawGoalsFn;
    if (_ === "box")
      drawGoalsFn = drawGoalsAsBox;
    else if (_ === "line")
      drawGoalsFn = drawGoalsAsLine;
    else
      drawGoalsFn = _;
    return chart;
  };

  chart.clip = function (_) {
    if (!arguments.length) return [[clip.left, clip.top], [clip.right, clip.bottom]];
    clip = {top: _[0][1], bottom: _[1][1], left: _[0][0], right: _[1][0]};
    width = (-clip.left + clip.right)/(-clip.top + clip.bottom)*height;
    return chart;
  };

  return chart;
}
