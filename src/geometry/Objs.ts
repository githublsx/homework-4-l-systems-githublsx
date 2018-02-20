import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as OBJLOADER from 'webgl-obj-loader';
import Branch from '../Branch'


class Objs extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;
  objstring: string;
  transform: Branch[];

  constructor(center: vec3, objstring: string, transform: Branch[]) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.objstring = objstring;
    this.transform = transform;
  }

  computeRotationMatrix(startpoint: vec3, endpoint: vec3){
    var original = vec3.fromValues(0, 1, 0);
    var rotated = endpoint
    vec3.normalize(rotated, rotated);
    var axis = vec3.create();
    vec3.cross(axis, original, rotated);
    var dotproduct = vec3.dot(original, rotated);
    var angle = Math.acos(dotproduct);
    var matrix = mat4.create();
    mat4.fromRotation(matrix, angle, axis);
    return matrix;
  }

  create() {

    //var objStr = document.getElementById('my_cube.obj').innerHTML;
    var mesh = new OBJLOADER.Mesh(this.objstring);

    //4!!!!!!!!!!!!!!!!!!!!!!!!!!!

    var indices = new Array<number>();
    var vertices = new Array<number>();
    var normals = new Array<number>();
    for(let i = 0; i < this.transform.length; i++)
    {
      var verticeslength = vertices.length / 4;
      var startpoint = this.transform[i].startpoint;
      var endpoint = this.transform[i].endpoint;
      var rotation = this.computeRotationMatrix(startpoint, endpoint);
      var translate = startpoint;
      var vertex;
      var normal;
      for(let i = 0; i < mesh.vertices.length; i+=3)
      {
        vertex = vec3.fromValues(mesh.vertices[i], mesh.vertices[i+1], mesh.vertices[i+2]);
        vec3.transformMat4(vertex, vertex, rotation);
        vertices.push( vertex[0] + translate[0], vertex[1] + translate[1], vertex[2] + translate[2], 1);
        normal = vec3.fromValues( mesh.vertexNormals[i], mesh.vertexNormals[i+1], mesh.vertexNormals[i+2]);
        vec3.transformMat4(normal, normal, rotation);
        vec3.normalize(normal, normal);
        normals.push( normal[0], normal[1], normal[2], 0);
      }
      for(let i = 0; i < mesh.indices.length; i++)
      {
        indices.push(mesh.indices[i] + verticeslength);
      }
    }


    this.indices = new Uint32Array(indices);
    //console.log(this.indices);
    this.normals = new Float32Array(normals);
    //console.log(this.normals);
    this.positions = new Float32Array(vertices);
    //console.log(this.positions);

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

export default Objs;
