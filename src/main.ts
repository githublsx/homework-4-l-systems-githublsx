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

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 6,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [182, 255, 208],
  shader: 'fun',
  drawable: 'sphere',
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let cylinder: Cylinder;
let lsystem: Lsystem;
let icospheres: Icosphere[];
let cylinders: Cylinders;

function loadScene() {

  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  cylinder = new Cylinder(vec3.fromValues(0, 0, 0), 0.5, 1, 1, 4, 1, false, 0, 2 * Math.PI);
  cylinder.create();

  var axiom = "F[+&F]F[-^F]F";
  lsystem = new Lsystem(axiom, 5, "F", 1, 20 / 180 * Math.PI);
  lsystem.iterate();
  lsystem.process();

  // icospheres = new Array<Icosphere>();
  // for(let i = 0; i < lsystem.branches.length; i += 2)
  // {
  //   console.log(lsystem.branches[i]);
  //   icosphere = new Icosphere(lsystem.branches[i], 1, controls.tesselations);
  //   icosphere.create();
  //   icospheres.push(icosphere);
  // }

  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  //console.log(`Start`);
  //console.log(axiom);
  cylinders = new Cylinders(vec3.fromValues(0, 0, 0), 0.1, 0.1, 1, 20, 1, false, 0, 2 * Math.PI, lsystem.branches);
  cylinders.create();
}

function main() {
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
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'color');
  gui.add(controls, 'shader', ['lambert','fun']);
  gui.add(controls, 'drawable', ['cube','sphere','square']);

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
