function displayReviews() {
    var reviewsArray = [];
    firebase.database().ref('/reviews/').once('value', function(snapshot) {
        console.log(reviewsArray);
        snapshot.forEach(function(childSnapshot) {
            reviewsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        createGrid(reviewsArray);
    });
}

function createGrid(reviewsArray) {
    console.log(reviewsArray.length)
    document.getElementById("reviewsContainer").innerHTML = '';
    for (i = 0; i < reviewsArray.length; i++) {
        console.log('review');
        var stars = reviewsArray[i].value.stars;
        appendReview(
            reviewsArray[i].value.image,
            reviewsArray[i].value.textReview,
            reviewsArray[i].value.user,
            stars,
            i,
        );
    };
}

function appendReview(image, text, name, stars, num) {
    console.log('append review')
    if (image) {
        var review = 
        `<div class="reviewDiv">
            <img class="productImage reviewImage" src="${image}")">
            <p id="${num}stars"></p>
            <p class="text" >${text}</p>
            <div class="nameDiv">
                <p class="name">- ${name}</p>
            <div>
        </div>`;
    } else {
        var review = 
        `<div class="reviewDiv">
            <p id="${num}stars"></p>
            <p class="text" >${text}</p>
            <div class="nameDiv">
                <p class="name">- ${name}</p>
            <div>
        </div>`;
    }
   
    document.getElementById("reviewsContainer").innerHTML += review;
    for (s = 0; s < stars; s++ ) {
        const starRow = 
        `<img id="star" src="/images/star.webp">`
        document.getElementById(`${num}stars`).innerHTML += starRow;
    }  
}
