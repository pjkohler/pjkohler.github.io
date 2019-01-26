var x, y, z, eyesize, dotsize, eyesep, move_x, dots_per_row, filled_per_row, frame_width, rand_idx;
var testrow;
var refrow;
var col;
var ref_c = [];
var left_c = [];
var right_c = [];
var perc_c = [];
var disp_list = [];
var test_x = [];
var alt_x = [];
var test_y = [];
var alt_y = [];
var ref_x = [];
var ref_y = [];
var myFont;
var pg_3D;

// gui params
var reference = true
var dot_movement = ['anti-phase','in-phase']
var plane_breaking = false
var vertical = false
var highlight_bars = false
var highlight_dots = false
//var interocularly = ['correlated','uncorrelated']
var interocular_correlation = true;

// colors
var color_blue, color_red, color_green, color_pink, light_gray, mid_gray, dark_gray, bg_color, l_color, r_color, h_color;

// gui
var visible = true;
var gui

// canvas stuff
var canvas, canvas_div, width, div_rect, c_size; 

// random dot
var test_rand, ref_rand, alt_rand;

function setup() {
  pic_count = 0;
  print_image = 1;
  c_size = 800;
  max_width = 600;
  // 1400 x 900 (double width to make room for each "sub-canvas")
  // get the image size
  canvas_div = document.getElementById('p5-holder');
  width = canvas_div.offsetWidth;
  if (width > max_width) {
    width = max_width;
  }
  canvas = createCanvas(width, width);
  canvas.parent('p5-holder');
  rectMode(CORNER);

  div_rect = canvas_div.getBoundingClientRect();
  //console.log(div_rect.top, div_rect.right, div_rect.bottom, div_rect.left);

  // colors
  light_gray = 204
  dark_gray = 102
  mid_gray = 128
  color_blue = color(31, 119, 180)
  color_red = color(214, 39, 40)
  color_pink = color(227, 119, 194)
  color_orange = color(253, 127, 40)
  color_green = color(44, 160, 44)
  bg_color = color(227, 119, 194)//color('#F8F6EA');

  // Create both of your off-screen graphics buffers
  left_buffer = createGraphics(c_size, c_size);
  right_buffer = createGraphics(c_size, c_size, WEBGL);
  right_buffer.rotateY(-PI/12);
  right_buffer.translate(0,0,-30)

  // clear background
  frameRate(4);
  eyesize = 360;
  eyesep = eyesize * 1.1;
  dotsize = 9;
  dots_per_row = eyesize / 4 / dotsize;
  if (dots_per_row % 1 != 0) {
    print("dots per row not integer, exiting ...");
    exit();
  }
  filled_per_row = 3;
  if (filled_per_row > dots_per_row / 2) {
    print("filled_per_row more than twice the size of dots_per_row, exiting ...");
    exit();
  }

  for (var h = 0; h < eyesize * 2; h += dotsize) {
    for (var v = 0; v < 4; v += 1) {
      // loop over for rows
      var rand_list = [];
      for (var q = 0; q < dots_per_row; q += 1) {
        append(rand_list, q);
      }
      rand_list = shuffle_list(rand_list);
      for (var q = 0; q < filled_per_row; q += 1) {
        rand_idx = rand_list[q];
        raw_y = dotsize * rand_idx + dots_per_row * v * dotsize;
        if (v == 0 || v == 2) {
          ref_x = append(ref_x, h + dotsize / 2 - eyesize);
          ref_y = append(ref_y, raw_y + dotsize / 2 - eyesize / 2);
        } else {
          test_x = append(test_x, h + dotsize / 2 - eyesize);
          test_y = append(test_y, raw_y + dotsize / 2 - eyesize / 2);
          // alternate positions, different from the ones chosen
          rand_idx = rand_list[int(q + filled_per_row)];
          raw_y = dotsize * rand_idx + dots_per_row * v * dotsize;
          alt_x = append(alt_x, h + dotsize / 2 - eyesize);
          alt_y = append(alt_y, raw_y + dotsize / 2 - eyesize / 2);
        }
      }
    }
  }
  test_rand = int(random(1, test_x.length+1));
  ref_rand = int(random(1, ref_x.length+1));
  alt_rand = int(random(1, alt_x.length+1));
}

