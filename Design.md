# overview of project

> [!NOTE]
> this design doc is a way to outline the design of the project and explain how it was implemented

### Due Deadline

2024-05-12

### handling the mix Base coloring

> [!NOTE]
> intializeColorMixer: assigns a color and a intensity for the color to be mixed with the texture/other colors;
> 0 <-close to the base color
> 1 <-closert tot he texture color;
> for some reason the cursor tracker thing doesn't work when dev tools open i think it might be the cursor it listetng with the chrome dev toold and not the html?
> just make sure to not have the dev tools open or it won't be registed

# things to work on

- [x] understainding the view matrixes more and what each one does
- [x] how to mapp the textures to the cubes correctly so they allign correctly and aren't jagged
- [x] rotation with camer with mouse
- [ ] performance:

# optional but would be nice:

adding a obj

### understanding each matrix and what it does:

u_ProjectionMatrix: specifies the square or how big of it the angle we are seeing in the matrix view.

u_ViewMatrix : this matrix is the matrix responsible for the controling the eye think of it as a line of it as the pov and it specifies what is is looking at or the target and the eye relation to that target

u_GlobalRotateMatrix : this matix is connceted to the user input for so that you can basically interatct
with the world
u_ModelMatrix: this is the the actual drawing you have specifices the dimensions for each block
a_Position : works in tanget to help draw things i.e the using 2d or 3d honeslty confusing but and at least you know what it does

### Camera things to note

. to keep track of the camera we use movementX and Y

movementX: This property gives the horizontal change in pixels between the current and previous mouse positions. If the mouse moved right, this value will be positive; if it moved left, the value will be negative.

movementY: This property gives the vertical change in pixels between the current and previous mouse positions. If the mouse moved down, this value will be positive; if it moved up, the value will be negative.

^^^ this is why we had to invert some of the value
