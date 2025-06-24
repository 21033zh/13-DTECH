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
                statusDiv = document.getElementById("status2")
                statusDiv.innerHTML = 'Uploading images...'
                for (i = 0; i < imageArray.length; i++) {
                    let imageNum = 'image' + i;
                    console.log(imageNum)
                    console.log(imageArray[i]);
                    const storageRef = firebase.storage().ref("product_images/" + productID + "_" + imageArray[i].name);
                    storageRef.put(imageArray[i]).then(snapshot => {
                        return snapshot.ref.getDownloadURL(); // Get public image URL
                    }).then(downloadURL => {
                        return firebase.database().ref("products/" + productID).update({
                            [imageNum]: downloadURL 
                        });
                    }).then(() => {
                        console.log("Images added.");
                        statusDiv.innerHTML = 'Images uploaded successfully...'
                    }).catch(error => {
                        console.error("Extra images upload failed:", error);
                        statusDiv.innerHTML = 'Images upload failed'
                    });  
                }
            }


        } else {
            // User is signed out.
            alert("make an account");
        }
    });
    
}