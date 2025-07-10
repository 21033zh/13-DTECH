function displayProductPage() {
    var productID = sessionStorage.getItem("productID");
    firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
        var productInfo = snapshot.val();
        var price = productInfo.price; 
        var brand = productInfo.brand;
        var mainImageURL = productInfo.mainImage;
        var productName = productInfo.productName;
        var size = productInfo.size;
        
        var mainImage = document.getElementById("mainImage");
        mainImage.src = mainImageURL;

        var nameP = document.getElementById("nameP");
        nameP.innerHTML = productName;

        var priceP = document.getElementById("priceP");
        priceP.innerHTML = price;
        
    });
}