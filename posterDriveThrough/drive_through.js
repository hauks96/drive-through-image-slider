/*
 *© Copyright 2021 Aegir Mani Hauksson

 * FAIR USE NOTICE:
 * All material contained within this document can be used and extended upon without direct permission
 * as long as the author of the original content, Aegir Mani Hauksson is credited.

 * LAST UPDATED:
 * 09.01.2021

 * AUTHOR: Aegir Mani Hauksson
 * EMAIL: aegir19@ru.is

*/

/* DEPENDENCIES:
    - JQuery slim-min or greater
    - 2010+ Browser
*/

// Giving all poster-drive-through elements in the dom a class 'DriveThrough'
$(window).on('load', function (){
    let drive_through_elements = document.getElementsByClassName('poster-drive-through');
    if (drive_through_elements===null || drive_through_elements===undefined || drive_through_elements.length === 0){
        return;
    }
    for (let i=0; i<drive_through_elements.length; i++){
        drive_through_elements[i].DriveThrough = new ImageDriveThrough(drive_through_elements[i]);
    }
});

class ImageDriveThrough {
    constructor(domDriveThroughElement) {
        this.drive_through = domDriveThroughElement;
        /* Class name of the left poster */
        this.leftPosterClassName = 'left-poster';

        /* Class name of the right poster */
        this.rightPosterClassName = 'right-poster';

        /* Class name of the center poster */
        this.centerPosterClassName = 'active-poster';

        /* Class name of the hidden poster on the left */
        this.hiddenLeftPosterClassName = 'new-poster-left';

        /* Class name of the hidden poster on the right */
        this.hiddenRightPosterClassName = 'new-poster-right';

        /* The class that animates the left poster moving to the left. */
        this.animationClassLeftToLeft = "move-left-poster-out-of-screen";

        /* The class that animates the left poster moving to the left */
        this.animationClassLeftToRight = "move-left-poster-to-active";

        /* The class that animates the right poster moving to the left */
        this.animationClassRightToRight = "move-right-poster-out-of-screen";

        /* The class that animates the right poster moving to the right */
        this.animationClassRightToLeft = "move-right-poster-to-active";

        /* The class that animates the center poster moving to the left */
        this.animationClassCenterToLeft = "move-active-left";

        /* The class that animates the center poster moving to the right */
        this.animationClassCenterToRight = "move-active-right";

        /* The class that animates the new poster coming in from the left */
        this.animationClassHiddenToLeft = "move-new-poster-from-left";

        /* The class that animates the new poster coming in from the right */
        this.animationClassHiddenToRight = "move-new-poster-from-right";

        /* The class that animates the left poster loading */
        this.animationClassLoadLeftPoster = "left-poster-load-animation";

        /* The class that animates the right  poster loading */
        this.animationClassLoadRightPoster = "right-poster-load-animation";

        /* The class that animates the center poster loading */
        this.animationClassLoadCenterPoster = "active-poster-load-animation";

        /* The class that does the hover effects on the left and right poster */
        this.leftRightPosterHoverClass = "left-right-poster-hover";

        /* The class that does the hover effects on the active poster */
        this.centerPosterHoverClass = "active-poster-hover";

        /* Tells whether it needs to modify the timings in the next shift operation */
        this.hasModifiedAnimationTime = false;

        /* Tells if the animation timings have been modified according to a left shift */
        this.animationTimeAdjustedRight = false;

        /* Tells if the animation timings have been modified according to a right shift */
        this.animationTimeAdjustedLeft = false;

        /* Set this variable with setAnimationTime(). Can be reset with resetAnimationTime().
         Default is 0. Setting animation time directly with this variable will not trigger time changes.*/
        this.animationTime = 0;

        /* If true, will apply animation reset on left and right on next shifts */
        this.requestedAnimationReset = false;

        /* This is the default animation times. Change them to adjust the animations. */
        this.defaultAnimationTimings = {
            'leftPoster': {'left': {'animation-delay' : 0, 'animation-time' : 0.7},
                           'right': {'animation-delay' : 0, 'animation-time' : 0.7}},
            'rightPoster': {'left': {'animation-delay' : 0, 'animation-time' : 0.7},
                           'right': {'animation-delay' : 0, 'animation-time' : 0.7}},
            'centerPoster': {'left': {'animation-delay' : 0, 'animation-time' : 0.7},
                             'right': {'animation-delay' : 0, 'animation-time' : 0.7}},
            'hiddenLeftPoster': {'right': {'animation-delay' : 0.2, 'animation-time' : 0.5}},
            'hiddenRightPoster': {'left': {'animation-delay' : 0.2, 'animation-time' : 0.5}}
        }

        this.#onLoadSetMaxHeight();
        this.#onLoadSetPosterNames();
        this.#onLoadSetOnClickSettings();
        this.loadDriveThrough();
    }

