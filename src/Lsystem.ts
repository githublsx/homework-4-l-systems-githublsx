import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Stack from './Stack';
import Branch from './Branch'

class Lsystem{
    
    axiom: string;
    num: number;
    initator: string;
    length: number;
    length2: number;
    angle: number;
    angle2: number;
    result: string;
    branches: Branch[];
    ruleleft: string[];
    ruleright: string[];
    probablity: number[];
    transform: Branch[];
    start: string;
    randomness: number;
    leafamount: number;
    depthoffset: number;

//https://gist.github.com/bbengfort/11183420

    constructor(ruleleft: string[], ruleright: string[], probablity: number[], num: number = 3, initator: string = 'F', 
    length: number = 1, length2: number = 1, angle: number = 25 / 180 * Math.PI, angle2: number = 25 / 180 * Math.PI, 
    start: string, randomness: number, leafamount: number, depthoffset: number)
    {
        //this.axiom = axiom;
        this.ruleleft = ruleleft;
        this.ruleright = ruleright;
        this.probablity = probablity;
        this.num = num;
        this.initator = initator;
        this.length = length;
        this.length2 = length2;
        this.angle = angle;
        this.angle2 = angle2;
        this.branches = new Array<Branch>();
        this.transform = new Array<Branch>();
        this.start = start;
        this.randomness = randomness;
        this.leafamount = leafamount;
        this.depthoffset = depthoffset;
    }

    iterate(){
        var result = this.initator;
        for(var i = 0; i < this.num; i++)
        {
            result = this.translate(result);
        }
        this.result = this.start + result;
        //console.log(result);
    }

    translate(current: string){
        //Translate all the "F" with the axiom for current string
        var result = "";
        // var rule1 = "FF-[-F+F]+[+F-F]";
        // var rule2 = "FF+[+F]+[-F]";
        for(var i = 0; i < current.length; i++)
        {
            let fitrule = false;
            for(var j = 0; j < this.ruleleft.length; j++)
            {  
                if(current[i]==this.ruleleft[j])
                {
                    if(j==0)
                    {
                        if(Math.random()<=this.probablity[0])
                        {
                            result += this.ruleright[0];
                            fitrule = true;
                            break;
                        }
                        else if(Math.random()>=this.probablity[0]&&Math.random()<=this.probablity[0]+this.probablity[1])
                        {
                            result += this.ruleright[4];
                            fitrule = true;
                            break;
                        }
                        else
                        {
                            result += this.ruleright[5];
                            fitrule = true;
                            break;
                        }
                    }
                    else
                    {
                        result += this.ruleright[j];
                        fitrule = true;
                        break;
                    }
                }
            }
            if(!fitrule)
            {
                result += current[i];
                continue;
            }
        }
        return result;
    }

