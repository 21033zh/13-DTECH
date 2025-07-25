function signOut() {
    firebase.auth().signOut()
    console.log('signed out')
}

/**-------------------------------------------------------------------
 * 
 * account.html
 * 
 --------------------------------------------------------------------*/
function account_redirect() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location="account.html";
        } else {
            window.location="makeAccount.html"
        }
    });
}

function populateAccountInfo() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var uid = user.uid;
            firebase.database().ref('/accounts/' + uid).once('value', function(snapshot) {
                var accountInfo = snapshot.val();
                sessionStorage.setItem("firstName", accountInfo.firstName);
                document.getElementById("p_welcomeName").innerHTML = accountInfo.firstName;
                document.getElementById("p_firstName").innerHTML = accountInfo.firstName;
                document.getElementById("p_lastName").innerHTML = accountInfo.lastName;
                document.getElementById("p_email").innerHTML = accountInfo.email;
            });
        } else {
            window.location="makeAccount.html"
        }
    });
}

function editFirstName() {
    var name = 'first'
    editName(name)
}

function editLastName() {
    var name = 'last'
    editName(name)
}

function editName(name) {
    var oldValue;
    var p_name;
    if (name === 'first') {
        oldValue = document.getElementById("p_firstName").innerText;
        p_name = document.getElementById("p_firstName");
    } else {
        oldValue = document.getElementById("p_lastName").innerText;
        p_name = document.getElementById("p_lastName");
    }
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldValue;
    input.style.width = "100%";

    p_name.innerHTML = '';
    p_name.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => saveEdit(input.value));
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            saveEdit(input.value);
        }
    });

    function saveEdit(newValue) {
        if (newValue === oldValue) {
            p_name.innerText = oldValue; // No change
            return;
        }
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                var uid = user.uid
                firebase.database().ref(`/accounts/`+uid+'/' + name +'Name/').set(newValue)
                .then(() => {
                    p_name.innerText = newValue;
                })
                .catch((error) => {
                    console.error("Failed to update field:", error);
                    p_name.innerText = oldValue;
                });
            } else {
                // User is signed out.
                console.log("user signed out")
                window.location="makeAccount.html"
            }
        });
        
    }
}

/**-------------------------------------------------------------------
 * 
 * account_reviews.html
 * 
 --------------------------------------------------------------------*/

function acc_reviews_checkSignIn() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log('user logged in');
            var name = sessionStorage.getItem("firstName");
            document.getElementById("p_welcomeName").innerHTML = name;
            displayUserReviews(user.uid)
        } else {
            // User is signed out.
            console.log("user signed out")
            window.location="makeAccount.html"
        }
    });
}

function displayUserReviews(uid) {
    var reviewsArray = [];
    firebase.database().ref('/reviews/').once('value', function(snapshot) {
        console.log(reviewsArray);
        snapshot.forEach(function(childSnapshot) {
            reviewsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        createGrid(reviewsArray, uid);
    });
}

function createGrid(reviewsArray, uid) {
    console.log(reviewsArray.length)
    document.getElementById("acc_reviewsContainer").innerHTML = '';
    for (i = 0; i < reviewsArray.length; i++) {
        console.log('key: ' + reviewsArray[i].key)
        console.log('uid: ' + uid)

        if (reviewsArray[i].value.user === uid) {
            console.log('review');
            var stars = reviewsArray[i].value.stars;
            appendReview(
                reviewsArray[i].value.image0,
                reviewsArray[i].value.textReview,
                stars,
                i,
                uid);
        }
    };
}

function appendReview(image, text, stars, num, uid) {
    console.log('append review')
    const review = 
            `<div class="acc_reviewDiv">
                <img class="acc_productImage acc_reviewImage" src="${image}")">
                <p id="acc_${num}stars"></p>
                <p class="acc_text" >${text}</p>
                <button class="acc_button" onclick="deleteReview('${uid}')">DELETE</button>
            </div>`;
    document.getElementById("acc_reviewsContainer").innerHTML += review;
    for (s = 0; s < stars; s++ ) {
        const starRow = 
        `<img id="star" src="/images/star.webp">`
        document.getElementById(`acc_${num}stars`).innerHTML += starRow;
    }  
}

function deleteReview(uid) {
    console.log('uid: ', uid)
}

/**-------------------------------------------------------------------
 * 
 * account_reviews.html
 * 
 --------------------------------------------------------------------*/

 function acc_wl_checkSignIn() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log('user logged in');
            displayWishlist(user.uid)
            var name = sessionStorage.getItem("firstName");
            document.getElementById("p_welcomeName").innerHTML = name;
        } else {
            // User is signed out.
            console.log("user signed out")
            window.location="makeAccount.html"
        }
    });
}

function displayWishlist(uid) {
    var wishlistArray = [];
    firebase.database().ref('/accounts/'+ uid + '/wishlist/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            wishlistArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        createWishlistGrid(wishlistArray, uid);
    });
}

function createWishlistGrid(wishlistArray) {
    console.log(wishlistArray.length)
    firebase.database().ref('/products/').once('value', function(snapshot) {
        var productsArray = snapshot.val();
        console.log(productsArray);

        for (i = 0; i < wishlistArray.length; i++) {      
            var productID = wishlistArray[i].key;
            var mainImage = productsArray[productID].mainImage;
            var productName = productsArray[productID].productName;
            var price = productsArray[productID].price;
            var size = productsArray[productID].size;
            appendProduct(
                mainImage,
                productName,
                price,
                size
            );
        };
    });
    document.getElementById("div_accWishlist").innerHTML = '';
    
}

function appendProduct(mainImage, productName, productPrice, productSize) {
    const product = 
           `<div class="productContainer">
            <div class="productImageContainer">
                <img class="productImage" src="${mainImage}"
                 onclick="goToPage()">
            </div>
            <button class="addToCartButton">Add to cart</button>
            <p class="productName"  onclick="goToPage()">${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">$${productPrice}</p>
            </div>`;
    document.getElementById("div_accWishlist").innerHTML += product;
}