function checkReview(event) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user logged in')
            let name = user.displayName;
            let textReview = document.getElementById("textReview").value;
            let stars = document.getElementById("stars").value;

            let newProductRef = firebase.database().ref("/reviews/pgppgpg");
            newProductRef.update({
                    textReview, stars, name
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
                        return firebase.database().ref("reviews/pgppgpg").update({
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

function displayProducts() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let uid = user.uid;
            console.log('user logged in')
            productsArray = [];
            firebase.database().ref(uid + '/wishlist/').once('value', function(snapshot) {
                console.log(productsArray);
                snapshot.forEach(function(childSnapshot) {
                productsArray.push({
                    key: childSnapshot.key,
                    value: childSnapshot.val()
                });
                });
                if (productsArray.length === 0) {
                    document.getElementById("products_review_container").innerHTML = 
                    'No products to review';
                } else {
                    createProductsGrid(productsArray);
                }
            });
            } else {
                // User is signed out.
                alert("make an account");
            }
    });
}

function createProductsGrid(productsArray) {
    console.log(productsArray)
    document.getElementById("products_review_container").innerHTML = '';
    for (i = 0; i < productsArray.length; i++) {
        appendProduct(
            productsArray[i].value.mainImage,
            productsArray[i].key,
            productsArray[i].value.productName,
            productsArray[i].value.price,
            productsArray[i].value.size
        );
    };
}

function appendProduct(mainImage, key, productName, productPrice, productSize) {
    let allInfo = [
        mainImage,
        key,
        productName,
        productPrice,
        productSize
    ]
    const product = 
            `<div class="productContainer">
            <div class="productImageContainer">
                <img class="productImage" src="${mainImage}"
                 onclick="goToPage(
                '${allInfo}', 
                )">
            </div>
            <p class="productName"  onclick="chooseProduct(
                '${allInfo}')">${productName}</p>
            </div>`;
    document.getElementById("products_review_container").innerHTML += product;
}
