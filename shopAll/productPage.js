const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get('productID');
var imagesArray = [];
var slidePlace = 0;


if (productID) {
    // Fetch and display the product from database using productID
    console.log(productID)
    
    firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
        var productInfo = snapshot.val();
        var price = productInfo.price; 
        var brand = productInfo.brand;
        imagesArray = productInfo.images;
        var productName = productInfo.productName;
        var size = productInfo.size;
        var description = 'hello';
        var flaws = 'none';

        var ul_photos = document.getElementById("ul_photos");
        console.log(imagesArray.length);
  
        for (i = 0; i < imagesArray.length; i++) {
          console.log(imagesArray[i])
          photo = `<li><img id="slide${i}" src="${imagesArray[i]}"></li>`;
          ul_photos.innerHTML += photo;
        }

        var div = document.getElementById("div_selectedImage");

        var image = `<img class="img_selected" src=${imagesArray[slidePlace]}>`;
        div.innerHTML = image;
        
        var title = document.getElementById("title");
        title.innerHTML = productName;

        var nameP = document.getElementById("h1_name");
        nameP.innerHTML = productName;

        var priceP = document.getElementById("p_price");
        priceP.innerHTML += price;

        var p_brand = document.getElementById("p_brand");
        p_brand.innerHTML += brand;

        var p_size= document.getElementById("p_size");
        p_size.innerHTML += size;

        var p_description= document.getElementById("p_description");
        p_description.innerHTML = description;

        var p_flaws= document.getElementById("p_flaws");
        p_flaws.innerHTML += flaws;

    });
  } else {
    // Show error message or redirect
    console.log('product not found')
  }

function nextSlide() {
    console.log('next');
    var div = document.getElementById("div_selectedImage");
    
    var slideNum = 'slide' + slidePlace;
    var img_selectedSlide = document.getElementById(slideNum);
    img_selectedSlide.style.opacity = 1;

    if (slidePlace === imagesArray.length-1) {
      slidePlace = 0;
      console.log('resetting sldies')
    } else {
      slidePlace += 1;
    }

    var slideNum = 'slide' + slidePlace;
    var img_selectedSlide = document.getElementById(slideNum);
    img_selectedSlide.style.opacity = 0.5;


    var image = `<img class="img_selected" src=${imagesArray[slidePlace]}>`;
    div.innerHTML = image;
}

function prevSlide() {
  console.log('back');
  var div = document.getElementById("div_selectedImage");

  if (slidePlace === 0) {
    slidePlace = imagesArray.length-1;
    console.log('resetting sldies')
  } else {
    slidePlace -= 1;
  }

  var image = `<img class="img_selected" src=${imagesArray[slidePlace]}>`;
  div.innerHTML = image;
}