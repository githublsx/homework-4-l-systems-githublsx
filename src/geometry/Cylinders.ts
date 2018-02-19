import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cylinders extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
  heightSegments: number;
  openEnded: Boolean;
  thetaStart: number;
  thetaLength: number;
  branches: vec3[];

  constructor(center: vec3,  radiusTop: number, radiusBottom: number, height: number, radialSegments: number, 
    heightSegments: number, openEnded: Boolean, thetaStart: number, thetaLength: number, branches: vec3[]) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.radiusTop = radiusTop;
    this.radiusBottom = radiusBottom;
    this.height = height;
    this.radialSegments = radialSegments;
    this.heightSegments = heightSegments;
    this.openEnded = openEnded;
    this.thetaStart = thetaStart;
    this.thetaLength = thetaLength;
    this.branches = branches;
  }

  computeRotationMatrix(startpoint: vec3, endpoint: vec3){
    var original = vec3.fromValues(0, 1, 0);
    var rotated = vec3.create();
    vec3.subtract(rotated, endpoint, startpoint);
    vec3.normalize(rotated, rotated);
    var axis = vec3.create();
    vec3.cross(axis, original, rotated);
    var dotproduct = vec3.dot(original, rotated);
    var angle = Math.acos(dotproduct);
    var matrix = mat4.create();
    mat4.fromRotation(matrix, angle, axis);
    return matrix;
  }

  computeTranslateVector(startpoint: vec3, endpoint: vec3)
  {
    var rotated = vec3.create();
    vec3.add(rotated, endpoint, startpoint);
    vec3.scale(rotated, rotated, 0.5);
    return rotated;
  }

  computeScale(startpoint: vec3, endpoint: vec3)
  {
    var rotated = vec3.create();
    vec3.subtract(rotated, endpoint, startpoint);
    var length = vec3.length(rotated);
    return length;
  }

  create() {
  var index = 0;
  var indexArray = new Array<number[]>();
  var halfHeight = this.height / 2;
	var groupStart = 0;

  var indices = new Array<number>();
	var vertices = new Array<number>();
  var normals = new Array<number>();

	var radiusTop = this.radiusTop !== undefined ? this.radiusTop : 1;
	var radiusBottom = this.radiusBottom !== undefined ? this.radiusBottom : 1;
	var height = this.height || 1;

	var radialSegments = Math.floor( this.radialSegments ) || 8;
	var heightSegments = Math.floor( this.heightSegments ) || 1;

	var openEnded = this.openEnded !== undefined ? this.openEnded : false;
	var thetaStart = this.thetaStart !== undefined ? this.thetaStart : 0.0;
  var thetaLength = this.thetaLength !== undefined ? this.thetaLength : Math.PI * 2;


  for(let i = 0; i < this.branches.length; i+=2)
  {
    var verticeslength = vertices.length / 4;
    // console.log('i' + i/2 + 'length' + verticeslength);
    // console.log('i' + i/2 + 'length' + indices.length);
    var startpoint = this.branches[i];
    var endpoint = this.branches[i+1];
    var rotation = this.computeRotationMatrix(startpoint, endpoint);
    var translate = this.computeTranslateVector(startpoint, endpoint);
    var scale = this.computeScale(startpoint, endpoint);
    indexArray = new Array<number[]>();
    index = 0;

    generateTorso(rotation, translate, scale, verticeslength);
    if ( openEnded === false ) {
      if ( radiusTop > 0 ) generateCap( true, rotation, translate, scale, verticeslength);
      if ( radiusBottom > 0 ) generateCap( false, rotation, translate, scale, verticeslength);
    }
  }

  function generateTorso(rotation: mat4, translate: vec3, scale: number, verticeslength: number) {
    var x, y;
    var normal;
    var vertex;
    var groupCount = 0;
    var slope = ( radiusBottom - radiusTop ) / (height * scale);
    // generate vertices, normals and uvs
    for ( y = 0; y <= heightSegments; y ++ ) {
      var indexRow = [];
      var v = y / heightSegments;
      // calculate the radius of the current row
      var radius = v * ( radiusBottom - radiusTop ) + radiusTop;
      for ( x = 0; x <= radialSegments; x ++ ) {
        var u = x / radialSegments;
        var theta = u * thetaLength + thetaStart;
        var sinTheta = Math.sin( theta );
        var cosTheta = Math.cos( theta );
        // vertex
        vertex = vec3.fromValues(radius * sinTheta, -(v * height * scale -  halfHeight * scale), radius * cosTheta);
        vec3.transformMat4(vertex, vertex, rotation);
        vertices.push( vertex[0] + translate[0], vertex[1] + translate[1], vertex[2] + translate[2], 1);
        // normal
        normal = vec3.fromValues( sinTheta, slope, cosTheta);
        vec3.normalize(normal, normal);
        vec3.transformMat4(normal, normal, rotation);
        normals.push( normal[0], normal[1], normal[2], 0);
        // save index of vertex in respective row
        indexRow.push( index ++ );
      }
      // now save vertices of the row in our index array
      indexArray.push( indexRow );
    }
    // generate indices
    for ( x = 0; x < radialSegments; x ++ ) {
      for ( y = 0; y < heightSegments; y ++ ) {
        // we use the index array to access the correct indices
        var a = indexArray[ y ][ x ] + verticeslength;
        var b = indexArray[ y + 1 ][ x ] + verticeslength;
        var c = indexArray[ y + 1 ][ x + 1 ] + verticeslength;
        var d = indexArray[ y ][ x + 1 ] + verticeslength;
        // faces
        indices.push( a, b, d );
        indices.push( b, c, d );
        // update group counter
        groupCount += 6;
      }
    }
    groupStart += groupCount;
  }

    function generateCap( top: boolean, rotation: mat4, translate: vec3, scale: number, verticeslength: number) {
      var x, centerIndexStart, centerIndexEnd;
      var vertex;
      var normal;
      var groupCount = 0;
      var radius = ( top === true ) ? radiusTop : radiusBottom;
      var sign = ( top === true ) ? 1 : - 1;
      // save the index of the first center vertex
      centerIndexStart = index;
      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment
      for ( x = 1; x <= radialSegments; x ++ ) {
        // vertex   
        vertex = vec3.fromValues(0, halfHeight * scale * sign, 0);
        vec3.transformMat4(vertex, vertex, rotation);
        vertices.push( vertex[0] + translate[0], vertex[1] + translate[1], vertex[2] + translate[2], 1);
        // normal
        normal = vec3.fromValues( 0, sign, 0);
        vec3.normalize(normal, normal);
        vec3.transformMat4(normal, normal, rotation);
        normals.push( normal[0], normal[1], normal[2], 0);
        // increase index
        index ++;
      }
      // save the index of the last center vertex
      centerIndexEnd = index;
      // now we generate the surrounding vertices, normals and uvs
      for ( x = 0; x <= radialSegments; x ++ ) {
        var u = x /  radialSegments;
        var theta = u *  thetaLength +  thetaStart;
        var cosTheta = Math.cos( theta );
        var sinTheta = Math.sin( theta );
        // vertex
        vertex = vec3.fromValues(radius * sinTheta,  halfHeight * scale * sign, radius * cosTheta);
        vec3.transformMat4(vertex, vertex, rotation);
        vertices.push( vertex[0] + translate[0], vertex[1] + translate[1], vertex[2] + translate[2], 1);
        // normal
        normal = vec3.fromValues( 0, sign, 0);
        vec3.normalize(normal, normal);
        vec3.transformMat4(normal, normal, rotation);
        normals.push( normal[0], normal[1], normal[2], 0);
        // increase index
        index ++;
      }
      // generate indices
      for ( x = 0; x < radialSegments; x ++ ) {
        var c = centerIndexStart + x + verticeslength;
        var i = centerIndexEnd + x + verticeslength;
        if ( top === true ) {
          // face top
          indices.push( i, i + 1, c );
        } else {
          // face bottom
          indices.push( i + 1, i, c );
        }
        groupCount += 3;
      }
      groupStart += groupCount;      
    }

    this.indices = new Uint32Array(indices);//bottom
    this.normals = new Float32Array(normals); //bottom
    this.positions = new Float32Array(vertices); //bottom
    
    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    // for(let i = 0; i<this.indices.length; i+=3)
    // {
    //   console.log('indice ' + indices[i] + ' '+ indices[i+1] + ' '+ indices[i+2] + ' ');
    // }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cylinders with ` + this.positions.length / 4 + ' vertices');
  }
};

export default Cylinders;
