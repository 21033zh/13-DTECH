function checkAuth() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user logged in')
        } else {
            // User is signed out.
            alert("make an account");
        }
    });
}

function checkReview(event) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user logged in')
            let uid = user.uid;
            let textReview = document.getElementById("textReview").value;
            let stars = document.getElementById("stars").value;
            console.log(user.uid);

            let newProductRef = firebase.database().ref('/reviews/'+ uid);
            newProductRef.update({
                    textReview, stars
            });

            const imageArray = document.getElementById("images").files;
            if (imageArray) {
                for (i = 0; i < imageArray.length; i++) {
                    let imageNum = 'image' + i;
                    console.log(imageNum)
                    console.log(imageArray[i]);
                    const storageRef = firebase.storage().ref("/reviews_images/" + imageArray[i].name);
                    storageRef.put(imageArray[i]).then(snapshot => {
                        return snapshot.ref.getDownloadURL(); // Get public image URL
                    }).then(downloadURL => {
                        return firebase.database().ref("reviews/" + uid).update({
                            [imageNum]: downloadURL 
                        });
                    }).then(() => {
                        console.log("Images added.");
                    }).catch(error => {
                        console.error("Extra images upload failed:", error);
                    });  
                }
            }


        } else {
            // User is signed out.
            alert("make an account");
        }
    });
    
}





function displayReviews() {
    reviewsArray = [];
    firebase.database().ref('/reviews/').once('value', function(snapshot) {
        console.log(reviewsArray);
        snapshot.forEach(function(childSnapshot) {
            reviewsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        allReviewsArray = [].concat(reviewsArray);
        createGrid(reviewsArray);
});
}

function createGrid(reviewsArray) {
    console.log(reviewsArray)
    document.getElementById("reviewsContainer").innerHTML = '';
    for (i = 0; i < reviewsArray.length; i++) {
        appendProduct(
            reviewsArray[i].value.image0,
            reviewsArray[i].value.textReview,
            reviewsArray[i].value.stars,
            reviewsArray[i].key,
        );
    };
}

function appendProduct(image, text, stars, uid) {
    let allInfo = [
        image,
        text,
        stars,
        uid
    ]
    const review = 
            `<div class="reviewDiv">
                <img class="productImage" src="${image}")">
            <p class="stars">${stars}</p>
            <p class="text" >size ${text}</p>
            <p class="uid">$${uid}</p>
            </div>`;
    document.getElementById("reviewsContainer").innerHTML += review;
}