#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

in vec4 vs_Pos;             // The array of vertex positions passed to the shader

in vec4 vs_Nor;             // The array of vertex normals passed to the shader

in vec4 vs_Col;             // The array of vertex colors passed to the shader.
in vec4 vs_Center;
out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.

uniform float u_Lightposy;
uniform vec4 u_Lightvec;
uniform float u_Lightlerp;

uniform float u_Time;
uniform float u_Height;
uniform float u_Amount;
uniform float u_Amount2;
uniform float u_Strength;
uniform float u_Directionx;
uniform float u_Directionz;
uniform float u_Speed;
void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation

    mat3 invTranspose = mat3(u_ModelInvTr);
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);          // Pass the vertex normals to the fragment shader for interpolation.
                                                            // Transform the geometry's normals by the inverse transpose of the
                                                            // model matrix. This is necessary to ensure the normals remain
                                                            // perpendicular to the surface after the surface is transformed by
                                                            // the model matrix.
    float height = 50.0 / u_Height;
    vec2 direction = vec2(u_Directionx, u_Directionz);
    normalize(direction);
    // float amount = 0.08;
    // float amount2 = 1.5;
    // float strength = 2.0;
    float weight = (sin((u_Time + (vs_Pos.x * direction.x + vs_Pos.z * direction.y) * u_Amount) * u_Amount2))*u_Strength;
    vec4 newpos = vs_Pos + vec4(0.0, -mod(u_Time * u_Speed, vs_Center.y), weight, 0.0);
    //newpos.y = mod(newpos.y, vs_Pos.y);
    vec4 modelposition = u_Model * newpos;   // Temporarily store the transformed vertex positions for use below

    vec4 lightPos = vec4(0, u_Lightposy, 0, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.
    fs_LightVec = mix(normalize(lightPos - modelposition), normalize(u_Lightvec), u_Lightlerp);
    //fs_LightVec = vec4(1, 1, 1, 0);  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
}
