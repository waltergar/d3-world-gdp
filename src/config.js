const config = {
  encoding: "UTF-8",

  max_number: 100,

  showMessage: true,

  auto_sort: true,

  timeFormat: "%Y",

  reverse: false,

  color: {
  },

  changeable_color: false,

  color_range: ["#1177CC", "#113388"],

  itemLabel: "Top : ",

  yearLabel: "Year：",
  item_x: 250,

  interval_time: 1,

  text_y: -50,
  text_x: 1000,

  offset: 350,

  display_barInfo: 0,

  use_counter: true,

  step: 1,

  //////////////////////////////////////////////////////////////////////////////
  format: ",.0f",

  postfix: "",

  deformat: function(val, postfix) {
    return Number(val.replace(postfix, "").replace(/\,/g, ""));
  },
  //////////////////////////////////////////////////////////////////////////////

  left_margin: 250,
  right_margin: 150,
  top_margin: 180,
  bottom_margin: 0,

  dateLabel_switch: true,
  dateLabel_x: null,
  dateLabel_y: null,

  allow_up: false,

  enter_from_0: false,

  big_value: true,

  use_semilogarithmic_coordinate: false,

  long: false,

  wait: 2,

  update_rate: 1,

  showLabel: true,

  labelx: -10,

  use_img: false,

  imgs: {},

  background_color: "#EFEFEF",

  rounded_rectangle: true,

  show_x_tick: true,

  bar_name_max: 30,
  
  before_time_columns: 4,
  
  divide_by_column_no: 1,
  
  divide_color_by_column_no: 1,
  
  start_year: 1960,
  
  total_year: 57,
};
