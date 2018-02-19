import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cylinder extends Drawable {
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


  constructor(center: vec3,  radiusTop: number, radiusBottom: number, height: number, radialSegments: number, heightSegments: number, openEnded: Boolean, thetaStart: number, thetaLength: number) {
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
  
	generateTorso();
  if ( openEnded === false ) {
    if ( radiusTop > 0 ) generateCap( true );
    if ( radiusBottom > 0 ) generateCap( false );
  }

  function generateTorso() {
    var x, y;
    var normal;
    var vertex;
    var groupCount = 0;
    var slope = ( radiusBottom - radiusTop ) / height;
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
        vertex = vec3.fromValues(radius * sinTheta, -(v * height -  halfHeight), radius * cosTheta);
        vertices.push( vertex[0], vertex[1], vertex[2], 1);
        // normal
        normal = vec3.fromValues( sinTheta, slope, cosTheta );
        vec3.normalize(normal, normal);
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
        var a = indexArray[ y ][ x ];
        var b = indexArray[ y + 1 ][ x ];
        var c = indexArray[ y + 1 ][ x + 1 ];
        var d = indexArray[ y ][ x + 1 ];
        // faces
        indices.push( a, b, d );
        indices.push( b, c, d );
        // update group counter
        groupCount += 6;
      }
    }
    groupStart += groupCount;
  }

    function generateCap( top: boolean ) {
      var x, centerIndexStart, centerIndexEnd;
      var vertex;
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
        vertices.push( 0, halfHeight * sign, 0 , 1);
        // normal
        normals.push( 0, sign, 0, 0);
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
        vertex = vec3.fromValues(radius * sinTheta,  halfHeight * sign, radius * cosTheta);
        vertices.push( vertex[0], vertex[1], vertex[2], 1);
        // normal
        normals.push( 0, sign, 0, 0);
        // increase index
        index ++;
      }
      // generate indices
      for ( x = 0; x < radialSegments; x ++ ) {
        var c = centerIndexStart + x;
        var i = centerIndexEnd + x;
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created cylinder with ` + this.positions.length / 4 + ' vertices');
  }
};

export default Cylinder;
