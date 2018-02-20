import {vec2, vec3, vec4, mat4} from 'gl-matrix';

class Branch{
    startpoint: vec3;
    endpoint: vec3;
    depth: number;

    constructor(startpoint: vec3, endpoint: vec3, depth: number)
    {
        this.startpoint = startpoint;
        this.endpoint = endpoint;
        this.depth = depth;
    }
}

export default Branch;