function draw() {
  clear();
  if (plane_breaking) {
    if (move_x <= 0) {
      move_x = dotsize; //dotsize*2.4; 
    } else {
      move_x = -dotsize; //dotsize*2.4; 
    }
  } else {
    if (move_x <= 0) {
      move_x = dotsize * 2;
    } else {
      move_x = 0;
    }
  }

  if (highlight_dots) {
    while ( (abs(test_x[test_rand] - move_x) > eyesize/2) || (abs(test_x[test_rand] + move_x) > eyesize/2) ) {
      test_rand = int(random(1, test_x.length+1));
    }
    while ( (abs(alt_x[alt_rand] - move_x) > eyesize/2) || (abs(alt_x[alt_rand] + move_x) > eyesize/2) ) {
      alt_rand = int(random(1, alt_x.length+1));
    }
    while ( (abs(ref_x[ref_rand]) > eyesize/2) || (abs(ref_x[ref_rand]) > eyesize/2) ) {
      ref_rand = int(random(1, ref_x.length+1));
    }
  }
  // Draw on your buffers however you like
  draw_left(move_x);
  draw_right(move_x);
  
  width = canvas_div.offsetWidth;
  if (width > max_width) {
    width = max_width;
  }
  // Paint the off-screen buffers onto the main canvas
  image(left_buffer, 0, 0, width, width);
  image(right_buffer, width*.2, -width*.25, width, width);

}

function windowResized() {
  if (canvas_div.offsetWidth != width) {
    width = canvas_div.offsetWidth;
    if (width > max_width) {
      width = max_width;
      //print(width)
    }
  }
  resizeCanvas(width, width);
}

function draw_left(move_x) {
  left_buffer.clear()
  if (frameCount == 1) {
    div_rect = canvas_div.getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    // Create Layout GUI
    gui = createGui('Settings', 0, div_rect.top*.9);
    gui.addGlobals('dot_movement','reference','plane_breaking','vertical','interocular_correlation','highlight_bars','highlight_dots');
  }
  if (dot_movement === "anti-phase") {
    h_color = color_green
  } else {
    h_color = color_orange
  }

  left_buffer.rectMode(CORNER);
  left_buffer.strokeWeight(0);
  // clear background and draw text
  left_buffer.textFont("Helvetica");
  left_buffer.textSize(32)
  left_buffer.textAlign(CENTER, BOTTOM);
  left_buffer.push();
  left_buffer.fill(color_blue);
  left_buffer.text("left eye", eyesize/2, c_size - eyesize);
  left_buffer.fill(color_red);
  left_buffer.text("right eye", eyesize/2 + eyesep, c_size - eyesize);
  left_buffer.pop();
  // draw eyes
  left_buffer.push();
  left_buffer.stroke(color(0));
  left_buffer.fill(color(0));
  left_buffer.strokeWeight(0);
  left_buffer.rect(0, c_size - eyesize, eyesize, eyesize);
  left_buffer.rect(eyesep, c_size - eyesize, eyesize, eyesize);
  left_buffer.pop();
  // plot gray bars
  if (highlight_bars) {
    for (var i = 0; i < 2; i++) {
      left_buffer.strokeWeight(0);
      if (vertical) {
        var bar_h = eyesize
        var bar_w = eyesize/4
        left_buffer.fill(dark_gray);
        left_buffer.rect(eyesep * i, c_size - bar_h, eyesize / 4, eyesize);
        left_buffer.fill(mid_gray);
        left_buffer.rect(eyesep * i + bar_w, c_size - bar_h, eyesize / 4, eyesize);
        left_buffer.fill(dark_gray);
        left_buffer.rect(eyesep * i + bar_w * 2, c_size - bar_h, eyesize / 4, eyesize);
        left_buffer.fill(mid_gray);
        left_buffer.rect(eyesep * i + bar_w * 3, c_size - bar_h, eyesize / 4, eyesize);
      } else {
        var bar_h = eyesize/4
        var bar_w = eyesize
        left_buffer.fill(dark_gray);
        left_buffer.rect(eyesize/2 + eyesep * i - bar_w/2, c_size - eyesize, bar_w, bar_h);
        left_buffer.fill(mid_gray);
        left_buffer.rect(eyesize/2 + eyesep * i - bar_w/2, c_size - eyesize + bar_h, bar_w, bar_h);
        left_buffer.fill(dark_gray);
        left_buffer.rect(eyesize/2 + eyesep * i - bar_w/2, c_size - eyesize + bar_h*2, bar_w, bar_h);
        left_buffer.fill(mid_gray);
        left_buffer.rect(eyesize/2 + eyesep * i - bar_w/2, c_size - bar_h, bar_w, bar_h);
      }
    }
  }
  left_buffer.push();
  // compute coordinates
  for (var i = 0; i < test_x.length; i++) {
    ref_c[0] = ref_x[i];
    ref_c[1] = ref_y[i];
    left_c[0] = test_x[i] + move_x;
    left_c[1] = test_y[i];
    if (dot_movement === "anti-phase") {
      if (interocular_correlation === false) {
        right_c[0] = alt_x[i] - move_x;
        right_c[1] = alt_y[i];
      } else {
        right_c[0] = test_x[i] - move_x;
        right_c[1] = test_y[i];
      }
      perc_c[0] = test_x[i];
      perc_c[1] = test_y[i];
    } else {
      if (interocular_correlation === false) {
        right_c[0] = alt_x[i] + move_x;
        right_c[1] = alt_y[i];
      } else {
        right_c[0] = test_x[i] + move_x;
        right_c[1] = test_y[i];
      }
      perc_c[0] = test_x[i] + move_x;
      perc_c[1] = test_y[i];
    }
    if (vertical) {
      ref_c = reverse(ref_c);
      left_c = reverse(left_c);
      right_c = reverse(right_c);
      perc_c = reverse(perc_c);
    }
    // draw illustration dots
    // reference
    l_color = color_blue;
    r_color = color_red;
    if (i == ref_rand && highlight_dots) {
      l_color = h_color;
      r_color = h_color;
    }
    if (reference && abs(ref_c[0]) < eyesize / 2 && abs(ref_c[1]) < eyesize / 2) {
      left_buffer.fill(l_color);
      left_buffer.rect(eyesize/2 + ref_c[0] - dotsize/2, c_size-eyesize/2 + ref_c[1] - dotsize/2, dotsize, dotsize);
      left_buffer.fill(r_color);
      left_buffer.rect(eyesize/2 + eyesep + ref_c[0] - dotsize/2, c_size-eyesize/2 +  ref_c[1] - dotsize/2, dotsize, dotsize);
    }
    // test
    l_color = color_blue;
    r_color = color_red;
    if (highlight_dots) {
      if (interocular_correlation === false) {
        if (i == alt_rand) {
          //l_color = color_orange;
          //r_color = color_orange;
        }
      } else {
        if (i == test_rand) {
          l_color = h_color;
          r_color = h_color;
        }
      }
    }
    if ((abs(left_c[0])) < eyesize / 2 && abs(left_c[1]) < eyesize / 2) {
      left_buffer.fill(l_color);
      left_buffer.rect(eyesize/2 +  left_c[0] - dotsize/2, c_size-eyesize/2 + left_c[1] - dotsize/2, dotsize, dotsize);
    }
    if ((abs(right_c[0])) < eyesize / 2 && abs(right_c[1]) < eyesize / 2) {
      left_buffer.fill(r_color);
      left_buffer.rect(eyesize/2 + eyesep + right_c[0] - dotsize/2, c_size-eyesize/2 + right_c[1] - dotsize/2, dotsize, dotsize);
    }
  }
  left_buffer.pop();
}

