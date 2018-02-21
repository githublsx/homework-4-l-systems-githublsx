import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import Cylinder from './geometry/Cylinder';
import Cylinders from './geometry/Cylinders';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Lsystem from './Lsystem';
import Obj from './geometry/Obj';
import Objs from './geometry/Objs';
import Objs2 from './geometry/Objs2'; 

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  radialSegments: 6,
  'Generate': loadScene, // A function pointer, essentially
  color: [255, 237, 222],//255, 232, 200
  color2: [255, 62, 62],//0, 194, 255
  color3: [57, 57, 50],//0, 194, 255
  color4: [49, 29, 0],//0, 194, 255
  shader: 'fun',
  drawable: 'sphere',
  start: "FFFFFFFFFFFFFF",
  axoim: "A",
  rule1: "A=/////’[&FL!A]/////’[&FL!A]",
  rule1b: "A=/////’[&FL!A]/////’[&FL!A]/////’[&FL!A]",
  rule1c: "A=/////’[&FL!A]///’[&FL!A]////’[&FL!A]/////’[&FL!A]",
  rule2: "F=S/////F",
  rule3: "S=FL",
  rule4: "L=[’’’∧∧{-f+f+f-|-f+f+f}]",
  probablity1: 0.2,//0.19
  probablity2: 0.4,//0.43
  degree: 8,
  degreeoffset: 3,
  step: 1.4,//2
  stepoffset: 0.5,
  iteration: 8,
  radius: 3.9,
  decrease: 1.5,
  decrease2: 3,
  randomness: 1.2,
  leafamount: 0.9,//1
  terminatesize: 0.08,

  height: 100.0,
  directionx: 1.0,
  directionz: 1.0,
  amount: 0.08,
  amount2: 1.5,
  strength: 1.0,

  fallingnum: 100,
  fallingspeed: 5.0,
  strength2: 2.0,
  lightposy: 80,

  lightvecx: 0.2,//1.0,
  lightvecy: -0.6,//1.0,
  lightvecz: -0.1,//1.0,
  lightlerp: 0.05,
  lightambient: 0.3,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let cylinder: Cylinder;
let lsystem: Lsystem;
let icospheres: Icosphere[];
let cylinders: Cylinders;
let obj: Obj;
let dirt: Obj;
let objs: Objs;
let objs2: Objs2;

function readTextFile(file: string): string
{
    var allTest = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allTest = rawFile.responseText;
                return allTest;
            }
        }
    }
    rawFile.send(null);
    return allTest;
}

var bunny = readTextFile("./src/mesh/leaf.obj");
var bunny2 = readTextFile("./src/mesh/stage.obj");
var dirtroute = readTextFile("./src/mesh/dirt.obj");

function cutrule(ruleleft: string[], ruleright: string[], rule: string){
  if(rule!="")
  {
    for(let i = 1; i < rule.length; i++)
    {
      if(rule[i]=="=")
      {
        //console.log(rule.substring(0,i));
        ruleleft.push(rule.substring(0,i));
        //console.log(rule.substring(i+1,rule.length));
        ruleright.push(rule.substring(i+1,rule.length));
        break;
      }
    }
  }
}

