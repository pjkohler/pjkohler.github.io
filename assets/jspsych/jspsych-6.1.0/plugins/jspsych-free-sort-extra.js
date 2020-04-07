/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of items
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */


jsPsych.plugins['free-sort'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort', 'stimuli', 'item');

  plugin.info = {
    name: 'free-sort',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'items to be displayed.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus height',
        default: 100,
        description: 'Height of items in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus width',
        default: 100,
        description: 'Width of items in pixels'
      },
      scale_factor: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stimulus scaling factor',
        default: 1.5,
        description: 'How much larger to make the stimulus while moving (1 = no scaling)'
      },
      sort_area_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area height',
        default: 800,
        description: 'The height of the container that subjects can move the stimuli in.'
      },
      sort_area_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sort area width',
        default: 800,
        description: 'The width of the container that subjects can move the stimuli in.'
      },
      sort_area_shape: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Sort area shape',
        options: ['square','ellipse'],
        default: 'ellipse',
        description: 'The shape of the sorting area'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
      },
      prompt_location: {
        type: jsPsych.plugins.parameterType.SELECT,
        pretty_name: 'Prompt location',
        options: ['above','below'],
        default: 'above',
        description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'continue',
        description: 'The text that appears on the button to continue to the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var start_time = performance.now();

    var html = 
      '<div '+
      'id="jspsych-free-sort-arena" '+
      'class="jspsych-free-sort-arena" '+
      'style="position: relative; width:'+trial.sort_area_width+'px; height:'+trial.sort_area_height+'px; border:'+trial.sort_area_height*.05+'px solid #fc9272; margin: auto; line-height: 0em; ';
    
    if ( trial.sort_area_shape == "ellipse") {
      html += 'webkit-border-radius: 50%; moz-border-radius: 50%; border-radius: 50%"></div>'
    } else {
      html += 'webkit-border-radius: 0%; moz-border-radius: 0%; border-radius: 0%"></div>'
    }

    // variable that has the prompt text, counter and button
    var html_text = '<div style="line-height: 0em">' + trial.prompt + 
      '<p id="jspsych-free-sort-counter" style="display: inline-block; line-height: 1em">You still need to place ' + trial.stimuli.length + ' items inside the arena.</p>' +
      '<button id="jspsych-free-sort-done-btn" class="jspsych-btn" '+ 
      'style="display: none; margin: 5px; padding: 5px; text-align: center; font-weight: bold; font-size: 18px; vertical-align:baseline; line-height: 1em">' + trial.button_label+'</button></div>'
    // check if there is a prompt and if it is shown above
    if (trial.prompt_location == "below") {
        html += html_text
    } else {
        html = html_text + html
    }

    display_element.innerHTML = html;

    // store initial location data
    var init_locations = [];

    num_rows = Math.ceil(Math.sqrt(trial.stimuli.length))
    if ( num_rows % 2 == 0) {
      num_rows = num_rows + 1
    }

    var right_coords = [];
    var left_coords = [];
    for (x of make_arr(0, trial.sort_area_width-trial.stim_width, num_rows) ) {
      for (y of make_arr(0, trial.sort_area_height-trial.stim_height, num_rows) ) {
        if ( x > (trial.sort_area_width  * .5) ) {
            right_coords.push({ x:x + trial.sort_area_width * .5 , y:y });
        } else if ( x < (trial.sort_area_width  * .5 - trial.stim_width) ) {
            left_coords.push({ x:x - trial.sort_area_width * .5, y:y});
        }
      }
    }

    // repeat coordinates until you have enough coords
    while ( ( right_coords.length + left_coords.length ) < trial.stimuli.length ) {
      right_coords = right_coords.concat(right_coords)
      left_coords = left_coords.concat(left_coords)
    }

    //right_coords = shuffle(right_coords);
    //left_coords = shuffle(left_coords);
    trial.stimuli = shuffle(trial.stimuli);

    var inside = []
    for (var i = 0; i < trial.stimuli.length; i++) {
      var coords = []
      if ( (i % 2) == 0 ) {
        coords = right_coords[Math.floor(i * .5)];
      } else {
        coords = left_coords[Math.floor(i * .5)];
      }
      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img '+
        'src="'+trial.stimuli[i]+'" '+
        'data-src="'+trial.stimuli[i]+'" '+
        'class="jspsych-free-sort-draggable" '+
        'draggable="false" '+
        'id="'+i+'" '+
        'style="position: absolute; cursor: move; width:'+trial.stim_width+'px; height:'+trial.stim_height+'px; top:'+coords.y+'px; left:'+coords.x+'px;">'+
        '</img>';

      init_locations.push({
        "src": trial.stimuli[i],
        "x": coords.x,
        "y": coords.y
      });
      inside.push(false);
    }

    // display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" class="jspsych-btn">'+trial.button_label+'</button>';

    var maxz = 1;

    var moves = [];

    var cur_in = false

    var draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable');

    var arena = display_element.querySelector("#jspsych-free-sort-arena")
    var button = display_element.querySelector('#jspsych-free-sort-done-btn')

    for(var i=0;i<draggables.length; i++){
      draggables[i].addEventListener('mousedown', function(event){
        var x = event.pageX - event.currentTarget.offsetLeft;
        var y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
        var elem = event.currentTarget;
        elem.style.zIndex = ++maxz;
        elem.style.transform = "scale(" + trial.scale_factor + "," + trial.scale_factor + ")";
        var mousemoveevent = function(e){
          cur_in = inside_ellipse(e.clientX - x, e.clientY - y, 
              trial.sort_area_width*.5 - trial.stim_width*.5, trial.sort_area_height*.5 - trial.stim_height*.5, 
              trial.sort_area_width*.5, trial.sort_area_height*.5,
              trial.sort_area_shape == "square");
          elem.style.top =  Math.min(trial.sort_area_height - trial.stim_height, Math.max(-trial.stim_height*.5, (e.clientY - y))) + 'px';
          elem.style.left = Math.min(trial.sort_area_width*1.5  - trial.stim_width,  Math.max(-trial.sort_area_width*.5, (e.clientX - x)))+ 'px';
          if (cur_in) {
            arena.style.borderColor = "#a1d99b";
            arena.style.background = "None";
          } else {
            arena.style.borderColor = "#fc9272";
            arena.style.background = "None";
          }
          // replace in overall array, grab idx from item id
          inside.splice(elem.id, true, cur_in)
          if (inside.every(Boolean)) {
            arena.style.background = "#a1d99b";
            button.style.display = "inline-block";
            display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "All items placed. Feel free to reposition any item if necessary. Otherwise, click here to "
          } else {
            arena.style.background = "none";
            button.style.display = "none";
            if ( (inside.length - inside.filter(Boolean).length) > 1 ) {
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "You still need to place " + (inside.length - inside.filter(Boolean).length) + " items inside the arena."
            } else {
              display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "You still need to place " + (inside.length - inside.filter(Boolean).length) + " item inside the arena."
            }
          }
        }
        document.addEventListener('mousemove', mousemoveevent);

        var mouseupevent = function(e){
          document.removeEventListener('mousemove', mousemoveevent);
          elem.style.transform = "scale(1, 1)";
          if (inside.every(Boolean)) {
            arena.style.background = "#a1d99b";
            arena.style.borderColor = "#a1d99b";
            // button.style.display = "inline-block";
            // display_element.querySelector("#jspsych-free-sort-counter").innerHTML = "All items placed. Feel free to reposition any item if necessary. Otherwise, click here to "
          } else {
            arena.style.background = "none";
            arena.style.borderColor = "#fc9272";
            // button.style.display = "none";
          }
          moves.push({
            "src": elem.dataset.src,
            "x": elem.offsetLeft,
            "y": elem.offsetTop
          });
          document.removeEventListener('mouseup', mouseupevent);
        }
        document.addEventListener('mouseup', mouseupevent);
      });
    }

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){
      
      //display_element.querySelectorAll('.jspsych-free-sort-counter').innerHTML = inside.filter(Boolean).length + ' out of ' + inside.length + '</div>'
      if (inside.every(Boolean)) {
        var end_time = performance.now();
        var rt = end_time - start_time;
        // gather data
        // get final position of all items
        var final_locations = [];
        var matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
        for(var i=0; i<matches.length; i++){
          final_locations.push({
            "src": matches[i].dataset.src,
            "x": parseInt(matches[i].style.left),
            "y": parseInt(matches[i].style.top)
          });
        }

        var trial_data = {
          "init_locations": JSON.stringify(init_locations),
          "moves": JSON.stringify(moves),
          "final_locations": JSON.stringify(final_locations),
          "rt": rt
        };

        // advance to next part
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      }
    });
  };

  // helper functions

  function shuffle(array) {
    
    var cur_idx = array.length, tmp_val, rand_idx;

    // While there remain elements to shuffle...
    while (0 !== cur_idx) {

    // Pick a remaining element...
    rand_idx = Math.floor(Math.random() * cur_idx);
    cur_idx -= 1;

    // And swap it with the current element.
    tmp_val = array[cur_idx];
    array[cur_idx] = array[rand_idx];
    array[rand_idx] = tmp_val;
  }
  return array;
}
  
  function make_arr(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
  }

  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  function car2pol(x, y){
    distance = Math.sqrt(x*x + y*y)
    radians = Math.atan2(y,x) //This takes y first
    polar = { distance:distance, radians:radians }
    return polar
  }

  function pol2car(polar) {
    car = { x:polar.distance * Math.cos(polar.radians), y:polar.distance * Math.sin(polar.radians) }
    return car
  }

  function inside_ellipse(x, y, x0, y0, rx, ry, square=false) {
    if (square) {
      result = ( Math.abs(x - x0) <= rx ) && ( Math.abs(y - y0) <= ry )
    } else {
      result = (( x - x0 ) * ( x - x0 )) * (ry * ry) + ((y - y0) * ( y - y0 )) * ( rx * rx ) <= ( (rx * rx) * (ry * ry) )
    }
    return result 
  }

  return plugin;
})();
