import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  attrCenter: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;

  unifTime: WebGLUniformLocation;
  unifHeight: WebGLUniformLocation;
  unifDirectionx: WebGLUniformLocation;
  unifDirectionz: WebGLUniformLocation;
  unifAmount: WebGLUniformLocation;
  unifAmount2: WebGLUniformLocation;
  unifStrength: WebGLUniformLocation;

  unifSpeed: WebGLUniformLocation; 
  unifLightposy: WebGLUniformLocation;

  unifLightvec: WebGLUniformLocation;
  unifLightlerp: WebGLUniformLocation;
  unifLightambient: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrCenter = gl.getAttribLocation(this.prog, "vs_Center");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
    this.unifHeight       = gl.getUniformLocation(this.prog, "u_Height");
    this.unifDirectionx   = gl.getUniformLocation(this.prog, "u_Directionx");
    this.unifDirectionz   = gl.getUniformLocation(this.prog, "u_Directionz");
    this.unifAmount       = gl.getUniformLocation(this.prog, "u_Amount");
    this.unifAmount2      = gl.getUniformLocation(this.prog, "u_Amount2");
    this.unifStrength     = gl.getUniformLocation(this.prog, "u_Strength");
    this.unifSpeed     = gl.getUniformLocation(this.prog, "u_Speed");
    this.unifLightposy = gl.getUniformLocation(this.prog, "u_Lightposy");
    this.unifLightvec = gl.getUniformLocation(this.prog, "u_Lightvec");
    this.unifLightlerp = gl.getUniformLocation(this.prog, "u_Lightlerp");
    this.unifLightambient = gl.getUniformLocation(this.prog, "u_Lightambient");
    
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }

  setHeight(time: number) {
    this.use();
    if (this.unifHeight !== -1) {
      gl.uniform1f(this.unifHeight, time);
    }
  }

  setDirectionx(time: number) {
    this.use();
    if (this.unifDirectionx !== -1) {
      gl.uniform1f(this.unifDirectionx, time);
    }
  }

  setDirectionz (time: number) {
    this.use();
    if (this.unifDirectionz !== -1) {
      gl.uniform1f(this.unifDirectionz , time);
    }
  }

  setAmount (time: number) {
    this.use();
    if (this.unifAmount  !== -1) {
      gl.uniform1f(this.unifAmount , time );
    }
  }

  setAmount2 (time: number) {
    this.use();
    if (this.unifAmount2 !== -1) {
      gl.uniform1f(this.unifAmount2, time);
    }
  }

  setStrength(time: number) {
    this.use();
    if (this.unifStrength !== -1) {
      gl.uniform1f(this.unifStrength, time);
    }
  }

  setSpeed(time: number) {
    this.use();
    if (this.unifSpeed !== -1) {
      gl.uniform1f(this.unifSpeed, time);
    }
  }

  setLightposy(time: number) {
    this.use();
    if (this.unifLightposy !== -1) {
      gl.uniform1f(this.unifLightposy, time);
    }
  }

  setLightvec(color: vec4) {
    this.use();
    if (this.unifLightvec !== -1) {
      gl.uniform4fv(this.unifLightvec, color);
    }
  }

  setLightlerp(time: number) {
    this.use();
    if (this.unifLightlerp !== -1) {
      gl.uniform1f(this.unifLightlerp, time);
    }
  }

  setLightambient(time: number) {
    this.use();
    if (this.unifLightambient !== -1) {
      gl.uniform1f(this.unifLightambient, time);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrCenter != -1 && d.bindCenter()) {
      gl.enableVertexAttribArray(this.attrCenter);
      gl.vertexAttribPointer(this.attrCenter, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCenter != -1) gl.disableVertexAttribArray(this.attrCenter);
  }
};

export default ShaderProgram;
