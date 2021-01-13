$('.poster-block').on('click', function () {
    /* Set a new drive through image when user clicks on poster and add styling to the clicked image */
    let drive_through = document.getElementById('exampleDriveThrough');
    let curr_choice = $(this)[0];
    // The images available to the drive though
    let choices = drive_through.DriveThrough.choices;
    let target_idx = 0;
    let current_index = drive_through.DriveThrough.centerIndex;

    // Find the clicked boxes' index
    for (let i = 0; i < choices.length; i++) {
        // Set target index as i if found
        if (choices[i].isSameNode(curr_choice)) {
            target_idx = i;
        }
    }
    // Move drive through to new index
    shiftPostersFastToTarget(drive_through, current_index, target_idx).then(r =>
        // Add selection highlight to current
        addHighlight(choices, target_idx));


})

function addHighlight(choices, index){
    for (let i = 0; i < choices.length; i++) {
        // Set target index as i if found
        $(choices[i]).removeClass('border-light');
    }
    $(choices[index]).addClass('border-light');
}

//This is just an example of how you could use the time function to do something different
async function shiftPostersFastToTarget(drive_through, start_idx, end_idx) {
    /* Shifts until center poster is at the end_idx. Animates them fast and utilizes async await. */
    let choices = drive_through.DriveThrough.choices;
    let iterations;

    // If the start index is larger than the end index, wrap around to the start
    if (start_idx>end_idx){
        iterations = choices.length - (start_idx-end_idx);
    }

    // Otherwise just get the different
    else {
        iterations = end_idx-start_idx;
    }

    // Some custom variables set by experimenting with times
    let end_time = 0.05;
    let start_time = 0.01;
    let step = (end_time-start_time)/iterations;

    drive_through.DriveThrough.setAnimationTime(start_time);
    // Animate while we haven't reached the end index.
    while(start_idx!==end_idx){
        drive_through.DriveThrough.setAnimationTime(start_time);
        drive_through.DriveThrough.shiftLeft();
        start_time+=step; // Increase the animation time in each iteration
        start_idx = drive_through.DriveThrough.add_idx(start_idx, choices.length-1);
        await wait(start_time*1000); // Wait the exact time it takes the drive through to animate
    }
    // Reset the animation time to default when we are done
    drive_through.DriveThrough.resetAnimationTime();

}

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}