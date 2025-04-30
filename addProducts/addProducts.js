function createProduct(event) {
    event.preventDefault();
    var productName = document.getElementById("title").value;
    var productPrice = document.getElementById("price").value;
    var productSize = document.getElementById("size").value;
    var productCategory = document.getElementById("category").value;
    var productColour1 = document.getElementById("colour1").value;
    var productColour2 = document.getElementById("colour2").value;

    console.log('title: ' + productName + ', price: ' + productPrice);

    let newProductRef = firebase.database().ref('products').push();
        newProductRef.set({
        name: productName,
        price: productPrice,
        size: productSize,
        category: productCategory,
        colour1: productColour1,
        colour2: productColour2
    });

    var productID = newProductRef.key;
    const file = document.getElementById("main_image").files[0];

    if (file) {
        const storageRef = firebase.storage().ref("product_images/" + productID + "_" + file.name);
        storageRef.put(file).then(snapshot => {
            return snapshot.ref.getDownloadURL(); 
            }).then(downloadURL => {
            console.log(downloadURL)
            return firebase.database().ref("products/" + productID).set({
                mainImage: downloadURL 
            });
            }).then(() => {
            console.log("Product uploaded with image.");
            }).catch(error => {
            console.error("Upload failed:", error);
            });
    }

    const imageArray = document.getElementById("images").files;
    if (imageArray) {
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
            }).catch(error => {
                console.error("Extra images upload failed:", error);
            });  
        }
    }
}
//add file type validation