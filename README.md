# Drive Through Image Slider
Simple animated image slideshow plugin for HTML. 

1. Allows binding events to shift the slider in either direction \
![image](gifs/shiftleftright.gif)
2. Allows easy customization with animation speeds \
![image](gifs/fastshift.gif)
3. Easy to set up \
![image](gifs/drivethrough.PNG)


### JSFiddle demo
https://jsfiddle.net/agirmani/qh9j4kt7/18/

### CDN'S
1. Stylesheet\
`<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/hauks96/drive-through-image-slider/posterDriveThrough/drive_through.css">`
2. Script\
`<script src="https://cdn.jsdelivr.net/gh/hauks96/drive-through-image-slider/posterDriveThrough/drive_through.js"></script>`

### Dependencies
1. JQuery slim-min or greater\
Make sure it is loaded before the image slider script cdn. See the JsFiddle example for reference.


### Setup
#### 1. The bare minimum
The minimal required to make the drive through work is the following.
```
<div class="poster-drive-through" data-target="some-class">
    <div class="poster new-poster-left">
        <img src="" alt="new left poster">
    </div>

    <div class="poster left-poster">
        <img src="" alt="left poster">
    </div>

    <div class="active-poster">
        <img src="" alt="center poster">
    </div>

    <div class="poster right-poster">
         <img src="" alt="right poster">
    </div>


    <div class="poster new-poster-right">
        <img src="" alt="new right poster">
    </div>
</div>
```
In addition to this you **must** have elements with class `some-class` related to the drive throughs `data-target` that contain your images. **One** of the direct descendants of these elements must be an `<img>` tag for the slider to fetch images on demand.\
Example:
```
<div class="some-class">
    <div id="Some random div">...</div>
    <img src="..." alt="1">
</div>
<div class="come-class">
    <img src="..." alt="2">
    <div id="Some random div">...</div>
</div>
...
```
#### 2. Custom settings
a) **animate-on-load** \
  If you don't want the drive through to animate on page load you can set the animate-on-load to false.\
  `<div class="poster-drive-through" data-target="some-class" animate-on-load="false">...`
  
b) **start-index** \
  Set the index (number) of the image you want to animate when the drive through loads. By default this will be set to zero. You can also set it to 'random' if you want to load   images on   a random index on each page reload. The index is related to how the elements are placed in the dom. The index of the desired element is the same as the index of it   in the result of getElementsByClassName(some-class).\
  `<div class="poster-drive-through" data-target="some-class" start-index="random">...`
  
c) **fixed-max-height** \
  This setting is to make sure the drive through doesn't have different heights when it scrolls through your images. This happens if your images aren't all the same height. To     tackle this you can fix the height of the slider to be the maximum height it would achieve with the largest image in the active center position.
  `<div class="poster-drive-through" data-target="some-class" fixed-max-height="true">...`
  
d) **shift-on-click**\
  On the left and right posters (elements with classes `left-poster` & `right-poster`) you have the option to make them shift if they are pressed.
  ```
  ...
    <div class="poster left-poster" shift-on-click="true">
        <img src="" alt="left poster">
    </div>
    ...
    <div class="poster right-poster" shift-on-click="true">
         <img src="" alt="right poster">
    </div>
```
If any of these custom attributes are missing from the slider, you will be notified in the console, so make sure to check the console on your first setup.
  
