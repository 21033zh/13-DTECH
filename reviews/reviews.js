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
            reviewsArray[i].value.image0,
            reviewsArray[i].value.textReview,
            reviewsArray[i].value.name,
            stars,
            i,
        );
    };
}

function appendReview(image, text, name, stars, num) {
    console.log('append review')
    const review = 
            `<div class="reviewDiv">
                <img class="productImage reviewImage" src="${image}")">
                <p id="${num}stars"></p>
                <p class="text" >${text}</p>
                <div class="nameDiv">
                    <p class="name">- ${name}</p>
                <div>
            </div>`;
    document.getElementById("reviewsContainer").innerHTML += review;
    for (s = 0; s < stars; s++ ) {
        const starRow = 
        `<img id="star" src="/images/star.webp">`
        document.getElementById(`${num}stars`).innerHTML += starRow;
    }  
}

function sortSettings(event) {
    event.preventDefault();
    document.getElementById("reviewsContainer").innerHTML = '';
    var sortSettings = document.getElementById("sortDropdown").value;

    if (sortSettings === 'newest') {
        displayReviews();
    } else if (sortSettings === 'oldest') {
        sortByDate();
    } else if (sortSettings === 'highest' || sortSettings === 'lowest') {
        sortByRating(sortSettings);
    }
}

function sortByDate() {
    firebase.database().ref('/reviews/').once('value', function(snapshot) {
        var reviewsArray = [];
        snapshot.forEach(function(childSnapshot) {
            reviewsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        reviewsArray.reverse();
        createGrid(reviewsArray);
    });
}

function sortByRating(sortSettings) {
    firebase.database().ref('/reviews/').once('value', function(snapshot) {
        var reviewsArray = [];
        snapshot.forEach(function(childSnapshot) {
            reviewsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        reviewsArray.sort(function(a, b) {
            return b.value.price - a.value.price;
        });
        if (sortSettings === 'lowest') {
            reviewsArray.reverse();
        }
        createGrid(reviewsArray);
    });
}