import { select as d3Select } from "d3-selection";
import { actiontypePlotFn } from './actions';
import { spadlActionTypes, spadlBodyparts, spadlResults } from  '../config';
import css from '../styles/styles.css';

export default function() {

  var scale = 9,
    tableColumns = {
      "symbol": "",
      "team_name": "Team",
      "player_name": "Player",
      "type_id": "Type",
      "result_id": "Result"
    },
    teamColors = {};


  function tabulate(g, columns) {
    g.html("")
    var table = g.append("table"),
      thead = table.append("thead"),
      tbody = table.append("tbody")

    // append the header row
    thead.append("tr")
      .selectAll("th")
      .data(Object.values(columns))
      .enter()
      .append("th")
      .text(function(column) { return column; });
    return tbody
  }



  // For each small multiple…
  function chart(g) {
    g.each(function (data) {
      // Select a unique color for each team
      var defaultColors = ["#FDB913", "#87CEEB"];
      for (const action of data) {
        if (action.team_id in teamColors === false) {
          if (Object.keys(teamColors).length >= 2)
            throw "You specified ids of teams that do not occur in the data!"
          else
            teamColors[action.team_id] = defaultColors[Object.keys(teamColors).length]
        }
      }

      // create the table
      var elTable = d3Select(this).attr('class', css.actions_table);
      var tbody = tabulate(elTable, tableColumns);

      // Update the table
      var uTable = tbody.selectAll("tr")
        .data(data)

      var rows = uTable.enter()
        .append("tr")
        .attr('id', d => d.action_id);

      uTable.exit().remove();

      // create a cell in each row for each column
      rows.selectAll("td")
        .data(function(row, i) {
          return Object.keys(tableColumns).map(function(column) {
            return {column: column, value: row[column], i: i, data: row};
          });
        })
        .enter()
        .append("td")
        .each(function(d) {
          if (d.column === "symbol") {
            d3Select(this)
              .attr("class", d.column)
              .style("text-align", "center")
              .append('svg')
              .attr("height", 20)
              .attr("width", 20)
              .call(actiontypePlotFn[d.data.type_id]["symbol"], d.data, (d.i+1), teamColors[d.data.team_id], scale)
              .select('g')
              .attr('transform', 'translate(10,10)')
          } else {
            d3Select(this)
              .attr("class", d.column)
              .html(function(d) {
                if (d.column === "type_id") {
                  return spadlActionTypes[+d.value]['label']
                } else if (d.column === "result_id") {
                  return spadlResults[+d.value]['label']
                } else if (d.column === "bodypart_id") {
                  return spadlBodyparts[+d.value]['label']
                } else {
                  return d.value
                }
              });
          }
        })
    });

  }

  chart.tableColumns = function (d) {
    if (!arguments.length) return tableColumns;
    tableColumns = d;
    return chart;
  };

  chart.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };

  chart.teamColors = function (_) {
    if (!arguments.length) return teamColors;
    teamColors = _;
    return chart;
  };

  return chart;
}
