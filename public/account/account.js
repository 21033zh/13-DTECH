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
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location="makeAccount.html";
        }
    });
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

        if (reviewsArray[i].value.uid === uid) {
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
    if (image) {
        var review = 
        `<div class="acc_reviewDiv">
            <img class="acc_productImage acc_reviewImage" src="${image}")">
            <p id="acc_${num}stars"></p>
            <p class="acc_text" >${text}</p>
            <button class="acc_button" onclick="deleteReview('${productID}')">DELETE</button>
        </div>`;
    } else {
        var review = 
        `<div class="acc_reviewDiv">
            <p id="acc_${num}stars"></p>
            <p class="acc_text" >${text}</p>
            <button class="acc_button" onclick="deleteReview('${productID}')">DELETE</button>
        </div>`;
    }
   
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
 * account_wishlist.html
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
 function displayOrders() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('displayProducts')
            var ordersArray = [];
            const ordersRef = firebase.database().ref(`accounts/${user.uid}/orders/`)
            ordersRef.once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    ordersArray.push({
                        key: childSnapshot.key,
                        value: childSnapshot.val()
                    });
                });
                createOrdersGrid(ordersArray);
            });
        } else {
            window.location="makeAccount.html"
        }
    });
}


function createOrdersGrid(ordersArray) {
    for (i = 0; i < ordersArray.length; i++) {
        var orderNum = ordersArray[i].value.orderNumber;
        var orderKey = ordersArray[i].key;

        console.log(orderKey)

        var line_items = ordersArray[i].value.line_items;

        console.log(line_items);

        let div = document.getElementById("div_info");
        div.innerHTML += `
        <div class="container_order" id="order${i}">
            <div class="heading" id="${i}_heading">
                <p>ORDER NUMBER: ${orderNum}</p>
                <button onclick="redirect('details', '${orderKey}')">SEE MORE</button>
            </div>
            <div class="body" id="${i}_body"></div>
        </div>`

        for (o = 0; o < line_items.length; o++) {
            var item = line_items[o];

            var orderObject = {
                orderNum,
                productName: item.description,
                productID: item.productID,
                price: item.price,
                date: item.createdAt,
                size: item.size,
                quantity: item.quantity,
                mainImage: item.mainImage,
                reviewStatus: item.reviewStatus
              };

            let body = document.getElementById(`${i}_body`);
            body.innerHTML += `
            <img src="${orderObject.mainImage}">
            <div class="info">
                <p>${orderObject.productName}</p>
                <p>QUANTITY: ${orderObject.quantity}</p>
                <p>SIZE: ${orderObject.size}</p>
            </div>
            <div class="ordersReviewButton" id="${i}_${o}_reviewButton">
            <button onclick="redirect('review', '${orderKey}', '${o}')">REVIEW</button>
            </div>`

            if (orderObject.reviewStatus == 'true') {
                document.getElementById(`${i}_${o}_reviewButton`).innerHTML = `<div><p>REVIEWED</p></div>`
            }
        };
    };
}


 function redirect(page, orderKey, itemNum) {
    if (page === 'details') {
        window.location.href = `orderDetails.html?orderKey=${orderKey}`;
    } else if (page === 'review') {
        window.location.href = `/reviews/createReview.html?orderKey=${orderKey}&itemNum=${itemNum}`;
    } else {
        console.log('Error');
    }
 }

function fillOrderDetails() {
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const orderKey = urlParams.get('orderKey');

        const accountRef = firebase.database().ref(`/accounts/${user.uid}/`);

        accountRef.once('value', function(snapshot){
            var accountInfo = snapshot.val();
            var order = accountInfo.orders[orderKey]
            console.log(order)

/*               const productName = order.productName;
            const price = order.price;
            const date = order.date;
            const quantity = order.quantity;
            const description = order.description;
            const flaws = order.flaws;
            const size = order.size;
            const brand = order.brand;
            const mainImage = order.mainImage; */

            const orderNum = order.orderNumber;
            var dateTimestamp = order.createdAt;
            var dateArray = dateTimestamp.split('T');
            date = dateArray[0]

            const firstName = accountInfo.firstName;
            const lastName = accountInfo.lastName;
            const email = accountInfo.email;

            const line1 = order.shipping.line1;
            const line2 = order.shipping.line2;
            const city = order.shipping.city;
            const country = order.shipping.country;
            const postcode = order.shipping.postal_code;

            document.getElementById("p_orderNum").innerHTML = orderNum;

            document.getElementById("p_userName").innerHTML = firstName + ' ' + lastName;
            document.getElementById("p_userEmail").innerHTML = email;

            document.getElementById("p_orderDate").innerHTML = date;

            document.getElementById("p_userStreet").innerHTML = line1;
            document.getElementById("p_userSuburb").innerHTML = line2;
            document.getElementById("p_userCity").innerHTML = city;
            document.getElementById("p_userCountry").innerHTML = country;
            document.getElementById("p_userPostcode").innerHTML = postcode;

            var line_items = order.line_items;
            console.log(line_items)

            for (o = 0; o < line_items.length; o++) {
                var item = line_items[o];
                console.log(item);
    
                var orderObject = {
                    productName: item.description,
                    productID: item.productID,
                    price: item.price,
                    date: item.createdAt,
                    size: item.size,
                    quantity: item.quantity,
                    mainImage: item.mainImage
                    };
    
                let body = document.getElementById(`grid_productDetails`);

                if (item.reviewStatus === 'true') {
                    body.innerHTML += `
                    <div class="productDetails">
                    <h4>PRODUCT DETAILS</h4>
                    <div class="container_productDetails">
                        <div class="div_mainImage">
                        <img src="${orderObject.mainImage}"></div>
                        <div>
                            <p class="p_productName">${orderObject.productName}</p>
                            <p>QUANTITY: ${orderObject.quantity}</p>
                            <p>SIZE: ${orderObject.size}</p>
                        </div>
                        <a>REVIEWED</a>
                    </div>
                </div>`
                } else {
                    body.innerHTML += `
                    <div class="productDetails">
                    <h4>PRODUCT DETAILS</h4>
                    <div class="container_productDetails">
                        <div class="div_mainImage">
                        <img src="${orderObject.mainImage}"></div>
                        <div>
                            <p class="p_productName">${orderObject.productName}</p>
                            <p>QUANTITY: ${orderObject.quantity}</p>
                            <p>SIZE: ${orderObject.size}</p>
                        </div>
                        <button onclick="redirect('review','${orderKey}', '${o}')">REVIEW</button>
                    </div>
                    </div>`
                }
                
            };
        });

    } else {
        window.location="makeAccount.html"
    }
})
}