function draw_right() {
  right_buffer.clear()
  right_buffer.rectMode(CORNER);
  right_buffer.strokeWeight(0);

  if (interocular_correlation === false) {
    left_buffer.textFont("Helvetica");
    left_buffer.textSize(32)
    left_buffer.textAlign(CENTER, BOTTOM);
    left_buffer.fill(h_color);
    if (dot_movement === "anti-phase") {
      if (vertical) {
        left_buffer.text("vertical IOVD", eyesize/2+eyesep, eyesize/2*.4);
        left_buffer.text("no movement in depth", eyesize/2+eyesep, eyesize/2*.6);
      } else {
        left_buffer.text("horizontal IOVD", eyesize/2+eyesep, eyesize/2*.4);
        left_buffer.text("movement in depth", eyesize/2+eyesep, eyesize/2*.6);
      }
    } else {
      if (vertical) {
        left_buffer.text("vertical global motion", eyesize/2+eyesep, eyesize/2*.4);
        left_buffer.text("movement in the plane", eyesize/2+eyesep, eyesize/2*.6);
      } else {
        left_buffer.text("horizontal global motion", eyesize/2+eyesep, eyesize/2*.4);
        left_buffer.text("movement in the plane", eyesize/2+eyesep, eyesize/2*.6);
      }
    }
  } else if ( vertical && dot_movement === "anti-phase" ) {
    left_buffer.textFont("Helvetica");
    left_buffer.textSize(32)
    left_buffer.textAlign(CENTER, BOTTOM);
    left_buffer.fill(h_color);
    left_buffer.text("vertical full cue", eyesize/2+eyesep, eyesize/2*.4);
    left_buffer.text("(disparity + IOVD)", eyesize/2+eyesep, eyesize/2*.6);
    left_buffer.text("no movement in depth", eyesize/2+eyesep, eyesize/2*.8);
  } else {
    // make frame
    frame_width = eyesize/32;
    right_buffer.fill(0);
    // horizontal frame
    right_buffer.push();
    right_buffer.translate(0, -eyesize/2-frame_width/2, 0);
    right_buffer.box(eyesize+frame_width*2, frame_width,0);
    right_buffer.pop();
    right_buffer.push();
    right_buffer.translate(0, eyesize/2+frame_width/2, 0);
    right_buffer.box(eyesize+frame_width*2, frame_width,0);
    right_buffer.pop();
    // vertical frame
    right_buffer.push();
    right_buffer.translate(eyesize/2+frame_width/2, 0, 0);
    right_buffer.box(frame_width, eyesize+frame_width*2,0);
    right_buffer.pop();
    right_buffer.push();
    right_buffer.translate(-eyesize/2-frame_width/2, 0, 0);
    right_buffer.box(frame_width, eyesize+frame_width*2,0);
    right_buffer.pop();

    // compute coordinates
    for (var i = 0; i < test_x.length; i++) {
      ref_c[0] = ref_x[i];
      ref_c[1] = ref_y[i];
      if (dot_movement === "anti-phase") {
        perc_c[0] = test_x[i];
        perc_c[1] = test_y[i];
        move_z = move_x * 4
      } else {
        perc_c[0] = test_x[i] + move_x;
        perc_c[1] = test_y[i];
        move_z = 0
      }
      if (vertical) {
        ref_c = reverse(ref_c);
        perc_c = reverse(perc_c);
      }
      right_buffer.push();
      right_buffer.strokeWeight(0);
      if (reference ) {
        if ( abs(ref_c[0]) < eyesize/2 && abs(ref_c[1]) < eyesize/2 ) {
          right_buffer.push();
          if ( i == ref_rand && highlight_dots) {
            right_buffer.fill(h_color);
        } else {
          if (highlight_bars) {
            right_buffer.fill(color_pink);
          } else {
            right_buffer.fill(mid_gray);
          }
        }
          right_buffer.translate(ref_c[0], ref_c[1], .01);
          right_buffer.box(dotsize, dotsize, 0);
          right_buffer.pop();
        }
      }
      if ( abs(perc_c[0]) < eyesize/2 && abs(perc_c[1]) < eyesize/2 ) {
        right_buffer.push();
        if ( i == test_rand && highlight_dots) {
            right_buffer.fill(h_color);
        } else {
          if (highlight_bars) {
            right_buffer.fill(color_pink);
          } else {
            right_buffer.fill(mid_gray);
          }
        }
        right_buffer.translate(perc_c[0], perc_c[1], .01+move_z);
        right_buffer.box(dotsize, dotsize, 0);
        right_buffer.pop();
      }
      right_buffer.pop();
      if (i == 0) {
          // plot gray bars
        if (highlight_bars) {
            if (vertical == false) {
              // dark bars
              right_buffer.push();
              right_buffer.strokeWeight(0);
              right_buffer.fill(dark_gray);
              right_buffer.push();
              right_buffer.translate(0, -eyesize / 2 + eyesize / 8, 0);
              right_buffer.box(eyesize, eyesize / 4, 0);
              right_buffer.pop();
              right_buffer.push();
              right_buffer.translate(0, eyesize / 8, 0);
              right_buffer.box(eyesize, eyesize / 4, 0);
              right_buffer.pop();
              right_buffer.pop();
              // light bars
              right_buffer.push();
              right_buffer.strokeWeight(0);
              right_buffer.fill(mid_gray);
              right_buffer.push();
              right_buffer.translate(0, -eyesize / 8, move_z);
              right_buffer.box(eyesize, eyesize / 4, 0);
              right_buffer.pop();
              right_buffer.push();
              right_buffer.translate(0, eyesize / 2 - eyesize / 8, move_z);
              right_buffer.box(eyesize, eyesize / 4, 0);
              right_buffer.pop();
              right_buffer.pop();
            } else {
              // dark bars
              right_buffer.push();
              right_buffer.strokeWeight(0);
              right_buffer.fill(dark_gray);
              right_buffer.push();
              right_buffer.translate(-eyesize / 2 + eyesize / 8, 0, 0);
              right_buffer.box(eyesize / 4, eyesize, 0);
              right_buffer.pop();
              right_buffer.push();
              right_buffer.translate(eyesize / 8, 0, 0);
              right_buffer.box(eyesize / 4, eyesize, 0);
              right_buffer.pop();
              right_buffer.pop();
              // light bars
              right_buffer.push();
              right_buffer.strokeWeight(0);
              right_buffer.fill(mid_gray);
              right_buffer.push();
              right_buffer.translate(-eyesize / 8, 0, move_z);
              right_buffer.box(eyesize / 4, eyesize, 0);
              right_buffer.pop();            
              right_buffer.push();
              right_buffer.translate(eyesize / 2 - eyesize / 8, 0, move_z);
              right_buffer.box(eyesize / 4, eyesize, 0);
              right_buffer.pop();
              right_buffer.pop();
            }
        }
      }
    }
  }
}

/*
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle_list(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}