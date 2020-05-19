var ticks=0;
var tick_skip=2;
var interval=1;
var device_mul=1;
var running=false;
var buffer_size=128

var data_x = []
var data_y = []
var data_z = []
var data_raw = []
var data_sum = []
var data_freq = []


function motion_handler(event) {

  if ( ticks % tick_skip == 0 ){
    // console.log(event)
    x = event.acceleration.x
    y = event.acceleration.y
    z = event.acceleration.z
    interval = event.interval * device_mul
    // console.log(interval)

    $("#freq").html("" + (1/interval*1000)+" Hz")
    $("#acc-x").html(x)
    $("#acc-y").html(y)
    $("#acc-z").html(z)
    t = ticks*interval*tick_skip
    s = x + y + z


    data_x.push({x: t, y:Math.abs(x)})
    data_y.push({x: t, y:Math.abs(y)})
    data_z.push({x: t, y:Math.abs(z)})
    data_raw.push(s)
    data_sum.push({x: t, y:Math.abs(s)})

    if (ticks > buffer_size ){


      var signal = new Float32Array(data_raw);
      var fft = new FFT(buffer_size, Math.floor(1/interval));
      fft.forward(signal);


      data_freq.length = 0
      for (i=0 ; i < fft.spectrum.length - 20; i++) {
        if (data_freq.length >= buffer_size){
          data_freq.shift()
        }
        data_freq.push({x: i*(1/interval*tick_skip*2), y: fft.spectrum[i]})
      }
      console.log(data_freq)

    }

    update()



    if (data_x.length >= buffer_size){
      data_x.shift()
    }
    if (data_y.length >= buffer_size){
      data_y.shift()
    }
    if (data_z.length >= buffer_size){
      data_z.shift()
    }
    if (data_raw.length >= buffer_size ){
      data_raw.shift()
    }
    if (data_sum.length >= buffer_size){
      data_sum.shift()
    }
  }
  ticks += 1;

}

function motion_handler_start() {
  var button = $('#permission-button')
  button.addClass('active')
  window.addEventListener('devicemotion', motion_handler)
  render()
}

function motion_handler_stop() {
  var button = $('#permission-button')
  button.removeClass('active')
  window.removeEventListener('devicemotion',motion_handler)
}

function motion_handler_req() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log("Permission Granted")
          device_mul=1000

        }
      } )
      .catch(console.error);
  }

}


function on_click_handler() {
  console.log('click_handler')

  // feature detect
  if (ticks == 0){
    motion_handler_req()
  }

  if ( ! running) {
    console.log('starting')
    motion_handler_start();
    running = true;
  } else{
    console.log('stopping')
    motion_handler_stop()
    running = false;
  }
}

var graph1 = new Rickshaw.Graph( {
  element: document.querySelector('#chart1'),
  renderer:'area',
  height: 200,
  series: [
    {
      color: 'steelblue',
      data: data_x
    }, {
      color: 'red',
      data: data_y
    },{
      color: 'green',
      data: data_z
    }
  ],
  max :40,
  padding:{top:0 , right:0.03 , bottom:0 , left:0.03}
} );

var graph2 = new Rickshaw.Graph( {
  element: document.querySelector('#chart1'),
  renderer:'area',
  height: 200,
  series: [
    {
      color: 'steelblue',
      data: data_sum
    }],
  max :40,
  padding:{top:0 , right:0.03 , bottom:0 , left:0.03}
} );


var graph3 = new Rickshaw.Graph( {
  element: document.querySelector('#chart3'),
  renderer:'area',
  height: 200,
  series: [
    {
      color: 'steelblue',
      data: data_freq
    }],
  max :15,
  padding:{top:0 , right:0.03 , bottom:0 , left:0.03}
} );



function update(){
  graph1.update();
  graph2.update();
  graph3.update();


}
function render(){
  graph1.render();
  graph2.render();
  var x_axis_1 = new Rickshaw.Graph.Axis.X( {
    graph: graph1,
    orientation: 'bottom',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  } );
  var x_axis_2 = new Rickshaw.Graph.Axis.X( {
    graph: graph2,
    orientation: 'bottom',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  } );
  var x_axis_3 = new Rickshaw.Graph.Axis.X( {
    graph: graph3,
    orientation: 'bottom',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
  } );
//   var y_axis_1 = new Rickshaw.Graph.Axis.Y( {
//   graph: graph1,
//   orientation: 'left',
//   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
//   element: document.getElementById('y_axis')
// } );
//   var y_axis_2 = new Rickshaw.Graph.Axis.Y( {
//     graph: graph2,
//     orientation: 'left',
//     tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
//     element: document.getElementById('y_axis')
//   } );
//   y_axis_1.render();
//   y_axis_2.render();
  x_axis_1.render();
  x_axis_2.render();
  graph3.render();
}

// graph3.render()

// var x_axis = new Rickshaw.Graph.Axis.X( { graph: graph } );

// var y_axis = new Rickshaw.Graph.Axis.Y( {
//   graph: graph,
//   orientation: 'left',
//   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
//   element: document.getElementById('y_axis')
// } );
// var yTicks = new Rickshaw.Graph.Axis.Y({
//   graph:graph,
//   orientation: "left"
// });
// xTicks.render()
// yTicks.render()

// var x_ticks = new Rickshaw.Graph.Axis.X( {
//   graph: graph1,
//   orientation: "bottom",
//   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
// } );
// var x_ticks = new Rickshaw.Graph.Axis.X( {
//   graph: graph2,
//   orientation: "bottom",
//   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
// } );
// var x_ticks = new Rickshaw.Graph.Axis.X( {
//   graph: graph3,
//   orientation: "bottom",
//   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
// } );
// x_ticks.render()



$('#permission-button').on('click', on_click_handler)
// $('#graph-button').on('click', on_click_handler_graph)
console.log('hola')

