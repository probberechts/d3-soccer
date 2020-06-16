import { select as d3Select } from "d3-selection";
import { arc as d3Arc } from "d3-shape";
import { pitchLenght, pitchWidth } from "../config";
import css from '../styles/styles.css';


export default function() {

  var margin = {top: 5, right: 5, bottom: 5, left: 5};
  var height = 300;
  var pitchstrokewidth = .5;
  var dirOfPlay = false;

  function chart(g) {
    g.each(function() {
      var pitch = d3Select(this).append("svg")
        .attr("width", pitchLenght/pitchWidth*height + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (pitchLenght + margin.left + margin.right) + " " + (pitchWidth + margin.top + margin.bottom) + "")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("id", "pitch")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
        .style("fill", '#00000000')
        .attr("cx", pitchLenght / 2)
        .attr("cy", pitchWidth / 2)
        .attr("r", 9.15);
      lines
        .append("circle")
        .style("stroke-width", 0)
        .attr("cx", pitchLenght / 2)
        .attr("cy", pitchWidth / 2)
        .attr("r", 0.4);

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
        .style("fill", '#00000000')
        .attr("x", 0)
        .attr("y", pitchWidth/2 - 9.16)
        .attr("width", 5.5)
        .attr("height", 18.32);
      lines
        .append("rect")
        .style("stroke-width", pitchstrokewidth)
        .style("fill", '#00000000')
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
        .attr("r", 0.4);
      lines
        .append("circle")
        .style("stroke-width", 0)
        .attr("cx", pitchLenght-11)
        .attr("cy", pitchWidth/2)
        .attr("r", 0.4);

      // Direction of play
      if (dirOfPlay) {
        lines.append("polygon")
          .style("fill", '#00000088')
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
        .append("line")
        .style("stroke-width", pitchstrokewidth)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", pitchLenght)
        .attr("y2", 0);
      lines
        .append("line")
        .style("stroke-width", pitchstrokewidth)
        .attr("x1", 0)
        .attr("y1", pitchWidth)
        .attr("x2", pitchLenght)
        .attr("y2", pitchWidth);
      lines
        .append("line")
        .style("stroke-width", pitchstrokewidth)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", pitchWidth);
      lines
        .append("line")
        .style("stroke-width", pitchstrokewidth)
        .attr("x1", pitchLenght)
        .attr("y1", 0)
        .attr("x2", pitchLenght)
        .attr("y2", pitchWidth);

      // Goals
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

      pitch.append("g")
        .attr("id", "above")
    });
  }

  chart.height = function (_) {
    if (!arguments.length) return height + margin.top + margin.bottom;
    height = +_;
    return chart;
  };

  chart.width = function () {
    return pitchLenght/pitchWidth*height + margin.left + margin.right;
  };

  chart.showDirOfPlay = function (_) {
    if (!arguments.length) return dirOfPlay;
    dirOfPlay = Boolean(_);
    return chart;
  };

  chart.pitchStrokeWidth = function (_) {
    if (!arguments.length) return pitchstrokewidth;
    pitchstrokewidth = +_;
    return chart;
  };

  return chart;
}
