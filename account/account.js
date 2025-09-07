function signOut() {
    firebase.auth().signOut()
    console.log('signed out')
}

console.log('account pageeee')

function account_redirect() {
    console.log('populate')
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location="account.html";
        } else {
            window.location="makeAccount.html"
        }
    });
}

function welcomeName() {
    var name = sessionStorage.getItem("firstName");
    document.getElementById("p_welcomeName").innerHTML = name;
}
/**-------------------------------------------------------------------
 * 
 * account.html
 * 
 --------------------------------------------------------------------*/

function populateAccountInfo() {
    console.log('populate')
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
                reviewsArray[i].key,
                reviewsArray[i].value.image0,
                reviewsArray[i].value.textReview,
                stars,
                i,
                uid);
        }
    };
}

function appendReview(productID, image, text, stars, num, uid) {
    console.log('append review')
    const review = 
            `<div class="acc_reviewDiv">
                <img class="acc_productImage acc_reviewImage" src="${image}")">
                <p id="acc_${num}stars"></p>
                <p class="acc_text" >${text}</p>
                <button class="acc_button" onclick="deleteReview('${productID}')">DELETE</button>
            </div>`;
    document.getElementById("acc_reviewsContainer").innerHTML += review;
    for (s = 0; s < stars; s++ ) {
        const starRow = 
        `<img id="star" src="/images/star.webp">`
        document.getElementById(`acc_${num}stars`).innerHTML += starRow;
    }  
}

function deleteReview(productID) {
    var reviewRef = firebase.database().ref(`/reviews/${productID}`);
    // remove productID from wishlist
    reviewRef.remove()
// update wishlist button
        .then(function() {
        location.reload();
        })
        .catch(function(error) {
            console.log('failure', error);
            alert(`There was an error deleting your review. Please try again.`);
        });
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
                productID,
                mainImage,
                productName,
                price,
                size
            );
        };
    });
    document.getElementById("div_accWishlist").innerHTML = '';
    
}

function appendProduct(productID, mainImage, productName, productPrice, productSize) {
    const product = 
           `<div class="productContainer">
            <div class="productImageContainer">
                <img class="productImage" src="${mainImage}"
                 onclick="goToPage()">
            </div>
            <button onclick="account_removeFromWishlist('${productID}')">Remove</button>
            <p class="productName"  onclick="goToPage()">${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">$${productPrice}</p>
            </div>`;
    document.getElementById("div_accWishlist").innerHTML += product;
}

/**-----------------------------------------------------------------
 * productPage_removeFromWishlist
 * removes product from the wishlist
 ------------------------------------------------------------------*/
 function account_removeFromWishlist(productID) {
    console.log('productPage_removeFromWishlist')
        const user = firebase.auth().currentUser
        var productRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${productID}`);
    // remove productID from wishlist
        productRef.remove()
    // update wishlist button
            .then(function() {
            location.reload();
            })
            .catch(function(error) {
                console.log('failure', error);
                alert(`There was an error removing from the wishlist. Please try again.`);
            });
    }

/**-------------------------------------------------------------------
 * 
 * account_orders.html
 * 
 --------------------------------------------------------------------*/
 function fillOrdersTable() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const body_ordersTable = document.getElementById("body_ordersTable");
            body_ordersTable.innerHTML = '';

            const ordersArray = [];
            const ordersRef = firebase.database().ref(`/accounts/${user.uid}/orders`);
            ordersRef.once('value', function(snapshot){
                snapshot.forEach(childSnapshot => {
                    ordersArray.push({
                        key: childSnapshot.key,
                        value: childSnapshot.val()
                    });
                });
        
             for (let i = 0; i < ordersArray.length; i++) {
                    const order = ordersArray[i];

                    var orderObject = {
                        orderNum: order.key,
                        productName: order.value.productName,
                        price: order.value.price,
                        date: order.value.date,
                        quantity: order.value.quantity,
                        street: order.value.address.street,
                        suburb: order.value.address.suburb,
                        city: order.value.address.city,
                        postcode: order.value.address.postcode,
                        mainImage: order.value.mainImage
                      };

                    console.log(orderObject)

        
                    const row = `
                        <tr> 
                            <td><img src="${orderObject.mainImage}"></td> 
                            <td>ORDER NUMBER: ${orderObject.orderNum}</br>${orderObject.productName}</td> 
                            <td>QUANTITY: ${orderObject.quantity}</td> 
                            <td>PRICE: $${orderObject.price}</td> 
                            <td><button class="button_orderInfo" onclick="redirect('details', '${orderObject.orderNum}')">SEE MORE</button>
                            <button class="button_orderInfo" onclick="redirect('review')">REVIEW</button></td>
                        </tr>
                    `;
        
                    body_ordersTable.innerHTML += row;
                }
            }).catch(fb_error);
            
        } else {
            // User is signed out.
            console.log("user signed out")
            window.location="makeAccount.html"
        }
    });
 }

 function redirect(page, orderNum) {
    if (page === 'details') {
        window.location.href = `orderDetails.html?orderNum=${orderNum}`;
    } else {
        window.location.href = "/reviews/createReview.html";
    }
 }

  function fillOrderDetails() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const orderNum = urlParams.get('orderNum');
            console.log()

            const accountRef = firebase.database().ref(`/accounts/${user.uid}/`);

            accountRef.once('value', function(snapshot){
                var accountInfo = snapshot.val();
                var order = accountInfo.orders[orderNum];

                const productName = order.productName;
                const price = order.price;
                const date = order.date;
                const quantity = order.quantity;
                const description = order.description;
                const flaws = order.flaws;
                const size = order.size;
                const brand = order.brand;
                const mainImage = order.mainImage;

                const firstName = accountInfo.firstName;
                const lastName = accountInfo.lastName;
                const email = accountInfo.email;

                const street = order.address.street;
                const suburb = order.address.suburb;
                const city = order.address.city;
                const country = order.address.country;
                const postcode = order.address.postcode;

                document.getElementById("p_orderNum").innerHTML = orderNum;

                document.getElementById("p_userName").innerHTML = firstName + ' ' + lastName;
                document.getElementById("p_userEmail").innerHTML = email;

                document.getElementById("p_orderDate").innerHTML = date;

                document.getElementById("p_userStreet").innerHTML = street;
                document.getElementById("p_userSuburb").innerHTML = suburb;
                document.getElementById("p_userCity").innerHTML = city;
                document.getElementById("p_userCountry").innerHTML = country;
                document.getElementById("p_userPostcode").innerHTML = postcode;
                document.getElementById("p_userSuburb").innerHTML = suburb;

                document.getElementById("div_mainImage").innerHTML = 
                `<img src=${mainImage} alt="photo of product">`;

            });

        } else {
            window.location="makeAccount.html"
        }
    })
  }