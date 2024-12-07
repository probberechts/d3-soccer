import { select as d3Select } from "d3-selection";

export default function () {
  var hed = undefined;
  var subhed = undefined;
  var img = undefined;

  function chart(g) {
    g.each(function () {
      var header = d3Select(this).append("g").attr("class", "header");

      var defs = header.append("defs").attr("id", "imgdefs");

      var imgpattern = defs
        .append("pattern")
        .attr("id", "imgpattern")
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", "0")
        .attr("y", "0");
      imgpattern
        .append("image")
        .attr("x", 0)
        .attr("y", 10)
        .attr("height", 80)
        .attr("xlink:href", img);

      header
        .append("circle")
        .attr("class", "circle")
        .attr("r", 40)
        .attr("cy", 50)
        .attr("cx", 50)
        .attr("stroke", "#333")
        .attr("fill", "url(#imgpattern)");
      header
        .append("text")
        .attr("class", "h2")
        .attr("x", 110)
        .attr("y", 40)
        .attr("font-size", "21px")
        .attr("fill", "#333")
        .text(subhed);
      header
        .append("text")
        .attr("class", "h1")
        .attr("x", 110)
        .attr("y", 80)
        .attr("font-weight", "bold")
        .attr("font-size", "32px")
        .attr("fill", "black")
        .text(hed);
    });
  }

  chart.hed = function (_) {
    if (!arguments.length) return hed;
    hed = _;
    return chart;
  };

  chart.subhed = function (_) {
    if (!arguments.length) return subhed;
    subhed = _;
    return chart;
  };

  chart.img = function (_) {
    if (!arguments.length) return img;
    img = _;
    return chart;
  };

  return chart;
}
