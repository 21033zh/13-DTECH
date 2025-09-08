function checkReview(event, productID) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('user logged in')
            let name = user.displayName;
            let textReview = document.getElementById("textReview").value;
            let stars = document.getElementById("stars").value;

            var p_uploadStatus = document.getElementById("p_uploadStatus")
            p_uploadStatus.innerHTML = "Uploading review...."

            let newProductRef = firebase.database().ref("/reviews/" + productID);
            newProductRef.update({
                textReview,
                stars,
                name,
                'user': user.uid
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
                            return firebase.database().ref("reviews/" + productID).update({
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
                        <button onclick="redirect('review', ${orderObject.productID})">REVIEW</button>
                    </div>
                </div>`
                };
            });

        } else {
            window.location="makeAccount.html"
        }
    })
  }

function createReview_load() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const orderKey = urlParams.get('orderKey');
        } else {
            console.log('nono');
        }
    })

}

function chooseProduct(productID) {
    firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
    var productsReviewContainer = document.getElementById("div_purchases");
    productsReviewContainer.style.display = "none";
    var createReviewForm = document.getElementById("createReviewForm")
    createReviewForm.style.display = "block"
    createReviewForm.innerHTML = 
        ``;
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