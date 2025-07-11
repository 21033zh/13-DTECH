function checkReview(event) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user logged in')
            let name = user.displayName;
            let textReview = document.getElementById("textReview").value;
            let stars = document.getElementById("stars").value;

            var p_uploadStatus = document.getElementById("p_uploadStatus")
            p_uploadStatus.innerHTML = "Uploading review...."

            let newProductRef = firebase.database().ref("/reviews/pgppgpg");
            newProductRef.update({
                textReview,
                stars,
                name
            }).then(() => {
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
            }).then(() => {
                console.log('uploaded');
                p_uploadStatus.innerHTML = "Your review has been uploaded!";
            }).catch((error) => {
                console.error("Error uploading review:", error);
                p_uploadStatus.innerHTML = "Error uploading your review. Please try again";
            });

            


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

            var productsReviewContainer = document.getElementById("div_purchases");
            productsReviewContainer.style.display = "block";
            var createReviewForm = document.getElementById("createReviewForm")
            createReviewForm.style.display = "none"

            firebase.database().ref('/accounts/' + uid + '/wishlist/').once('value', function(snapshot) {
                console.log(productsArray);
                snapshot.forEach(function(childSnapshot) {
                    console.log('key: ', childSnapshot.key)
                productsArray.push({
                    key: childSnapshot.key,
                    value: childSnapshot.val()
                });
                });
                if (productsArray.length === 0) {
                    document.getElementById("div_purchasesList").innerHTML = 
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
    document.getElementById("div_purchasesList").innerHTML = '';
    for (i = 0; i < productsArray.length; i++) {
        appendProduct(
            productsArray[i].value.mainImage,
            productsArray[i].key,
            productsArray[i].value.productName,
        );
    };
}

function appendProduct(mainImage, key, productName) {
    const product = 
            `<div class="productContainer">
            <div class="productImageContainer">
                <img class="productImage" src="${mainImage}"
                 onclick="chooseProduct(
                '${key}', 
                )">
            </div>
            <p class="productName"  onclick="chooseProduct(
                '${key}')">${productName}</p>
            </div>`;
    document.getElementById("div_purchasesList").innerHTML += product;
}

function chooseProduct(key) {
    firebase.database().ref('/products/' + key).once('value', function(snapshot) {
    var productsReviewContainer = document.getElementById("div_purchases");
    productsReviewContainer.style.display = "none";
    var createReviewForm = document.getElementById("createReviewForm")
    createReviewForm.style.display = "block"
    createReviewForm.innerHTML = 
        `<form id="form_createReview" onsubmit="checkReview(event); return false">
        <button onclick="displayProducts()">Back</button>
            <label for="textReview">Your review:</label><br>
            <textarea id="textReview" name="textReview" 
            rows="3" maxlength="150"></textarea><br>

            <label for="stars">Stars:</label>
            <select id="stars" name="stars">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            </select><br>

            <div id="div_image">
            <label for="image">Images:</label><br>
            <input type="file" id="images" name="main_image" accept="image/png, image/jpeg" 
            onchange="displaySelectedImages()" multiple />
            <div id="div_previewImages"></div>
            </div>

            <input type="submit" value="Submit">
            <p id="status"></p>
        </form>`;
    });
}

function displaySelectedImages() {
    const input = document.getElementById("images");
    const previewDiv = document.getElementById("div_previewImages");

    // Remove old previews if any
    const oldImages = document.querySelectorAll(".selected-image-preview");
    oldImages.forEach(img => img.remove());

    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function(e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "selected-image-preview";
                img.style.maxWidth = "100px";
                img.style.margin = "5px";
                previewDiv.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
    }
}