function loadScene() {

  square = new Square(vec3.fromValues(0, 0, 0), 600.0, 1.0);
  square.create();
  cube = new Cube(vec3.fromValues(2, 2, 2));
  cube.create();
  cylinder = new Cylinder(vec3.fromValues(0, 0, 0), 1, 1, 1, 4, 1, false, 0, 2 * Math.PI);
  cylinder.create();
  
  var ruleleft = new Array<string>();
  var ruleright = new Array<string>();
  var probablity = new Array<number>();

  //cut rule
  cutrule(ruleleft, ruleright, controls.rule1);
  cutrule(ruleleft, ruleright, controls.rule2);
  cutrule(ruleleft, ruleright, controls.rule3);
  cutrule(ruleleft, ruleright, controls.rule4);
  cutrule(ruleleft, ruleright, controls.rule1b);
  cutrule(ruleleft, ruleright, controls.rule1c);
  probablity.push(controls.probablity1);
  probablity.push(controls.probablity2);


  lsystem = new Lsystem(ruleleft, ruleright, probablity, controls.iteration, controls.axoim, controls.step, controls.stepoffset, 
    controls.degree / 180 * Math.PI, controls.degreeoffset / 180 * Math.PI, controls.start, controls.randomness, 
    controls.leafamount, controls.terminatesize);
  lsystem.iterate();
  lsystem.process();

  cylinders = new Cylinders(vec3.fromValues(0, 0, 0), controls.radius, controls.radius, 1.5, controls.radialSegments, 1, false, 0, 2 * Math.PI, lsystem.branches, controls.decrease, controls.decrease2);
  cylinders.create();

  obj = new Obj(vec3.fromValues(5, 5, 5), bunny2);
  obj.create();

  dirt = new Obj(vec3.fromValues(5, 5, 5), dirtroute);
  dirt.create();

  objs = new Objs(vec3.fromValues(0, 0, 0), bunny, lsystem.transform);
  objs.create();

  objs2 = new Objs2(vec3.fromValues(0, 0, 0), bunny, lsystem.largestpos, lsystem.smallestpos, controls.fallingnum);
  objs2.create();

  // icospheres = new Array<Icosphere>();
  // for(let i = 0; i < lsystem.branches.length; i += 2)
  // {
  //   console.log(lsystem.branches[i]);
  //   icosphere = new Icosphere(lsystem.branches[i], 1, controls.tesselations);
  //   icosphere.create();
  //   icospheres.push(icosphere);
  // }

}


