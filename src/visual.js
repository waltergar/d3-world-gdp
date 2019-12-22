
$("#inputfile").change(function () {
  $("#inputfile").attr("hidden", true);
  var r = new FileReader();
  r.readAsText(this.files[0], config.encoding);
  r.onload = function () {
    var data = d3.csvParse(this.result);
    var divide_by = data.columns[config.divide_by_column_no - 1]; 
    var divide_color_by = data.columns[config.divide_color_by_column_no - 1];
    var before_time_column_list = data.columns.slice(0,config.before_time_columns);
    try {
      draw(data, divide_by, divide_color_by, before_time_column_list);
    } catch (error) {
      alert(error);
    }
  };
});

const draw = (
  data,
  divide_by,
  divide_color_by,
  before_time_column_list
) => {
  var {
    auto_sort,
    allow_up,
    background_color,
    big_value,
    changeable_color,
    color_range,
    deformat,
    display_barInfo,
    format,
    long,
    max_number,
    reverse,
    showMessage,
    timeFormat,
    use_semilogarithmic_coordinate,
    interval_time,
    step,
    itemLabel,
    item_x,
    yearLabel,
    text_x,
    text_y,
    offset,
    left_margin,
    right_margin,
    top_margin,
    bottom_margin,
  } = config;

  let rate = [];
  var baseTime = 3000;
  var colorRange = d3.interpolateCubehelix(color_range[0], color_range[1]);
  const margin = {
    left: left_margin,
    right: right_margin,
    top: top_margin,
    bottom: bottom_margin
  };

  const dataSort = () => {
    if (reverse) {
      currentData.sort(function (a, b) {
        if (Number(a.value) == Number(b.value)) {
          var r1 = 0;
          var r2 = 0;
          for (let index = 0; index < a[divide_by].length; index++) {
            r1 = r1 + a[divide_by].charCodeAt(index);
          }
          for (let index = 0; index < b[divide_by].length; index++) {
            r2 = r2 + b[divide_by].charCodeAt(index);
          }
          return r2 - r1;
        } else {
          return Number(a.value) - Number(b.value);
        }
      });
    } else {
      currentData.sort(function (a, b) {
        if (Number(a.value) == Number(b.value)) {
          var r1 = 0;
          var r2 = 0;
          for (let index = 0; index < a[divide_by].length; index++) {
            r1 = r1 + a[divide_by].charCodeAt(index);
          }
          for (let index = 0; index < b[divide_by].length; index++) {
            r2 = r2 + b[divide_by].charCodeAt(index);
          }
          return r2 - r1;
        } else {
          return Number(b.value) - Number(a.value);
        }
      });
    }
  }

  const change = () => {
    yScale.domain(currentData.map(d => d[divide_by]).reverse())
      .range([innerHeight, 0]);
    
    g.selectAll(".bar")
      .data(currentData, function (d) {
        return d[divide_by];
      })
      .transition("1")
      .duration(baseTime * update_rate * interval_time)
      .attr("transform", function (d) {
        return "translate(0," + yScale(yValue(d)) + ")";
      });
  }

  const getColor = (d) => {
    if (changeable_color) {
      var v = Math.abs(rate[divide_by] - rate["MIN_RATE"]) / (rate["MAX_RATE"] - rate["MIN_RATE"]);
      if (isNaN(v) || v == -1) {
        return colorRange(0.6);
      }
      return colorRange(v);
    }

    if (d[divide_color_by] in config.color)
      return config.color[d[divide_color_by]];
    else {
      return d3.schemeCategory10[
        Math.floor(d[divide_color_by].charCodeAt() % 10)
      ];
    }
  }

  const getCurrentData = (date) => {
    rate = [];
    currentData = [];
    indexList = [];

    data.forEach(element => {
        tmp_country = {};
        for (index in before_time_column_list)
          tmp_country[before_time_column_list[index]] = element[before_time_column_list[index]];
        
        tmp_country["value"] = element[date];
        currentData.push(tmp_country); 
    });

    rate["MAX_RATE"] = 0;
    rate["MIN_RATE"] = 1;
    currentData.forEach(e => {
      _cName = e[divide_by];
      lastData.forEach(el => {
        if (el[divide_by] == e[divide_by]) {
          rate[e[divide_by]] = Number(Number(e.value) - Number(el.value));
        }
      });
      if (rate[e[divide_by]] == undefined) {
        rate[e[divide_by]] = rate["MIN_RATE"];
      }
      if (rate[e[divide_by]] > rate["MAX_RATE"]) {
        rate["MAX_RATE"] = rate[e[divide_by]];
      } else if (rate[e[divide_by]] < rate["MIN_RATE"]) {
        rate["MIN_RATE"] = rate[e[divide_by]];
      }
    });
    
    dataSort();
    
    currentData = currentData.slice(0, max_number);

    d3.transition("2")
      .each(redraw)
      .each(change);
    lastData = currentData;
  }

  d3.select("body").attr("style", "background:" + background_color);

  var enter_from_0 = config.enter_from_0;
  interval_time /= 3;
  var lastData = [];
  var currentdate = config.start_year;
  var tmp_currentdate = currentdate.toString()
  var currentData = [];

  const svg = d3.select("svg");

  const width = svg.attr("width");
  const height = svg.attr("height");
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom - 32;
  const xValue = d => Number(d.value);
  const yValue = d => d[divide_by];

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  const xAxisG = g
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`);
  const yAxisG = g.append("g");

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", 100);

  var xScale = d3.scaleLinear();
  if (use_semilogarithmic_coordinate) {
    xScale = d3.scalePow().exponent(0.5);
  } else {
    xScale = d3.scaleLinear();
  }
  const yScale = d3
    .scaleBand()
    .paddingInner(0.3)
    .paddingOuter(0);

  const xTicks = 10;
  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(xTicks)
    .tickPadding(20)
    .tickFormat(d => {
      if (d <= 0) {
        return "";
      }
      return d;
    })
    .tickSize(-innerHeight);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickPadding(5)
    .tickSize(-innerWidth);

  var dateLabel_switch = config.dateLabel_switch;
  var dateLabel_x = config.dateLabel_x;
  var dateLabel_y = config.dateLabel_y;
  if (dateLabel_x == null || dateLabel_y == null) {
    dateLabel_x = innerWidth;
    dateLabel_y = innerHeight;
  }
  if (dateLabel_switch == false) {
    dateLabel_switch = "hidden";
  } else {
    dateLabel_switch = "visible";
  }
  var topLabel = g
    .insert("text")
    .attr("class", "topLabel")
    .attr("x", item_x)
    .attr("y", text_y);

  if (showMessage) {
    // Top Label
    var topInfo = g
      .insert("text")
      .attr("class", "growth")
      .attr("x", 0)
      .attr("y", text_y)
      .text(itemLabel);

    // Year Label
    g.insert("text")
      .attr("class", "growth")
      .attr("x", text_x)
      .attr("y", text_y)
      .text(yearLabel);

    // Year count
    var dateLabel = g
      .insert("text")
      .data(tmp_currentdate)
      .attr("class", "dateLabel")
      .attr("style:visibility", dateLabel_switch)
      .attr("x", text_x + offset)
      .attr("y", text_y)
      .attr("text-anchor", function () {
        return "end";
      })
      .text(tmp_currentdate);
  }

  var avg = 0;
  var lastname;
  var counter = { value: 1 };

  function redraw() {
    if (currentData.length == 0) return;

    if (big_value) {
      xScale
        .domain([
          2 * d3.min(currentData, xValue) - d3.max(currentData, xValue),
          d3.max(currentData, xValue) + 10
        ])
        .range([0, innerWidth]);
    } else {
      xScale
        .domain([0, d3.max(currentData, xValue) + 1])
        .range([0, innerWidth]);
    }
    if (auto_sort) {
      dateLabel
        .data(currentData)
        .transition()
        .duration(baseTime * interval_time)
        .ease(d3.easeLinear)
        .tween("text", function (d) {
          var self = this;
          var i = d3.interpolateDate(
            new Date(self.textContent),
            new Date(tmp_currentdate)
          );
          return function (t) {
            var dateformat = d3.timeFormat(timeFormat);
            self.textContent = dateformat(i(t));
          };
        });
    } else {
      dateLabel.text(tmp_currentdate);
    }

    xAxisG
      .transition()
      .duration(baseTime * interval_time)
      .ease(d3.easeLinear)
      .call(xAxis);
    yAxisG
      .transition()
      .duration(baseTime * interval_time)
      .ease(d3.easeLinear)
      .call(yAxis);

    yAxisG.selectAll(".tick").remove();
    if (!config.show_x_tick) {
      xAxisG.selectAll(".tick").remove();
    }

    yScale
      .domain(currentData.map(d => d[divide_by]).reverse())
      .range([innerHeight, 0]);

    var bar = g.selectAll(".bar").data(currentData, function (d) {
      return d[divide_by];
    });

    if (showMessage) {
      // 꼭대기 Top, Year value 바껴주는거야!
      topLabel.data(currentData).text(function (d) {
        if (lastname == d[divide_by]) {
          counter.value = counter.value + step;
        } else {
          counter.value = 1;
        }
        lastname = d[divide_by];
        if (d[divide_by].length > 24) return d[divide_by].slice(0, 23) + "...";
        return d[divide_by];
      });
    }

    var barEnter = bar
      .enter()
      .insert("g", ".axis")
      .attr("class", "bar")
      .attr("transform", function (d) {
        return "translate(0," + yScale(yValue(d)) + ")";
      });

    barEnter
      .append("rect")
      .attr("width", function (d) {
        if (enter_from_0) {
          return 0;
        } else {
          return xScale(currentData[currentData.length - 1].value);
        }
      })
      .attr("fill-opacity", 0)
      .attr("height", 30)
      .attr("y", 50)
      .style("fill", d => getColor(d))
      .transition("a")
      .delay(500 * interval_time)
      .duration(2490 * interval_time)
      .attr("y", 0)
      .attr("width", d => xScale(xValue(d)))
      .attr("fill-opacity", 1);

    if (config.rounded_rectangle) {
      d3.selectAll("rect").attr("rx", 13);
    }
    if (config.showLabel == true) {
      barEnter
        .append("text")
        .attr("y", 50)
        .attr("fill-opacity", 0)
        .style("fill", d => getColor(d))
        .transition("2")
        .delay(500 * interval_time)
        .duration(2490 * interval_time)
        .attr("fill-opacity", 1)
        .attr("y", 0)
        .attr("class", function (d) {
          return "label ";
        })
        .attr("x", config.labelx)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .text(function (d) {
          if (long) {
            return "";
          }
          return d[divide_by];
        });
    }

    // bar
    var barInfo = barEnter
      .append("text")
      .attr("x", function (d) {
        if (long) return 10;
        if (enter_from_0) {
          return 0;
        } else {
          return xScale(currentData[currentData.length - 1].value);
        }
      })
      .attr("stroke", d => getColor(d))
      .attr("class", function () {
        return "barInfo";
      })
      .attr("y", 50)
      .attr("stroke-width", "0px")
      .attr("fill-opacity", 0)
      .transition()
      .delay(500 * interval_time)
      .duration(2490 * interval_time)
      .text(function (d) {
        return d[divide_by];
      })
      .attr("x", d => {
        if (long) return 10;
        return xScale(xValue(d)) - 10;
      })
      .attr("fill-opacity", function (d) {
        if (xScale(xValue(d)) - 10 < display_barInfo) {
          return 0;
        }
        return 1;
      })
      .attr("y", 2)
      .attr("dy", ".5em")
      .attr("text-anchor", function () {
        if (long) return "start";
        return "end";
      })
      .attr("stroke-width", function (d) {
        if (xScale(xValue(d)) - 10 < display_barInfo) {
          return "0px";
        }
        return "1px";
      });
    if (long) {
      barInfo.tween("text", function (d) {
        var self = this;
        self.textContent = d.value;
        var i = d3.interpolate(self.textContent, Number(d.value)),
          prec = (Number(d.value) + "").split("."),
          round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1;
        return function (t) {
          self.textContent =
            d[divide_by] +
            "  数值:" +
            d3.format(format)(Math.round(i(t) * round) / round);
        };
      });
    }
    if (!long) {
      barEnter
        .append("text")
        .attr("x", function () {
          if (long) {
            return 10;
          }
          if (enter_from_0) {
            return 0;
          } else {
            return xScale(currentData[currentData.length - 1].value);
          }
        })
        .attr("y", 50)
        .attr("fill-opacity", 0)
        .style("fill", d => getColor(d))
        .transition()
        .duration(2990 * interval_time)
        .tween("text", function (d) {
          var self = this;
          self.textContent = d.value * 0.9;
          var i = d3.interpolate(self.textContent, Number(d.value)),
            prec = (Number(d.value) + "").split("."),
            round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1;
          return function (t) {
            self.textContent = d3.format(format)(
              Math.round(i(t) * round) / round
            ) + config.postfix;
          };
        })
        .attr("fill-opacity", 1)
        .attr("y", 0)
        .attr("class", function (d) {
          return "value";
        })
        .attr("x", d => {
          return xScale(xValue(d)) + 10;
        })
        .attr("y", 22);
    }
    var barUpdate = bar
      .transition("2")
      .duration(2990 * interval_time)
      .ease(d3.easeLinear);

    barUpdate
      .select("rect")
      .style("fill", d => getColor(d))
      .attr("width", d => xScale(xValue(d)));
    if (config.showLabel == true) {
      barUpdate
        .select(".label")
        .attr("class", function (d) {
          return "label ";
        })
        .style("fill", d => getColor(d))
        .attr("width", d => xScale(xValue(d)));
    }
    if (!long) {
      barUpdate
        .select(".value")
        .attr("class", function (d) {
          return "value";
        })
        .style("fill", d => getColor(d))
        .attr("width", d => xScale(xValue(d)));
    }
    barUpdate.select(".barInfo").attr("stroke", function (d) {
      return getColor(d);
    });

    var barInfo = barUpdate
      .select(".barInfo")
      .text(function (d) {
        return d[divide_by];
      })
      .attr("x", d => {
        if (long) return 10;
        return xScale(xValue(d)) - 10;
      })
      .attr("fill-opacity", function (d) {
        if (xScale(xValue(d)) - 10 < display_barInfo) {
          return 0;
        }
        return 1;
      })
      .attr("stroke-width", function (d) {
        if (xScale(xValue(d)) - 10 < display_barInfo) {
          return "0px";
        }
        return "1px";
      });

    if (long) {
      barInfo.tween("text", function (d) {
        var self = this;
        var str = d[divide_by];

        var i = d3.interpolate(
            self.textContent.slice(str.length, 99),
            Number(d.value)
          ),
          prec = (Number(d.value) + "").split("."),
          round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1;
        return function (t) {
          self.textContent =
            d[divide_by] +
            d3.format(format)(Math.round(i(t) * round) / round);
        };
      });
    }
    if (!long) {
      barUpdate
        .select(".value")
        .tween("text", function (d) {
          var self = this;

          // if postfix is blank, do not slice.
          if (config.postfix == "") {
            var i = d3.interpolate(self.textContent, Number(d.value));
          } else {
            var i = d3.interpolate(self.textContent.slice(0, -config.postfix.length), Number(d.value));
          }

          var i = d3.interpolate(deformat(self.textContent, config.postfix), Number(d.value))

          var prec = (Number(d.value) + "").split("."),
            round = prec.length > 1 ? Math.pow(10, prec[1].length) : 1;
          // d.value = self.textContent
          return function (t) {
            self.textContent = d3.format(format)(
              Math.round(i(t) * round) / round
            ) + config.postfix;
            // d.value = self.textContent
          };
        })
        .duration(2990 * interval_time)
        .attr("x", d => xScale(xValue(d)) + 10);
    }
    avg = (Number(currentData[0][tmp_currentdate]) +  Number(currentData[currentData.length - 1][tmp_currentdate])) / 2;

    var barExit = bar
      .exit()
      .attr("fill-opacity", 1)
      .transition()
      .duration(2500 * interval_time);
    barExit
      .attr("transform", function (d) {
        if (Number(d.value) > avg && allow_up) {
          return "translate(0," + "-100" + ")";
        }
        return "translate(0," + "1000" + ")";
      })
      .remove()
      .attr("fill-opacity", 0);
    barExit
      .select("rect")
      .attr("fill-opacity", 0)
      .attr("width", xScale(currentData[currentData.length - 1][tmp_currentdate]));
    if (!long) {
      barExit
        .select(".value")
        .attr("fill-opacity", 0)
        .attr("x", () => {
          return xScale(currentData[currentData.length - 1][tmp_currentdate]);
        });
    }
    barExit
      .select(".barInfo")
      .attr("fill-opacity", 0)
      .attr("stroke-width", function (d) {
        return "0px";
      })
      .attr("x", () => {
        if (long) return 10;
        return xScale(currentData[currentData.length - 1][tmp_currentdate]);
      });
    barExit.select(".label").attr("fill-opacity", 0);
  }
  
  var i = 0;
  var p = config.wait;
  var update_rate = config.update_rate;
  var inter = setInterval(function next() {
    while (p) {
      p -= 1;
      return;
    }
    currentdate += 1;
    tmp_currentdate = currentdate.toString()
    getCurrentData(tmp_currentdate);
    i++;

    if (i >= config.total_year) {
      window.clearInterval(inter);
    }
  }, baseTime * interval_time);
}