    /**
     * Returns the dom elements associated with the drive through data-target.
     * Utilizes the getElementsByClassName method.
     * @returns {HTMLCollectionOf<Element>} Collection of all image data targets
     */
    get choices(){
        /* Returns the dom elements associated with the drive through data-target. */
        return document.getElementsByClassName(this.dataTarget);
}

    /**
     * The start index of the drive through. References the start-index attribute of the drive through element.
     * This can be either an integer or the string 'random'.
     * @returns {number|string|string}
     */
    get startIndex(){
        return this.#getStartIndex();
    }
    set startIndex(index){
        /* Set the start index of the drive through. Valid options are integers or 'random' */
        this.drive_through.setAttribute('start-index', index);
    }
    #getStartIndex(){
        /* Gets the start-index attribute value from the drive through.
        Returns int if it was a valid number and string if it was the string 'random' */
        let start_idx = this.drive_through.getAttribute('start-index');
        if (start_idx === undefined || start_idx === null || start_idx===""){
            console.log("poster-drive-through missing custom attribute 'start-index'." +
                " Setting as 0");
            this.drive_through.setAttribute('start-index', '0');

        }
        else if (!(start_idx === 'random' || start_idx === '' || !isNaN(parseInt(start_idx)))){
            throw "Invalid index. Leave empty or set to 'random' to get random start index from image set. " +
            "Otherwise set as integer.";
        }

        if (!isNaN(parseInt(start_idx))){
            return parseInt(start_idx);
        }

