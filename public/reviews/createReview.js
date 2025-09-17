
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

            var p_uploadStatus = document.getElementById("p_uploadStatus")
            p_uploadStatus.innerHTML = "Uploading review...."


            const newReviewRef = firebase.database().ref("reviews").push();
            const reviewID = newReviewRef.key;

            newReviewRef.set({
                textReview,
                stars,
                'user': displayName,
                'uid': user.uid
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
                            console.log('added image to database');
                            return firebase.database().ref("reviews/" + reviewID).update({
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
                orderRef.update({
                    reviewStatus: 'true'
                })
            }).then(() => {
                console.log('uploaded');
                p_uploadStatus.innerHTML = "Your review has been uploaded!";
            }).catch((error) => {
                console.error("Error uploading review:", error);
                p_uploadStatus.innerHTML = "Error uploading your review. Please try again";
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