
const urlParams = new URLSearchParams(window.location.search);
const orderKey = urlParams.get('orderKey');
const itemNum = urlParams.get('itemNum');

function checkReview(event) {
    event.preventDefault();
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const orderRef = firebase.database().ref(`/accounts/${user.uid}/orders/${orderKey}/line_items/${itemNum}/`);
            var orderInfo;
            orderRef.once('value', function(snapshot) {
                orderInfo = snapshot.val();
                console.log('orderInfo: ', orderInfo)

            let textReview = document.getElementById("textReview").value;
            let stars = document.getElementById("stars").value;
            let displayName = document.getElementById("displayName").value;

            var reviewAlert = document.getElementById("reviewAlert");
            reviewAlert.classList.remove("hidden");
            reviewAlert.style.display = 'flex';


            const newReviewRef = firebase.database().ref("reviews").push();
            const reviewID = newReviewRef.key;

            newReviewRef.set({
                textReview,
                stars,
                'user': displayName,
                'uid': user.uid
            }).then(() => {
                const imageArray = document.getElementById("images").files[0]
                let uploadPromises = [];
            
                if (imageArray && imageArray.length > 0) {
                    let imageNum = 'image' + i;
                        const storageRef = firebase.storage().ref("/reviews_images/" + imageArray[i].name);
            
                        let uploadTask = storageRef.put(imageArray[i])
                            .then(snapshot => snapshot.ref.getDownloadURL())
                            .then(downloadURL => {
                                return firebase.database().ref("reviews/" + reviewID).update({
                                    [imageNum]: downloadURL
                                });
                            });
            
                        uploadPromises.push(uploadTask);
                }
            
                // Wait for all uploads to finish
                return Promise.all(uploadPromises);
            }).then(() => {
                orderRef.update({
                    reviewStatus: 'true'
                })
            }).then(() => {
                console.log('uploaded');
                document.getElementById("alert_message").innerHTML = `<p>Your review has been uploaded</br>Thankyou
                for your review!</p>`
                document.getElementById("alert_button").innerHTML = `<a href="/account/account_reviews.html">
                CLOSE</a>`
            }).catch((error) => {
                console.error("Error uploading review:", error);
                document.getElementById("alert_message").innerHTML = `<p>There was an error uploading your review. Please try again</p>`
                document.getElementById("alert_button").innerHTML = `<a href="/account/account_reviews.html">
                CLOSE</a>`
            });
            });

        } else {
            // User is signed out.
            alert("make an account");
        }
    });
    
}

function createReview_load() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            window.location="makeAccount.html";
        }
    })

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