import { select as d3Select } from "d3-selection";
import css from '../styles/styles.css';

export default function() {

  var hed = undefined;
  var subhed = undefined;
  var img = undefined;

  function chart(g) {
    g.each(function() {
      var header = d3Select(this).append('g')
        .attr('id', 'header')
        .attr('class', css.header);

      var defs = header.append("defs").attr("id", "imgdefs")

      var imgpattern = defs.append("pattern")
        .attr("id", "imgpattern")
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", "0")
        .attr("y", "0")
      imgpattern.append("image")
        .attr("x", 0)
        .attr("y", 10)
        .attr("height", 80)
        .attr("xlink:href", img)

      header.append("circle")
        .attr("class", css.circle)
        .attr("r", 40)
        .attr("cy", 50)
        .attr("cx", 50)
        .attr("fill", "url(#imgpattern)")
      header.append('text')
        .attr("class", css.h2)
        .attr("x", 110)
        .attr("y", 40)
        .text(subhed);
      header.append('text')
        .attr("class", css.h1)
        .attr("x", 110)
        .attr("y", 80)
        .attr("font-weight", 'bold')
        .text(hed);
    })
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