    process()
    {
        var turtle = new Turtle();
        var turtlestack = new Stack();
        var depthstack = new Stack();
        var result = this.result;
        var depth = 0;
        var maxdepth = depth;
        var forward = vec3.fromValues(0, 1, 0);
        var newangle = this.angle;
        for(var i = 0; i < result.length; i++)
        {
            if(result[i]=="F")
            {
                var startpos = turtle.pos;

                var axis = vec3.create();
                vec3.cross(axis, turtle.forward, forward);
                turtle.applyRot(0.005 * depth * this.randomness, axis);

                turtle.moveForward(this.length + (Math.random()*2-1) * this.length2);

                var endpos = turtle.pos;
                var branch = new Branch(startpos, endpos, depth);
                this.branches.push(branch);
                
                depth++;
                newangle = this.angle + depth * 0.005;
                if(depth > maxdepth)
                {
                    maxdepth = depth;
                }
            }
            else if(result[i]=="f")
            {
                // var axis = vec3.create();
                // vec3.cross(axis, turtle.forward, forward);
                // turtle.applyLeftRot(1 / 2 * Math.PI * depth);

                turtle.moveForward(this.length);
                //new rotation

                //onsole.log("afterrotate" + turtle.forward);
            }
            else if (result[i] == "+")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyUpRot(newangle);
            }
            else if (result[i] == "-")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyUpRot(-newangle);
            }
            else if (result[i] == "&")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyLeftRot(newangle);
            }
            else if (result[i] == "^")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyLeftRot(-newangle);
            }
            else if (result[i] == "\\")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyForwardRot(newangle);
            }
            else if (result[i] == "/")
            {
                newangle += (Math.random()*2-1) * this.angle2;
                turtle.applyForwardRot(-newangle);
            }
            else if (result[i] == "|")
            {
                turtle.applyUpRot(Math.PI);
            }
            else if (result[i] == "[")
            {
                //  console.log('push');
                //  console.log("turtle.pos" + turtle.pos);
                 var tempturtle = new Turtle();
                 tempturtle.copy(turtle);
                 turtlestack.push(tempturtle);
                 var tempdepth = new Number(depth);
                 depthstack.push(tempdepth);
                //  console.log('pushend');
                //  console.log("stack.peek.pos" + stack.peek().pos);
            }
            else if (result[i] == "]")
            {
                //  console.log("stack.peek.pos" + stack.pop().pos);
                //  console.log('popstart');
                //  console.log("turtle.pos" + turtle.pos);
                 turtle.copy(turtlestack.pop());
                 depth = depthstack.pop();
                 depth += Math.random() * this.depthoffset;
                //  console.log('pop');
                //  console.log('popend');
            }
            else if(result[i] == "!")
            {
                if(Math.random()<=this.leafamount)
                {
                    var branch = new Branch(turtle.pos, turtle.forward, depth);
                    this.transform.push(branch);
                }

            }
        }
        //map depth to 0 ~ 1
        for(let i = 1; i<this.branches.length; i++)
        {
            this.branches[i].depth /= maxdepth;
        }
    }
};

class Turtle{
    
    pos: vec3 = vec3.create();
    up: vec3 = vec3.create();
    forward: vec3 = vec3.create();
    left: vec3 = vec3.create();

    constructor(pos: vec3 = vec3.fromValues(0, 0, 0), up: vec3 = vec3.fromValues(0, 0, 1), forward: vec3 = vec3.fromValues(0, 1, 0), left: vec3 = vec3.fromValues(1, 0, 0))
    {
        this.pos = pos;
        this.up = up;
        this.forward = forward;
        this.left = left;
    }

    copy(turtle: Turtle)
    {
        this.pos = turtle.pos;
        this.up = turtle.up;
        this.forward = turtle.forward;
        this.left = turtle.left;
    }

    fromRotationMatrix()
    {
        return mat4.fromValues(this.forward[0], this.forward[1], this.forward[2], 0, 
            this.left[0], this.left[1], this.left[2], 0, 
            this.up[0], this.up[1],this.up[2],0,
            0,0,0,1);
    }

    moveForward(distance: number){
        this.pos = vec3.fromValues(this.pos[0] + distance * this.forward[0], this.pos[1] + distance * this.forward[1], this.pos[2] + distance * this.forward[2]);
    }
    applyUpRot(degrees: number){
        var mat = mat4.create();
        mat4.fromZRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }

    applyLeftRot(degrees: number){
        var mat = mat4.create();
        mat4.fromYRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }

    applyForwardRot(degrees: number){
        var mat = mat4.create();
        mat4.fromXRotation(mat, degrees);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }

    applyRot(degrees: number, axis: vec3){
        var mat = mat4.create();
        mat4.fromRotation(mat, degrees, axis);
        mat4.multiply(mat, this.fromRotationMatrix(), mat);
        var temp = vec4.create();
        vec4.transformMat4(temp, vec4.fromValues(0, 0, 1, 1), mat);
        this.up = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(0, 1, 0, 1), mat);
        this.left = vec3.fromValues(temp[0], temp[1], temp[2]);
        vec4.transformMat4(temp, vec4.fromValues(1, 0, 0, 1), mat);
        this.forward = vec3.fromValues(temp[0], temp[1], temp[2]);
    }
};

export default Lsystem;