function main() {

  // load obj

  //var bunny = "hello";
  //MeshManager.push(readTextFile("./src/models/branch.obj"));
  //var fs = require('fs');
  // var fs = require('fs');
  // console.log(fs);
  // var data = fs.readFileSync('./src/mesh/bunny.obj').toString();

//   fs.readFile('./src/mesh/bunny.obj', function (err, data) {
//     if (err) {
//         return console.error(err);
//     }
//     console.log("bunny: " + data.toString());
// });

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var f1 = gui.addFolder('Branch');
  f1.addColor(controls, 'color');
  f1.add(controls, 'radialSegments', 3, 8).step(1);
  f1.add(controls, 'radius', 0.1, 5.0).step(0.01);
  f1.add(controls, 'terminatesize', 0, 1).step(0.01)
  var f1a = f1.addFolder('Lsystem');
  var f1aa = f1a.addFolder('Basic');
  f1aa.add(controls, 'iteration', 0, 9).step(1);
  f1aa.add(controls, 'degree', 0.1, 45).step(0.01);
  f1aa.add(controls, 'step', 0.1, 3).step(0.01);
  var f1ab = f1a.addFolder('Rules');
  f1ab.add(controls, 'start');
  f1ab.add(controls, 'axoim');
  f1ab.add(controls, 'rule1');
  f1ab.add(controls, 'rule1b');
  f1ab.add(controls, 'rule1c');
  f1ab.add(controls, 'probablity1', 0, 1).step(0.01);
  f1ab.add(controls, 'probablity2', 0, 1).step(0.01);
  f1ab.add(controls, 'rule2');
  f1ab.add(controls, 'rule3');
  f1ab.add(controls, 'rule4');
  var f1ac = f1a.addFolder('Noise');
  f1ac.add(controls, 'degreeoffset', 0, 45).step(0.01);
  f1ac.add(controls, 'stepoffset', 0, 3).step(0.01);
  f1ac.add(controls, 'randomness', 0, 5).step(0.01);
  var f2 = gui.addFolder('Leaf');
  f2.addColor(controls, 'color2');
  var f2a = f2.addFolder('On');
  f2a.add(controls, 'leafamount', 0, 1).step(0.01);
  var f2b = f2.addFolder('Off');
  f2b.add(controls, 'fallingnum', 0, 200).step(1);
  f2b.add(controls, 'fallingspeed', 0, 10).step(0.01);
  f2b.add(controls, 'strength2', 0, 10.0).step(0.01);
  var f4 = gui.addFolder('Others');
  f4.addColor(controls, 'color3');
  f4.addColor(controls, 'color4');
  var f3 = gui.addFolder('Wind');
  f3.add(controls, 'height', 0, 200.0).step(0.01);
  f3.add(controls, 'directionx', -1.0, 1.0).step(0.01);
  f3.add(controls, 'directionz', -1.0, 1.0).step(0.01);
  f3.add(controls, 'amount', 0, 1.0).step(0.01);
  f3.add(controls, 'amount2', 0, 6.0).step(0.01);
  f3.add(controls, 'strength', 0, 10.0).step(0.01);
  var f5 = gui.addFolder('Light');
  f5.add(controls, 'lightposy', 0, 200.0).step(0.01);
  f5.add(controls, 'lightvecx', -1, 1.0).step(0.01);
  f5.add(controls, 'lightvecy', -1, 1.0).step(0.01);
  f5.add(controls, 'lightvecz', -1, 1.0).step(0.01);
  f5.add(controls, 'lightlerp', 0, 1.0).step(0.01);
  f5.add(controls, 'lightambient', 0, 1.0).step(0.01);
  gui.add(controls, 'Generate');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 500, 8);
  icosphere.create();

  loadScene();

  const camera = new Camera(vec3.fromValues(110, 60, 0), vec3.fromValues(0, 45, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(20/255, 20/255, 20/255, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const lambert2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert0.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const lambert3 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert1.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const lambert4 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert2.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag2.glsl')),
  ]);

  var lastUpdate = Date.now();

  // This function will be called every frame
  function tick() {
    //loadScene();
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    let shader = lambert;
    //let drawable = [cylinder];
    var now = Date.now();
    var dt = now - lastUpdate;
    //lastUpdate = now;
    // if(controls.shader == 'fun')
    // {
    //   shader = lambert2;
    // }
    // if(controls.drawable == 'square')
    // {
    //   drawable = [square];
    // }
    // else if(controls.drawable == 'sphere')
    // {
    //   drawable = [icosphere];
    // }
    // console.log("cube number" + cubes.length);

    // for(let i = 0; i < icospheres.length; i += 1)
    // {
    //   //console.log("Drawing " + i + "cube");
    //   //console.log("cube center" + icospheres[i].center);
    //   // cube = new Cube(lsystem.branches[i]);
    //   // cube.create();
    //   let drawable = [icospheres[i]];
    //   renderer.render(camera, shader, drawable, //[icosphere,//square,cube,], 
    //     vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);
    // }
    lambert.setAmount(controls.amount);
    lambert.setAmount2(controls.amount2);
    lambert.setHeight(controls.height);
    lambert.setDirectionx(controls.directionx);
    lambert.setDirectionz(controls.directionz);
    lambert.setStrength(controls.strength);

    lambert.setLightposy(controls.lightposy);
    lambert2.setLightposy(controls.lightposy);
    lambert3.setLightposy(controls.lightposy);
    lambert.setLightambient(controls.lightambient);
    lambert2.setLightambient(controls.lightambient);
    lambert3.setLightambient(controls.lightambient);
    lambert.setLightvec(vec4.fromValues(controls.lightvecx, controls.lightvecy, controls.lightvecz, 0.0));
    lambert2.setLightvec(vec4.fromValues(controls.lightvecx, controls.lightvecy, controls.lightvecz, 0.0));
    lambert3.setLightvec(vec4.fromValues(controls.lightvecx, controls.lightvecy, controls.lightvecz, 0.0));
    lambert.setLightlerp(controls.lightlerp);
    lambert2.setLightlerp(controls.lightlerp);
    lambert3.setLightlerp(controls.lightlerp);

    lambert3.setAmount(controls.amount);
    lambert3.setAmount2(controls.amount2);
    lambert3.setHeight(controls.height);
    lambert3.setDirectionx(controls.directionx);
    lambert3.setDirectionz(controls.directionz);
    lambert3.setStrength(controls.strength + controls.strength2);
    lambert3.setSpeed(controls.fallingspeed);

    renderer.render(camera, lambert, [cylinders], //[icosphere,//square,cube,], 
    vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);

    // renderer.render(camera, shader, [cylinder], //[icosphere,//square,cube,], 
    // vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert2, [obj], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color3[0]/255, controls.color3[1]/255, controls.color3[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert2, [square], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color3[0]/255, controls.color3[1]/255, controls.color3[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert2, [dirt], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color4[0]/255, controls.color4[1]/255, controls.color4[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert, [objs], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color2[0]/255, controls.color2[1]/255, controls.color2[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert3, [objs2], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color2[0]/255, controls.color2[1]/255, controls.color2[2]/255, 1), dt/1000.0);

    renderer.render(camera, lambert4, [icosphere], //[icosphere,//square,cube,], 
      vec4.fromValues(20/255, 20/255, 20/255, 1), dt/1000.0);  
    
      stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
