// make a list of integers
function integer_list(low_end, high_end, inclusive) {
  let list = [];
  if (inclusive) {
    // add one to that high_end is included in the output
    high_end = high_end + 1
  }
  for (let i = low_end; i < high_end; i++) {
    list.push(i);
  }
  return list;
}

// shuffle any input array
function shuffle(array) {
    // define three variables
    let cur_idx = array.length, tmp_val, rand_idx;

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

function completion_code(prefix, suffix) {
    let code = "";
    for (const i of Array(8).keys()) {
        let this_num = Math.floor(Math.random() * 10);
        let this_char = this_num.toString();
        code = code + this_char;
    }
    code = `${code}-${prefix}-`;

    for (const i of Array(12).keys()) {
        let this_num = Math.floor(Math.random() * 10);
        let this_char = this_num.toString();
        code = code + this_char;
    }
    code = `${code}-${suffix}`;
    return code;
}

// END DISPLAY AND AUTOMATIC CREDIT GRANTING FUNCTION // 
/*
The following function is meant to be used at the end of the experiment like so

on_finish: function(){
  end_display(debrief(), 
  "https://yorku.sona-systems.com/webstudy_credit.aspx?experiment_id=3947&credit_token=b518a1342fd848388cb4ca7d8c4524a8&survey_code=", 8000)
}

redirects participants back to the specified URL to be granted a credit upon completion of an experiment. 
  - debrief: html_code with any non-generic debriefing
  - url: redirect URL code (if not set, no redirect will be done ) 
  - delay: delay in ??? before redirection   
You may use this function to redirect participants back to any site you wish, it is NOT limited to URPP.
This function is to be used in conjuction with the jsPsych plugin package. 
*/

function end_display(debrief='', url=null, delay=8000) {
    const display_element = jsPsych.getDisplayElement();
    if ( url ) {
      display_element.innerHTML = "<p>You have completed the experiment.</p>"+
                                  "<p>We appreciate your participation.</p>"+
                                  "<p>Please wait to be redirected to URPP.</p>"+debrief
      let ppn = jsPsych.data.urlVariables()['participant'] // the string in the square brackets should be changed accordingly
      console.log(url+ppn)
      setTimeout( function() { window.location.assign(url+ppn) }, delay) //timeout amount can be changed
    } else {
      display_element.innerHTML = "<p>You have completed the experiment.</p>"+
                                  "<p>We appreciate your participation.</p>"+debrief
    }
}

function get_survey(type) {
  if ( type == "simple") {
    survey_html = "<div style='text-align: left; vertical-align: top; display: inline-block; float: left; width: 100%'>"+
      "<p><u>Age:</u> <input style='font-size: 18px; line-height: 1.6em;' input type='text' id='start' name='age'></p>"+
      "<p><u>Handedness:</u> </strong><input type='radio' id='left' name='handedness' value='left'>"+
      "<label for='left'>Left-handed</label>"+
      "<input type='radio' id='right' name='handedness' value='right' checked>"+
      "<label for='right'>Right-handed</label>"+
      "<input type='radio' id='ambi' name='handedness' value='ambi'>"+
      "<label for='ambi'>Ambidextrous</label></p>"+
      "<p><u>Sex:</u> <input type='radio' id='female' name='sex' value='female' checked>"+
      "<label for='female'>Female</label>"+
      "<input type='radio' id='male' name='sex' value='male'>"+
      "<label for='male'>Male</label>"+
      "<input type='radio' name='sex' value='other'><label for='other'>Other, please specify: </label>"+ 
      "<input type='text' name='other_sex' id='other_sex' value=''></p>"+
      "</div>"
  } else {
    survey_html = "<div style='text-align: left; vertical-align: top; display: inline-block; float: left; width: 100%'>"+
      "<p><u>Birth Date:</u> <input style='font-size: 18px; line-height: 1.6em;' type='date' id='start' name='dob' min='1960-01-01' max='2020-01-01'></p>"+
      "<p><u>Handedness:</u> </strong><input type='radio' id='left' name='handedness' value='left'>"+
      "<label for='left'>Left-handed</label>"+
      "<input type='radio' id='right' name='handedness' value='right' checked>"+
      "<label for='right'>Right-handed</label>"+
      "<input type='radio' id='ambi' name='handedness' value='ambi'>"+
      "<label for='ambi'>Ambidextrous</label></p>"+
      "<p><u>Sex:</u> <input type='radio' id='female' name='sex' value='female' checked>"+
      "<label for='female'>Female</label>"+
      "<input type='radio' id='male' name='sex' value='male'>"+
      "<label for='male'>Male</label>"+
      "<input type='radio' name='sex' value='other'><label for='other'>Other, please specify: </label>"+ 
      "<input type='text' name='other_sex' id='other_sex' value=''></p>"+
      "<p><u>What race(s) do you identify with? (choose all that apply)</u><br>"+
      "<input type='checkbox' name='race' id='indigenous' value='indigenous' /><label for='indigenous'>Aboriginal (Indigenous) Peoples</label><br>"+
      "<input type='checkbox' name='race' id='black' value='black' /><label for='black'>Black or African-American</label><br>"+
      "<input type='checkbox' name='race' id='asian' value='asian' /><label for='asian'>Asian</label><br>"+
      "<input type='checkbox' name='race' id='white' value='white' /><label for='white'>White</label><br>"+
      "<input type='checkbox' name='race' id='hispanic' value='hispanic' /><label for='hispanic'>Hispanic or Latino/a/x</label><br>"+
      "<input type='checkbox' name='race' id='pacific' value='pacific' /><label for='pacific'>Native Hawaiian or other Pacific Islander</label><br>"+
      "<input type='checkbox' name='race' id='other' value='other' /><label for='other'>Multiracial/Other, please specify: </label>"+
      "<input type='text' name='other_race' id='other_race' value=''>​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​</p></div>"
  }
  return survey_html
}

// PASSWORD PROTECT FUNCTION //
/*
The following function can be used to password protect an experiment. 
When used with jsPsych, it can be placed before the experiment and used to redirect the participant to 
the specified experiment file if the login credentials are correct. It is recommended that this function be stored 
in a seperate html file from the experiment. An example of how to use this function with jsPsych is included below.
*/

var password_func = function passWord() {
  var testV = 1;
  var pass1 = prompt('Please Enter Your Password',' ');
  while (testV < 100) {
      if (!pass1)
      history.go(-1);
      if (pass1.toLowerCase() == "triplets") { //password is here. Recommend using encryption software 
          alert('You Got it Right!');
          window.open('trial_3D_p1.html'); //redirects the participant to the experiment file if login correct. Change file accordingly
          break;
      }
      testV+=1;
      var pass1 =
      prompt('Access Denied - Password Incorrect, Please Try Again.','Password');
      }
      if (pass1.toLowerCase()!="password" & testV ==100) //testV value can be changed to lock people out after n number of attempts
      history.go(-1);
      return " ";
}

//EXAMPLE USE CASE (with jsPsych)//
//seperate html file//
/*
  timeline = [];
  var pavlovia_init = {
  type: "pavlovia",
  command: "init"
  };
  timeline.push(pavlovia_init);

  var password_func = function passWord() {
      var testV = 1;
      var pass1 = prompt('Please Enter Your Password',' ');
      while (testV < 100) {
          if (!pass1)
          history.go(-1);
          if (pass1.toLowerCase() == "triplets") {
              alert('You Got it Right!');
              window.open('trial_3D_p1.html');
              break;
          }
          testV+=1;
          var pass1 =
          prompt('Access Denied - Password Incorrect, Please Try Again.','Password');
          }
          if (pass1.toLowerCase()!="password" & testV ==100) //test can be changed to lock people out after n number of attempts
          history.go(-1);
          return " ";
          }
          var password_trial1 = {
              type: 'survey-html-form',
              preamble: 'Welcome to the experiment. Please click on the button below to enter.',
              html: '<div style:"visibility: hidden"</div>'
              }
              timeline.push(password_trial1)
              var password_trial = {
                  type: 'call-function',
                  func: password_func,
                  async: true
                  }
                  timeline.push(password_trial)

  var pavlovia_finish = {
  type: "pavlovia",
  command: "finish"
  };

  timeline.push(pavlovia_finish);
  jsPsych.init({
      timeline: timeline,
      on_finish: jsPsych.data.get()
  })
*/