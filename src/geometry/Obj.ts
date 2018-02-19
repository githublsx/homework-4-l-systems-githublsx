import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as OBJLOADER from 'webgl-obj-loader';


class Obj extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;
  objstring: string;

  constructor(center: vec3, objstring: string) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.objstring = objstring;
  }

  create() {

    //var objStr = document.getElementById('my_cube.obj').innerHTML;
    var mesh = new OBJLOADER.Mesh(this.objstring);

    //4!!!!!!!!!!!!!!!!!!!!!!!!!!!

    //var indices = new Array<number>();
    var vertices = new Array<number>();
    var normals = new Array<number>();
    for(let i = 0; i < mesh.vertices.length; i+=3)
    {
      vertices.push(mesh.vertices[i]);
      vertices.push(mesh.vertices[i+1]);
      vertices.push(mesh.vertices[i+2]);
      vertices.push(1);
      normals.push(mesh.vertexNormals[i]);
      normals.push(mesh.vertexNormals[i+1]);
      normals.push(mesh.vertexNormals[i+2]);
      normals.push(0);
    }

    this.indices = new Uint32Array(mesh.indices);
    console.log(this.indices);
    this.normals = new Float32Array(normals);
    console.log(this.normals);
    this.positions = new Float32Array(vertices);
    console.log(this.positions);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created obj`);
  }
};

export default Obj;
