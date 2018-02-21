# CIS 566 Project 4: L-systems

* Name: Linshen Xiao
* PennKey: Linshen
* Tested on: Windows 10, Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16.0GB, NVIDIA GeForce GTX 970M (Personal computer)

![](img/cover.png)

## Demo

- [https://githublsx.github.io/homework-4-l-systems-githublsx/](https://githublsx.github.io/homework-4-l-systems-githublsx/);

## Assignment Description

For this assignment, you will design a set of formal grammar rules to create
a plant life using an L-system program. Once again, you will work from a
Typescript / WebGL 2.0 base code like the one you used in homework 0. You will
implement your own set of classes to handle the L-system grammar expansion and
drawing. You will rasterize your L-system using faceted geometry. Feel free
to use ray marching to generate an interesting background, but trying to
raymarch an entire L-system will take too long to render!

## Assignment Details

### L-System Components
I've created a Branch class for each cylinder and obj with following components:

* Startpoint: The startpoint of each cylinder or the position of each obj;
* Endpoint: The endpoint of each cylinder or the translated normal of each obj
* Depth: How many steps has the cylinder grown, used to decide the radius and other attributes of the branch;

I've created a L-Turtle class with following components:

* pos: Current pos of the turtle;
* up: Current up direction vector of the turtle;
* forward: Current forward direction vector of the turtle;
* left: Current left direction vector of the turtle;

I've also created a stack onto which I can push and pop turtle states.

I've created a L-System class with following components:

* Basic
	*  num: How many times will the L-System initate;
	*  initator: Start string to be modified;
	*  start: The string that will be added in front of the result;
	*  length: The length one cylinder grow along forward direction;
	*  angle: The angle one cylinder will rotate;
	*  result: Final string after all rules applied; 
	*  branches: An array of branches to record startpoint, endpoint and the depth for each branch;
	*  transform: An array of transforms to record position, normal and the depth for each leaf;
	*  ruleleft: The string that will be modified;
	*  ruleright: The string that will be modified to;
*  Randomness
	*  length2: A possible range to add randomness to the length;
	*  angle2: A possible range to add randomness to the angle;
	*  randomness: A random number to make each cylinder rotate randomly along the corss product of forward direction and the world up vector;
	*  probablity: The probablity for the possible string that will be modified to, so that a Rule can represent multiple possible expansions for a character with different probabilities;
	*  leafamount: A range from 0 ~ 1 to decide the amount of leaves;
	*  depthoffset: A range to add randomness to the depth of branches;
    *  largestpos: A vec3 to record max pos of the bounding box of all leaves;
    *  smallestpos: A vec3 to record min pos of the bounding box of all leaves;

I've also create cylinders and objs class in which to store the VBOs that will represent all of the faceted geometry. Instead of drawing individual mesh components one at a time, which will cause the program to render very slowly, I expand lists of vertex information when reading the generated grammar, and push all VBO data to the GPU at once after finished parsing the entire string for drawing.

### OBJ loading
I've enabled my program to import OBJ files and store their information in VBOs. I used an OBJ-loading package via NPM:

[webgl-obj-loader](https://www.npmjs.com/package/webgl-obj-loader)

I read the local test file by using the method via following website:

[How to read a local text file?](https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file)

### Aesthetic Requirements
The tree have the following attributes:

* It grows in 3D;
* It has branch decoration in addition to basic branch geometry;
* I add organic variation with noise in the angle and step of growing cylinders, as well as randomness in grammar expansion;
* I make a variation on the grammar from the pdf [Graphical modeling using L-systems](http://algorithmicbotany.org/papers/abop/abop-ch1.pdf). Instead of having 3 branches ad division point, I add a randomness to the tree so that the user can decide the probablity of the division into 2, 3 or 4 branches;
* I add animation of wind to the branches and the leaves. The strength of animation based on the  position.y, the sin wave of the wind is decided by position.x and position.z;
* I add falling leaves to the tree. First, I will record the bounding box of all leaves, then large amount of leaves will be randomly generated inside the box. I push another array to record each leaves' center position, and push all VBO data to the GPU. The position.y of the leaves is decided by original position.y-mod(u_time, center.y), the sin swing is decided by position.x and position.z;
* I also add perlin noise based stars to the background;

### Interactivity
I use dat.GUI to make lots of aspects of the demo an interactive variable, including:

* Branch
	* Color
	* Overall Radius
	* Radial Segment
	* Radius at the end
	* Lsystem
		* Basic
			* Iteration
			* Degree
			* Step
		* Rules
			* Start
			* Axoim
			* Lots of grammar rules and their probablities
		* Noise
			* Randomness for degree
			* Randomness for step
			* Overall Randomness
* Leaf
	* Color
	* On the tree
		* Amount
	* Falling leaves
		* Amount
		* Falling speed
		* Strength of swaying
* Others
	* Color for dirt
	* Color for stage
* Wind
	* Height: The strength of wind affect the tree accroding to height
	* Directionx
	* Directionz
	* Amount: The frequency of the waves
	* Amount2: Another frequency of the waves
	* Strength: Overall strength
* Light
	* Lightposy: Position.y of point light
	* Lightvecx: Directionx of Direction light
	* Lightvecy: Directiony of Direction light
	* Lightvecz: Directionz of Direction light
	* Lightlerp: Lerp between point and direction light vec
	* Lightambient: Add ambient to the color
* Load Scene: Remember to press load scene to regenerate the tree after modifying the attributes!

### Other screenshots

Every time you hit 'Generate' you will get a random tree:

|![](img/1.png)|![](img/2.png)|![](img/3.png)|![](img/4.png)|
|--------------|--------------|--------------|--------------|
|![](img/5.png)|![](img/6.png)|![](img/7.png)|![](img/8.png)|
|![](img/9.png)|![](img/10.png)|![](img/11.png)|![](img/12.png)|
|![](img/13.png)|![](img/14.png)|![](img/15.png)|![](img/16.png)|