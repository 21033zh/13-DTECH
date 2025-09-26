function createProduct(event) {
    event.preventDefault();
    console.log("createProduct()");

    // Grab product fields
    const productName = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const size = document.getElementById("size").value;
    const description = document.getElementById("description").value;
    const stock = document.getElementById("stock").value;
    const brand = document.getElementById("brand").value;
    const category = document.getElementById("category").value;
    const colour1 = document.getElementById("colour1").value;
    const colour2 = document.getElementById("colour2").value;

    // Push product info to Realtime Database
    const newProductRef = firebase.database().ref("products").push();
    const productID = newProductRef.key;

    newProductRef.set({
        productName, price, size, stock,
        brand, category, colour1, colour2, description,
        date: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log("Product info saved, ID:", productID);
    }).catch(error => {
        console.error("Failed to save product info:", error);
    });

    // -------- Main Image --------
    const mainFile = document.getElementById("main_image").files[0];
    if (mainFile) {
        const statusDiv = document.getElementById("status");
        statusDiv.innerHTML = "Uploading primary image...";

        const mainRef = firebase.storage().ref("product_images/" + productID + "_" + mainFile.name);

        mainRef.put(mainFile)
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then(downloadURL => {
                console.log("Primary image download URL:", downloadURL);
                return firebase.database().ref("products/" + productID).update({
                    mainImage: downloadURL
                });
            })
            .then(() => {
                console.log("Primary image uploaded successfully");
                statusDiv.innerHTML = "Primary image uploaded successfully";
            })
            .catch(error => {
                console.error("Primary image upload failed:", error);
                statusDiv.innerHTML = "Primary image upload failed";
            });
    }

    // -------- Extra Images --------
    const imageFiles = document.getElementById("images").files;
    if (imageFiles && imageFiles.length > 0) {
        const statusDiv2 = document.getElementById("status2");
        statusDiv2.innerHTML = "Uploading extra images...";
        

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const imageNum = "image" + i;

            console.log("Uploading extra image:", file.name);

            const extraRef = firebase.storage().ref("product_images/" + productID + "_" + file.name);

            extraRef.put(file)
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(downloadURL => {
                    console.log(imageNum, "download URL:", downloadURL);
                    return firebase.database().ref("products/" + productID + '/images/').update({
                        [imageNum]: downloadURL
                    });
                })
                .then(() => {
                    console.log(imageNum, "uploaded successfully");
                    statusDiv2.innerHTML = "Images uploaded successfully...";
                })
                .catch(error => {
                    console.error(imageNum, "upload failed:", error);
                    statusDiv2.innerHTML = "Images upload failed";
                });
        }
    }
}