        return start_idx;
    }

    /**
     * The animate-on-load attribute of the drive through element.
     * @returns {boolean} animate on load
     */
    get animateOnLoad(){
        /* Gets the animate-on-load attribute from the drive through */
        let animBool = this.drive_through.getAttribute('animate-on-load');
        if (animBool===null || animBool===undefined){
            console.log("poster-drive-through missing custom attribute 'animate-on-load'. Setting as true.");
            this.drive_through.setAttribute('animate-on-load', 'true');
            return true;
        }
        else if (animBool.toLowerCase()==='true'){
            return true;
        }
        else if (animBool.toLowerCase()==='false'){
            return false;
        }
        return false;
    }
    set animateOnLoad(boolAnimate){
        /* Set the animate-on-load attribute of the drive through. Takes boolean argument. */
        if (boolAnimate){
            this.drive_through.setAttribute('animate-on-load', 'true');
            return;
        }
        this.drive_through.setAttribute('animate-on-load', 'false');
    }

    /**
     * The data-target attribute of the drive through element.
     * @returns {String} data-target value
     */
    get dataTarget(){
        /* Gets the data-target attribute value of the drive through */
        return this.#getDataTargetOrError();
    }
    set dataTarget(className){
        /* Set a new data target for the drive through. The data target value should be a class which your
        images are contained within (one image in each div with this class) */
        this.#setDataTargetOrError(className);
    }
    #getDataTargetOrError(){
        /* Returns the classname of the data target of the current poster drive through. Throws
        * an error if the attribute is missing or the value doesn't return any elements. */
        let data_target = $(this.drive_through).attr('data-target');
        if (data_target === undefined || data_target === null || data_target===""){
            throw "poster-drive-through class missing attribute 'data-target' for image selection";
        }
        let check_elem = document.getElementsByClassName(data_target);
        if (check_elem === null || data_target === undefined || check_elem.length===0){
            throw "poster-drive-through has invalid data-target. There was no element with selected data target found. " +
            "Make sure the are elements that have the data-target as a class."
        }

        return data_target;
    }
    #setDataTargetOrError(className){
        /* Sets the data target for the drive through and checks if it is valid. */
        let check_elem = document.getElementsByClassName(className);
        if (check_elem === null || className === undefined || check_elem.length===0){
            throw "Invalid data-target for poster-drive-through. There was no element with selected data target found. " +
            "Make sure the data target is a class and that it has elements in the dom."
        }
        this.drive_through.setAttribute('data-target', className);
    }
    #getPosterOrError(position){
        /* Returns poster image element in drive through. positions are 'left', 'right', 'center'
        * 'hidden-left' and 'hidden-right' */
        if (typeof position!== 'string'){
            throw 'Position must be a string.';
        }
        if (!(position.toLowerCase()==='left' || position.toLowerCase()==='right' || position.toLowerCase()==='center'
             || position.toLowerCase()==='hidden-left' ||position.toLowerCase()==='hidden-right')){
            throw "Invalid position given. Options are left, right, center, hidden-right and hidden-left.";
        }
        let map_to_poster = {'left': this.leftPosterClassName,
                             'right': this.rightPosterClassName,
                             'center': this.centerPosterClassName,
                             'hidden-left': this.hiddenLeftPosterClassName,
                             'hidden-right': this.hiddenRightPosterClassName };

        let target_classname = map_to_poster[position];
        let target_element = this.drive_through.getElementsByClassName(target_classname);
        if (target_element === null || target_element===undefined || target_element.length===0){
            throw "poster-drive-through missing the html element with className: " + target_classname;
        }
        return target_element[0];
    }
    #getPosterIndex(poster){
        /* Retrieves the data-index attribute's value from a poster and returns it as an int if it is a number. */
        let idx = $(poster).attr('data-index');
        let domChoices = this.choices;

        if (idx===""){
            return 0;
        }
        if (isNaN(parseInt(idx))){
            throw "Attribute 'data-index has an invalid index in element '"+poster.className+"'.";
        }

        if (idx >= domChoices.length){
            console.log('Index was out of bounds +.');
            return domChoices.length;
        }

        if (idx < 0){
            console.log('Index was out of bounds -.');
            return 0;
        }
        return parseInt(idx);
    }
    #setPosterIndex(poster, index){
        /* Set the data index of given poster */
        poster.setAttribute('data-index', index.toString());
    }

    /**
     * Set the data-index values of the left, right and center poster 
     * according to a new index of the center poster. Can take either an int or 'random'.
     * @param {integer | string} index 
     */
    setNewCenterIndex(index){
        /* Set the data-index values of the left, right and center poster
           according to a new index of the center poster */
        let choices = this.choices;
        if (index===null || index === undefined || index==='random' || index===''){
            // Random index between [ 0 and choices.length-1 ] both limits included
            index = Math.floor(Math.random() * Math.floor(choices.length-1))+1;
        }
        else if (choices.length-1<index){
            console.log("loadImagesByIndex: Invalid image loading index. Index too large, setting max.");
            index = choices.length-1
        }
        else if (index < 0){
            console.log("loadImagesByIndex: Invalid image loading index. Index too small, setting 0.");
            index = 0
        }

        /* EDGE CASES */
        if (choices.length===0){
            return;
        }

        // Setting new active poster index for reference
        this.centerIndex = index;

        if (choices.length===1){
            // Set all images as the same image
            this.centerIndex = 0;
            this.leftIndex = 0;
            this.rightIndex = 0;
            return;
        }

        if (choices.length===2){
            // Set left and right images as duplicate
            this.leftIndex = index%1;
            this.rightIndex = index%1;
            return;
        }

        // If random index is last poster in available choices
        if (index===choices.length-1){
            this.leftIndex = index-1;
            this.rightIndex = 0;
            return;
        }
        if (index===0){
            if (choices.length===2){
                this.leftIndex = index+1;
            } else {
                this.leftIndex = choices.length-1;
            }
            this.rightIndex = index+1;
            return;
        }
        /* EDGE CASES */

        this.leftIndex = index-1;
        this.rightIndex = index+1;
    }

    /**
     * Shift the indexes in the drive through in either direction by one.
     * If an end is met on either side, it will continue on the other side.
     * @param {String} direction In which direction to shift the images
     */
    shiftPosterIndexes(direction){
        let choices = this.choices;

        if(direction==="left"){
            // <-- push current images to left
            this.leftIndex = this.add_idx(this.leftIndex, choices.length-1);
            this.rightIndex = this.add_idx(this.rightIndex, choices.length-1);
            this.centerIndex = this.add_idx(this.centerIndex, choices.length-1);
        }
        else if (direction==='right'){
            // push current images to right -->
            this.leftIndex = this.neg_idx(this.leftIndex, choices.length-1);
            this.rightIndex = this.neg_idx(this.rightIndex, choices.length-1);
            this.centerIndex = this.neg_idx(this.centerIndex, choices.length-1);
        }
    }

    /**
     * Load 3 images from a given index of the center poster into the drive through.
     * @param {int} index Data index of the center poster
     */
    loadImagesByIndex(index){
        this.setNewCenterIndex(index);
        this.updateImages();
    }

    /**
     * Loads the drive through according to the start-index.
     * Only does the animation if the animate-on-load attribute is set to true
     */
    loadDriveThrough(){
        this.loadImagesByIndex(this.startIndex);
        if (this.animateOnLoad){
            this.#animatePageLoadSlideIn();
        }

        $(this.leftPosterImageElement).addClass(this.leftRightPosterHoverClass);
        $(this.rightPosterImageElement).addClass(this.leftRightPosterHoverClass);
        $(this.centerPosterImageElement).addClass(this.centerPosterHoverClass);
    }
    /**
     * The center poster dom element of the drive through.
     */
    get centerPoster(){
        /* Returns the active (center) poster dom element */
        return this.#getPosterOrError('center');
    }
    /**
     * The index of the center poster.
     * @returns {Number} index
     */
    get centerIndex(){
        /* Returns the index of the data target currently displayed as the active (center) poster according to
        * dom.getElementsByClassName(data-target) */
        return this.#getPosterIndex(this.centerPoster);
    }
    set centerIndex(index){
        /* Set the data index of the center poster */
        this.#setPosterIndex(this.centerPoster, index)
    }

    /**
     * The left poster dom element of the drive through.
     */
    get leftPoster(){
        /* Returns the left poster dom element */
        return this.#getPosterOrError('left');
    }

    /**
     * The index of the left poster.
     * @returns {Number} index
     */
    get leftIndex(){
        /* Returns the index of the data target currently displayed as the left poster according to
        * dom.getElementsByClassName(data-target) */
        return this.#getPosterIndex(this.leftPoster);
    }
    set leftIndex(index){
        /* Set the data index of the left poster */
        this.#setPosterIndex(this.leftPoster, index);
    }

    /**
     * The right poster dom element of the drive through.
     */
    get rightPoster(){
        /* Returns the right poster dom element */
        return this.#getPosterOrError('right');
    }

    /**
     * The index of the right poster.
     * @returns {Number} index
     */
    get rightIndex(){
        /* Returns the index of the data target currently displayed as the right poster according to
        * dom.getElementsByClassName(data-target) */
        return this.#getPosterIndex(this.rightPoster);
    }
    set rightIndex(index){
        this.#setPosterIndex(this.rightPoster, index);
    }

    /**
     * The hidden right poster dom element of the drive through.
     */
    get hiddenRightPoster(){
        /* Get the hidden animation poster on the right */
        return this.#getPosterOrError('hidden-right');
    }

    /**
     * The hidden left poster dom element of the drive through.
     */
    get hiddenLeftPoster(){
        /* Get the hidden animation poster on the left */
        return this.#getPosterOrError('hidden-left');
    }

    /**
     * Negates 1 from an index, goes to max idx if overflows 0
     * @param {number} idx - The current index
     * @param {number} max_idx - The index of the last element in list
     */
    neg_idx(idx, max_idx){
        /* Negates 1 from an index, goes to max idx if overflows 0 */
        if (idx===0){
            return max_idx;
        }
        return idx-1;
    }
    /**
     * Adds 1 to an index, goes to zero if overflows max
     * @param {number} idx - The current index
     * @param {number} max_idx - The index of the last element in list
     */
    add_idx(idx, max_idx){
        /* Adds 1 to an index, goes to zero if overflows max */
        if (idx===max_idx){
            return 0;
        } return idx+1;
    }

    #getImageElementOrError(poster){
        /* Get the image element of a poster */
        let img_ele = poster.getElementsByTagName('img');
        if (img_ele===undefined || img_ele===null || img_ele.length===0){
            throw "Trying to get an image poster within an element that doesn't have one";
        }
        if (img_ele.length>1){
            console.log("WARNING: Too many image attributes in element '"+poster.className+"'. " +
                        "Only one will be used.");
        }
        return img_ele[0]
    }

    /**
     * The img element of the left poster.
     */
    get leftPosterImageElement(){
        /* The dom element that contains the left posters image */
        return this.#getImageElementOrError(this.leftPoster);
    }
    /**
     * The image source of the left poster.
     */
    get leftPosterImageSrc(){
        /* The image source value of the left poster */
        return this.leftPosterImageElement.src;
    }
    set leftPosterImageSrc(url){
        /* Set a new image to the left poster */
        this.leftPosterImageElement.src = url;
    }
    /**
     * The img element of the right poster.
     */
    get rightPosterImageElement(){
        /* The dom element that contains the right poster */
        return this.#getImageElementOrError(this.rightPoster);
    }
    /**
     * The image source of the right poster.
     */
    get rightPosterImageSrc(){
        /* The image source value of the left poster */
        return this.rightPosterImageElement.src;
    }
    set rightPosterImageSrc(url){
        /* Set a new image to the right poster */
        this.rightPosterImageElement.src = url;
    }

    /**
     * The img element of the right poster.
     */
    get centerPosterImageElement(){
        /* The dom element that contains the center poster */
        return this.#getImageElementOrError(this.centerPoster);
    }

    /**
     * The image source of the center poster.
     */
    get centerPosterImageSrc(){
        /* The image source value of the left poster */
        return this.centerPosterImageElement.src;
    }
    set centerPosterImageSrc(url){
        /* Set a new image to the center poster */
        this.centerPosterImageElement.src = url;
    }

    /**
     * The img element of the hidden left poster.
     */
    get hiddenLeftPosterImageElement(){
        /* The dom element that contains the hidden left poster */
        return this.#getImageElementOrError(this.hiddenLeftPoster);
    }

    /**
     * The image source of the hidden left poster.
     */
    get hiddenLeftPosterImageSrc(){
        /* The image source value of the hidden left poster */
        return this.hiddenLeftPosterImageElement.src;
    }
    set hiddenLeftPosterImageSrc(url){
        /* Set a new image to the hidden left poster */
        this.hiddenLeftPosterImageElement.src = url;
    }

    /**
     * The img element of the hidden right poster.
     */
    get hiddenRightPosterImageElement(){
        return this.#getImageElementOrError(this.hiddenRightPoster);
    }

    /**
     * The image source of the hidden left poster.
     */
    get hiddenRightPosterImageSrc(){
        /* The image source value of the hidden left poster */
        return this.hiddenLeftPosterImageElement.src;
    }
    set hiddenRightPosterImageSrc(url){
        /* Set a new image to the hidden right poster */
        this.hiddenRightPosterImageElement.src = url;
    }

    #animatePageLoadSlideIn(){
        /* Trigger the page load slide in animation */
        // If attribute doesn't exist
        let val="true";
        if (!this.drive_through.hasAttribute('animate-on-load')){
            console.log("poster-drive-through missing custom attribute 'animate-on-load'. Setting as true.");
            this.drive_through.setAttribute('animate-on-load', 'true');
        }
        else { val = this.drive_through.getAttribute('animate-on-load'); }
        // if false
        if (val.toLowerCase()==='false'){
            console.log("Didnt animate load.")
            return;
        }
        // If not true and not false
        else if (val.toLowerCase()!=='true') {
            console.log('poster-drive-through')
            this.drive_through.setAttribute('animate-on-load', 'true');
        }

        let left_poster = this.leftPoster;
        $(left_poster).addClass(this.animationClassLoadLeftPoster);
        $(left_poster).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            $(this).removeClass(this.animationClassLoadLeftPoster);
        })

        let active_poster = this.centerPoster;
        $(active_poster).addClass(this.animationClassLoadCenterPoster);
        $(active_poster).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            $(this).removeClass(this.animationClassLoadCenterPoster);
        });

        let right_poster = this.rightPoster;
        $(right_poster).addClass(this.animationClassLoadRightPoster);
        $(right_poster).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            $(this).removeClass(this.animationClassLoadRightPoster);
        });
    }
    #animateLeftPosterLeft(new_left_image){
        /* Animate the left poster moving to the left */
        let cls = this.animationClassLeftToLeft;
        let hover = this.leftRightPosterHoverClass;
        this.#animatePoster(this.leftPosterImageElement, new_left_image, cls, hover, 'left');
    }
    #animateLeftPosterRight(new_left_image){
        /* Animate left poster moving to the right */
        let cls = this.animationClassLeftToRight;
        let hover = this.leftRightPosterHoverClass;
        this.#animatePoster(this.leftPosterImageElement, new_left_image, cls, hover, 'right');
    }
    #animateRightPosterLeft(new_right_image){
        /* Animate right poster moving left */
        let cls = this.animationClassRightToLeft
        let hover = this.leftRightPosterHoverClass;
        this.#animatePoster(this.rightPosterImageElement, new_right_image, cls, hover, 'left');
    }
    #animateRightPosterRight(new_right_image){
        /* Animate right poster moving right */
        let cls = this.animationClassRightToRight;
        let hover = this.leftRightPosterHoverClass;
        this.#animatePoster(this.rightPosterImageElement, new_right_image, cls, hover, 'right');
    }
    #animateCenterPosterLeft(new_center_image){
        /* Animate the center poster moving left */
        let cls = this.animationClassCenterToLeft;
        let hover = this.centerPosterHoverClass;
        this.#animatePoster(this.centerPosterImageElement, new_center_image, cls, hover, 'left');
    }
    #animateCenterPosterRight(new_center_image){
        /* Animate the center poster moving right */
        let cls = this.animationClassCenterToRight;
        let hover = this.centerPosterHoverClass;
        this.#animatePoster(this.centerPosterImageElement, new_center_image, cls, hover, 'right');
    }
    #animatePoster(poster_image_ele, new_image, cls, hover_cls, direction){
        /* Animate the given poster */
        void poster_image_ele.offsetWidth;
        poster_image_ele.classList.remove(hover_cls);
        //poster_image_ele.classList.remove(cls);
        poster_image_ele.classList.add(cls);
        this.#applyAnimationTime(poster_image_ele, direction);
        $(poster_image_ele).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            if ($(this).hasClass(cls)){
                $(this).removeClass(cls);
                $(this).addClass(hover_cls);
            }
            poster_image_ele.src = new_image;
        })

    }
    #animateHiddenLeftPoster(new_hidden_left_image){
        /* Animate the hidden left poster coming in from the left */
        let cls = this.animationClassHiddenToLeft;
        let new_poster_image = this.hiddenLeftPosterImageElement;
        void new_poster_image.offsetWidth;
        new_poster_image.classList.add(cls); // Adding animation class
        this.#applyAnimationTime(new_poster_image, 'right');
        new_poster_image.src = new_hidden_left_image; // Set new image before animating
        $(new_poster_image).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            if ($(new_poster_image).hasClass(cls)){
                $(new_poster_image).removeClass(cls);
                this.drive_through.setAttribute('animating', 'false');
                }
        }.bind(this));
    }
    #animateHiddenRightPoster(new_hidden_right_image){
        /* Animate the hidden right poster coming in from the right */
        let cls = this.animationClassHiddenToRight;
        let new_poster_image = this.hiddenRightPosterImageElement;
        void new_poster_image.offsetWidth;
        new_poster_image.classList.add(cls); // Adding animation class
        this.#applyAnimationTime(new_poster_image, 'left');
        new_poster_image.src = new_hidden_right_image; // Set new image before animating
        $(new_poster_image).on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (){
            if ($(new_poster_image).hasClass(cls)){
                $(new_poster_image).removeClass(cls);
                this.drive_through.setAttribute('animating', 'false');
            }
        }.bind(this));
    }
    #animateShift(direction, new_images){
        /* Animates a shift in either direction. Directions are left and right.
         Takes a list with 3 images [new left, new center, new right] */
        if (direction.toLowerCase()==='left'){
            this.drive_through.setAttribute('animating', 'true');
            this.#animateLeftPosterLeft(new_images[0]);
            this.#animateCenterPosterLeft(new_images[1]);
            this.#animateRightPosterLeft(new_images[2]);
            this.#animateHiddenRightPoster(new_images[2]);
            if (this.hasModifiedAnimationTime || this.requestedAnimationReset){
                this.animationTimeAdjustedLeft = true;
            }
        }
        else if (direction.toLowerCase()==='right'){
            this.drive_through.setAttribute('animating', 'true');
            this.#animateLeftPosterRight(new_images[0]);
            this.#animateCenterPosterRight(new_images[1]);
            this.#animateRightPosterRight(new_images[2]);
            this.#animateHiddenLeftPoster(new_images[0]);
            if (this.hasModifiedAnimationTime || this.requestedAnimationReset){
                this.animationTimeAdjustedRight = true;
            }
        }
        else if (direction.toLowerCase()!=='right' && direction.toLowerCase()!=='left'){
            throw "Direction not recognized. left or right available."
        }

        if (this.requestedAnimationReset && this.animationTimeAdjustedLeft && this.animationTimeAdjustedRight){
            this.requestedAnimationReset = false;
            this.animationTimeAdjustedRight = false;
            this.animationTimeAdjustedLeft = false;
        }
    }

    /**
     * Returns the total height of the drive through (with padding and margin).
     * Uses jquery's outerHeight() method.
     * @returns {number} The height in pixels.
     */
    get height(){
        /* Returns the total height of the drive through (with padding and margin).
        Uses jquery's outerHeight() method. */
        return $(this.drive_through).outerHeight();
    }
    set height(heightPx){
        /* Set a height to the drive through */
        this.drive_through.style.height = heightPx+"px";
    }

    /**
     * The fixed-max-height attribute of the drive through. 
     * Determines whether the height is automatically set to the maximum needed height at page load
     * to avoid page shifting up and down.
     * @returns {boolean} True or false
     */
    get heightSetting(){
        /* Get the fixed-max-height attribute of the drive through */
        return this.#getHeightSetting();
    }
    set heightSetting(boolFixed) {
        /* Set the fixed-max-height attribute of the drive through. */
        if (boolFixed){
            this.drive_through.setAttribute('fixed-max-height', 'true');
        } else {
            this.drive_through.setAttribute('fixed-max-height', 'false');
        }
    }

    /**
     * The maximum height the drive through would achice with the largest of the available data targets set in the center.
     * @returns {number} Height in pixels
     */
    get maxActiveHeight(){
        /* The maximum height that the drive through would achieve with the largest image in the data-target set in the center */
        let max_height = 0;
        let choices = this.choices;
        let src = "";
        for (let i=0; i<choices.length; i++) {
            let curr_height = $(choices[i].getElementsByTagName('img')).height()
            if (curr_height>max_height){
                max_height = curr_height
                src = choices[i].getElementsByTagName('img')[0].src;
            }
        }
        let active_poster = this.centerPoster
        let current_image = this.centerPosterImageSrc;
        this.centerPosterImageSrc = src;
        let ele_final_height = $(active_poster).outerHeight();
        this.centerPosterImageSrc = current_image;
        return ele_final_height;
    }

    #getHeightSetting(){
        /* Get the fixed-max-height attribute from the drive through */
        let set_fixed = this.drive_through.getAttribute('fixed-max-height');
        if (set_fixed===undefined || set_fixed===null){
            console.log("poster-drive-through missing custom attribute 'fixed-max-height'. Setting as true.");
            this.drive_through.setAttribute('fixed-max-height', 'true');
            return true;
        }
        if (set_fixed.toLowerCase()==='true'){
            return true;
        } else if (set_fixed.toLowerCase()==='false'){
            return false;
        } else {
            console.log("poster-drive-through custom attribute 'fixed-max-height' has an invalid boolean value. " +
                "Setting to true.")
            return true;
        }
    }
    /**
     * Sets drive through height according to the tallest image available.
     */
    setFixedMaxHeight(){
        /* Sets drive through height according to the tallest image available */
        this.height = this.maxActiveHeight;
    }

    #onLoadSetMaxHeight(){
        if (this.heightSetting){
            this.setFixedMaxHeight();
        }
        // Resize the drivethrough if the window is resized.
        jQuery(function($){
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
          
            $(window).resize(function() {
              if(windowWidth != $(window).width() || windowHeight != $(window).height()) {
                this.setFixedMaxHeight();
                return;
              }
            }.bind(this));
        }.bind(this));
    }
    #onLoadSetPosterNames(){
        /* Give the posters a name on page load. */
        this.leftPosterImageElement.posterName = 'leftPoster';
        this.rightPosterImageElement.posterName = 'rightPoster';
        this.centerPosterImageElement.posterName = 'centerPoster';
        this.hiddenLeftPosterImageElement.posterName = 'hiddenLeftPoster';
        this.hiddenRightPosterImageElement.posterName = 'hiddenRightPoster';
    }
    #onLoadSetOnClickSettings(){
        /* Read the shift-on-click settings from the left and right poster on page load. If set to true,
        * when left and right posters are pressed they shift to either side. */
        let left_poster = this.leftPoster;
        let right_poster = this.rightPoster;
        let left_setting = left_poster.getAttribute('shift-on-click');
        let right_setting = right_poster.getAttribute('shift-on-click');

        if (left_setting === "" ||left_setting ===null || left_setting === undefined){
            console.log("shift-on-click attribute missing on left poster. Setting as true.")
            left_poster.setAttribute('shift-on-click', 'true');  
        }
        else if (left_setting.toLowerCase() ==='true'){
            $(left_poster).on('click', function (){
                this.shiftRight();
            }.bind(this));
        } else {
            console.log("shift-on-click attribute on left poster had an invalid value. Only true and false permitted.")
        }

        if (right_setting === "" ||right_setting ===null || right_setting === undefined){
            console.log("shift-on-click attribute missing on right poster. Setting as true.")
            left_poster.setAttribute('shift-on-click', 'true');
        }
        else if (right_setting.toLowerCase() ==='true'){
            $(right_poster).on('click', function (){
                this.shiftLeft();
            }.bind(this));
        } else {
            console.log("shift-on-click attribute on right poster had an invalid value. Only true and false permitted.")
        }
    }

    #getChoiceImage(index){
        /* Get the ith data-target's image according to dom.getElementsByClassName(data-target) */
        let choices = this.choices;
        if (choices.length-1<index || index<0){
            throw 'Given index is out of bounds.';
        }
        return this.choices[index].getElementsByTagName('img')[0].src;
    }
    /**
     * Get the images associated with the current data-index of each poster.
     * @returns {[number, number, number]} [left, center, right]
     */
    getImages(){
        /* Get images from data target according to the data-index attribute of the left, center and right poster.
        * Returns a list of strings -> [src left, src center, src right] */
        return [this.#getChoiceImage(this.leftIndex),
                this.#getChoiceImage(this.centerIndex),
                this.#getChoiceImage(this.rightIndex)]
    }

    /**
     * Get the images that would be in the drive through if there were a rightshift.
     * @returns {[number, number, number]} [left, center, right]
     */
    checkNextImages(){
        /* Check the *next* 3 images that will be in the drive through if right poster is pressed,
        without changing anything */
        this.shiftPosterIndexes('left');
        let images = this.getImages()
        this.shiftPosterIndexes('right');
        return images;
    }

    /**
     * Get the images that would be in the drive through if there were leftshift .
     * @returns {[number, number, number]} [left, center, right]
     */
    checkPreviousImages(){
        /* Check the *previous* 3 images that will be in the drive through if left poster is pressed,
         without changing anything */
        this.shiftPosterIndexes('right');
        let images = this.getImages()
        this.shiftPosterIndexes('left');
        return images;
    }

    /**
     * Places new images in the drive through.
     * @param {[String, String, String]} new_images [left poster image, center poster image, right poster image]
     */
    setNewImages(new_images){
        /* Takes a list with 3 image urls and sets them into the drive through [Left, Center, Right] */
        this.leftPosterImageSrc = new_images[0]
        this.centerPosterImageSrc = new_images[1];
        this.rightPosterImageSrc = new_images[2];
    }

    /**
     * Updates the images in the drive through according to current the data-indexes of the posters.
     */
    updateImages(){
        /* Gets the images from data target and sets them in the posters. */
        let images = this.getImages();
        this.setNewImages(images);
    }

    /**
     * Perform a left shift on the drive through. All images are shifted one to the left.
     * This means that a new image will enter from the right side.
     */
    shiftLeft(){
        /* Shifts the poster rotation one to the left. */
        this.shiftPosterIndexes('left');
        let images = this.getImages();
        this.#animateShift('left', images);
    }

    /**
     * Perform a right shift on the drive through. All images are shifted one to the right.
     * This means that a new image will enter from the left side.
     */
    shiftRight(){
        /* Shifts the poster rotation one to the right. */
        this.shiftPosterIndexes('right');
        let images = this.getImages();
        this.#animateShift('right', images);
    }

    /**
     * Shift the drive through to a specific index. The direction tells in which direction to animate the shift.
     * @param {String} direction Shift direction, either left or right
     * @param {number} index New index of center poster.
     */
    shiftToIndex(direction, index){
        /* Set new poster rotation with active image as data-target[index].
        * This will do an animation from the side of your choice. Direction can be either 'left' or 'right'.*/
        let choices = this.choices;

        if (isNaN(parseInt(index))){
           throw 'New index must be an integer.'
        }
        index = parseInt(index);

        if (!(typeof direction === 'string')){
            throw "Invalid direction. Must be 'left' or 'right'";
        }

        if (direction.toLowerCase()==='right'){
            // Set index to one more than center in order to slide target it into center position
            this.setNewCenterIndex(index);
            this.shiftPosterIndexes('left');
            let images = this.getImages();
            this.setNewImages(images);
            this.shiftRight();

        } else if (direction.toLowerCase()==='left'){
            // Set index to one less than center in order to slide target it into center position
            this.setNewCenterIndex(index);
            this.shiftPosterIndexes('right');
            let images = this.getImages();
            this.setNewImages(images);
            this.shiftLeft();
        }

}
    /**
     * Change the time it takes to animate a shift in either direction. All delays are automatically adjusted to scale correctly.
     * @param {number} seconds 
     */
    setAnimationTime(seconds){
        /* Change the animation time.
        If the animations have a delay, the time will be automatically adjusted to scale correctly. */
        this.hasModifiedAnimationTime = true;
        this.animationTimeAdjustedRight = false;
        this.animationTimeAdjustedLeft = false;
        this.animationTime = seconds;
    }

    /**
     * Use this method to reset the animation time to default. 
     * The times from defaultAnimationTimings will be used.
     */
    resetAnimationTime(){
        this.hasModifiedAnimationTime = false;
        this.animationTimeAdjustedRight = false;
        this.animationTimeAdjustedLeft = false;
        this.requestedAnimationReset = true;
        this.animationTime = 0;
    }
    #applyAnimationTime(poster_img_element, direction){
        /* Applies the modified animation time if it has been set. The ratio between delay and animation time will be
        * accounted for. This is a helper function for the shifting methods. */
        let img_element = $(poster_img_element);
        let map_direction = {'left': this.animationTimeAdjustedLeft, 'right': this.animationTimeAdjustedRight}
        let isAdjusted = map_direction[direction];
        // If custom time
        if (this.hasModifiedAnimationTime && !isAdjusted){
            // Add custom animation time
            let animationTime = this.animationTime

            let delay = this.#getDefaultPosterAnimationDelay(poster_img_element, direction);
            let time = this.#getDefaultPosterAnimationTime(poster_img_element, direction);

            if (delay===null || delay===undefined || delay===0 || delay ===''){
                img_element.css('animation-duration', animationTime.toString()+"s");
                img_element.css('animation-delay', "0s");
            }
            else {
                let ratio_time;
                let ratio_delay;
                if (time>=delay){
                    ratio_time = delay/time;
                    ratio_delay = 1-ratio_time;
                } else {
                    ratio_delay = time/delay;
                    ratio_time = 1-ratio_delay;
                }

                img_element.css('animation-duration', (animationTime*ratio_time).toString()+"s");
                img_element.css('animation-delay', (animationTime*ratio_delay).toString()+"s");
            }
        }
        // If reset to default request
        else if (this.requestedAnimationReset && !isAdjusted){
            img_element.css('animation-duration',
                this.#getDefaultPosterAnimationTime(poster_img_element, direction).toString()+"s");
            img_element.css('animation-delay',
                this.#getDefaultPosterAnimationDelay(poster_img_element, direction).toString()+"s");

        }
    }
    #getDefaultPosterAnimationTime(posterImgEle, direction){
        /* Get the default animation timing in the direction given. */
        return this.defaultAnimationTimings[posterImgEle.posterName][direction]['animation-time'];
    }
    #getDefaultPosterAnimationDelay(posterImgEle, direction){
        /* Get the default animation timing in the direction given. */
        return this.defaultAnimationTimings[posterImgEle.posterName][direction]['animation-delay'];
    }
}

