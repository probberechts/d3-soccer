import { select as d3Select, event as d3Event } from "d3-selection";
import { spadlActionTypes, spadlBodyparts, spadlResults } from '../config';
import css from '../styles/styles.css';

export default function() {

  var tooltip = d3Select("#tooltip");

  function chart(g) {
      if (!tooltip.size()) {
        tooltip = g
          .append("div")
          .attr("class", css.tooltip)
          .attr("id", "tooltip");
      }
  }

  chart.show = function (d) {
      tooltip
      .html(`
        <table>
          <tr>
            <th colspan="2">${spadlActionTypes[d.type_id].label}</th>
          <tr>
            <td>Player</td>
            <td>${d.player_name || d.player_id}</td>
          </tr>
          <tr>
            <td>Team</td>
            <td>${d.team_name || d.team_id}</td>
            </tr>
          <tr>
            <td>Result</td>
            <td>${spadlResults[d.result_id].label}</td>
            </tr>
          <tr>
            <td>Body part</td>
            <td>${spadlBodyparts[d.bodypart_id].label}</td>
            </tr>
          <tr>
            <td>Time</td>
            <td>${Math.floor(d.time_seconds / 60)} min ${d.time_seconds % 60} sec</td>
            </tr>
          <tr>
            <td>Start</td>
            <td>x=${d.start_x.toFixed(2)} , y=${d.start_y.toFixed(2)}</td>
            </tr>
          <tr>
            <td>End</td>
            <td>x=${d.end_x.toFixed(2)} , y=${d.end_y.toFixed(2)}</td>
          </tr>
        </table>
      `)
      tooltip
        .style("opacity", .95)
        .style("left", d3Event.pageX + "px")
        .style("top", d3Event.pageY + "px");
    return chart;
  };

  chart.hide = function () {
    tooltip
      .style("opacity", 0)
    return chart;
  };

  return chart;
}
