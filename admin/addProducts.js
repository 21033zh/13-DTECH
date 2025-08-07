
function createProduct(event) {
    event.preventDefault();
    console.log('createProduct()')
        productName = document.getElementById("title").value,
        price = document.getElementById("price").value,
        size = document.getElementById("size").value,
        stock = document.getElementById("stock").value,
        brand = document.getElementById("brand").value,
        category = document.getElementById("category").value,
        colour1 = document.getElementById("colour1").value,
        colour2 = document.getElementById("colour2").value

    let newProductRef = firebase.database().ref('products').push();
    newProductRef.set({
        productName, price, size, stock,
        brand, category, colour1, colour2
    });

    var productID = newProductRef.key;
    const file = document.getElementById("main_image").files[0];

    if (file) {
        console.log('file is true')
        console.log(productID);
        statusDiv = document.getElementById("status");
        statusDiv.innerHTML = 'Uploading primary image...';
        const storageRef = firebase.storage().ref("product_images/" + productID + "_" + file.name);
        storageRef.put(file).then(snapshot => {
            console.log('put file then...')
            return snapshot.ref.getDownloadURL(); 
            }).then(downloadURL => {
            console.log('downloadURL', downloadURL)
            return firebase.database().ref("products/" + productID).update({
                mainImage: downloadURL 
            });
            }).then(() => {
            console.log("Product uploaded with image.");
            statusDiv.innerHTML = 'Primary image uploaded successfully'
            }).catch(error => {
            console.error("Upload failed:", error);
            statusDiv.innerHTML = 'Primary image upload failed'
            });
    }

    const imageArray = document.getElementById("images").files;
    if (imageArray) {
        console.log('imageArray is true')
        statusDiv = document.getElementById("status2")
        statusDiv.innerHTML = 'Uploading images...'
        for (i = 0; i < imageArray.length; i++) {
            let imageNum = 'image' + i;
            console.log(imageNum)
            console.log(imageArray[i]);
            const storageRef = firebase.storage().ref("/product_images/" + productID + "_" + imageArray[i].name);
            storageRef.put(imageArray[i]).then(snapshot => {
                return snapshot.ref.getDownloadURL(); // get public image URL
            }).then(downloadURL => {
                return firebase.database().ref("/products/" + productID).update({
                    [imageNum]: downloadURL 
                });
            }).then(() => {
                console.log("Images added.");
                statusDiv.innerHTML = 'Images uploaded successfully...'
            }).catch(error => {
                console.error("Extra images upload failed:", error);
                statusDiv.innerHTML = 'Images upload failed'
            });  
        };
    };
}
//add file type validation

