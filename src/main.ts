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

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 6,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [182, 255, 208],
  shader: 'fun',
  drawable: 'sphere',
  axoim: "A",
  rule1: "A=[&FL!A]/////’[&FL!A]///////’[&FL!A]",
  rule2: "F=S/////F",
  rule3: "S=FL",
  rule4: "L=[’’’∧∧{-f+f+f-|-f+f+f}]",
  degree: 20,
  iteration: 8,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let cylinder: Cylinder;
let lsystem: Lsystem;
let icospheres: Icosphere[];
let cylinders: Cylinders;
let obj: Obj;

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

var bunny = readTextFile("/src/mesh/bare.obj");

function cutrule(ruleleft: string[], ruleright: string[], rule: string){
  if(rule!="")
  {
    for(let i = 1; i < rule.length; i++)
    {
      if(rule[i]=="=")
      {
        console.log(rule.substring(0,i));
        ruleleft.push(rule.substring(0,i));
        console.log(rule.substring(i+1,rule.length));
        ruleright.push(rule.substring(i+1,rule.length));
        break;
      }
    }
  }
}

function loadScene() {

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  // cylinder = new Cylinder(vec3.fromValues(0, 0, 0), 0.5, 1, 1, 4, 1, false, 0, 2 * Math.PI);
  // cylinder.create();
  
  var ruleleft = new Array<string>();
  var ruleright = new Array<string>();

  //cut rule
  cutrule(ruleleft, ruleright, controls.rule1);
  cutrule(ruleleft, ruleright, controls.rule2);
  cutrule(ruleleft, ruleright, controls.rule3);
  cutrule(ruleleft, ruleright, controls.rule4);

  lsystem = new Lsystem(ruleleft, ruleright, controls.iteration, controls.axoim, 1, controls.degree / 180 * Math.PI);
  lsystem.iterate();
  lsystem.process();

  cylinders = new Cylinders(vec3.fromValues(0, 0, 0), 0.1, 0.1, 1, 20, 1, false, 0, 2 * Math.PI, lsystem.branches);
  cylinders.create();

  console.log("bunny")
  obj = new Obj(vec3.fromValues(0, 0, 0), bunny);
  obj.create();
  // icospheres = new Array<Icosphere>();
  // for(let i = 0; i < lsystem.branches.length; i += 2)
  // {
  //   console.log(lsystem.branches[i]);
  //   icosphere = new Icosphere(lsystem.branches[i], 1, controls.tesselations);
  //   icosphere.create();
  //   icospheres.push(icosphere);
  // }
  // icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  // icosphere.create();
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
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.addColor(controls, 'color');
  // gui.add(controls, 'shader', ['lambert','fun']);
  // gui.add(controls, 'drawable', ['cube','sphere','square']);
  gui.add(controls, 'iteration');
  gui.add(controls, 'degree');
  gui.add(controls, 'axoim');
  gui.add(controls, 'rule1');
  gui.add(controls, 'rule2');
  gui.add(controls, 'rule3');
  gui.add(controls, 'rule4');
  gui.add(controls, 'Load Scene');

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
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const lambert2 = new ShaderProgram([
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
    renderer.render(camera, shader, [cylinders], //[icosphere,//square,cube,], 
    vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);

    renderer.render(camera, shader, [obj], //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);
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
