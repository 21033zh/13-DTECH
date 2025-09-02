const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get('productID');

const colourMap = {
  red : "#cf4432",
  orange : "#cf6e32",
  yellow : "#ffdf52",
  green : "#92b05b",
  blue : "#5796ad",
  purple : "#ab87ed",
  pink : "#f099c3",
  black : "#000000",
  white : "#ffffff",
  grey : "#a3a3a3",
  none: "#ffffff"
}

const defaultColour = "#ffffff";

var imagesArray = [];
var slidePlace = 0;

/**-----------------------------------------------------------------
 * productPage_addToWishlist
 * adds product to the wishlist
 ------------------------------------------------------------------*/
function productPage_addToWishlist(productName, mainImage) {
  console.log('productPage_addToWishlist')
// check if user is signed in
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Please sign in to add to wishlist.");
      return;
    }

// Ensure these variables exist in scope
    if (!productID || !productName || !mainImage) {
      return console.error("Product info missing");
    }

// add product info to the database
    firebase.database().ref("/accounts/" + user.uid + "/wishlist/" + productID).update({
      productName,
      mainImage
    }).then(() => {
      createWishlistRemoveButton();
    }).catch(err => {
      console.error("Error adding to wishlist:", err);
    });
}

/**-----------------------------------------------------------------
 * productPage_removeFromWishlist
 * removes product from the wishlist
 ------------------------------------------------------------------*/
function productPage_removeFromWishlist() {
  console.log('productPage_removeFromWishlist')
    const user = firebase.auth().currentUser;

    var productRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${productID}`);

// remove productID from wishlist
    productRef.remove()
// update wishlist button
        .then(function() {
          createWishlistAddButton();
        })
        .catch(function(error) {
            console.log('failure', error);
            alert(`There was an error removing from the wishlist. Please try again.`);
        });
}

/**-----------------------------------------------------------------
 * createWishlistAddButton
 * adds wishlist button (to add products) to the HTML page
 ------------------------------------------------------------------*/
function createWishlistAddButton() {
  console.log('createWishlistAddButton')
  var wishlistContainer = document.getElementById("container_wishlistButton");
  firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
    var product = snapshot.val()
    wishlistContainer.innerHTML = 
            `<button onclick="productPage_addToWishlist('${product.productName}', '${product.mainImage}')" 
              id="button_addToWishlist">
              <img src="/images/heart.png">
            </button>`
  });
}

/**-----------------------------------------------------------------
 * createWishlistRemoveButton
 * adds wishlist button (to remove products) to the HTML page
 ------------------------------------------------------------------*/
function createWishlistRemoveButton() {
  console.log('createWishlistRemoveButton')
  var wishlistContainer = document.getElementById("container_wishlistButton");
  wishlistContainer.innerHTML = 
            `<button onclick="productPage_removeFromWishlist()"
              id="button_addToWishlist">
              <img src="/images/x.png">
            </button>`     
}
/**-----------------------------------------------------------------
 * loadProductDetails
 * populates the HTML page with the product details, 
 * and wishlist + cart buttons
 ------------------------------------------------------------------*/
function loadProductDetails() {
if (productID) {
    // Fetch and display the product from database using productID
    firebase.auth().onAuthStateChanged((user) => {
// if user is signed in
      if (user) { 
        const wishlistRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${productID}`);

        wishlistRef.once("value").then(snapshot => {
          var wl_product = snapshot.val()

          if (wl_product === null) {
            createWishlistAddButton()
          } else {
            createWishlistRemoveButton()
          }
        });


        const cartRef = firebase.database().ref(`/accounts/${user.uid}/cart/${productID}`);
        var div = document.getElementById("container_cartButton");
        cartRef.once('value')
        .then(snapshot => {
// if productID exists in the cart, add unclickable cart button
        if (snapshot.exists()) {
            div.innerHTML = `<div class="div_addToCart">Added to cart</div>`
// if productID does not exist in the cart, add cart button
        } else {
            console.log('Product is not in the cart.');
            div.innerHTML = `<button id="button_addToCart">Add to cart</button>`
            const addToCartButton = document.getElementById("button_addToCart");
            addToCartButton.addEventListener("click", addToCart);
        }
        }).catch(error => {
        console.error('Error checking cart:', error);
        });
      } else {
        console.log('No user is signed in.');
      }
    });
    
    firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
        var productInfo = snapshot.val();
        var price = productInfo.price; 
        var brand = productInfo.brand;
        var colour1 = productInfo.colour1;
        const colour1code = colourMap[colour1] ?? defaultColour
        var colour2 = productInfo.colour2;
        const colour2code = colourMap[colour2] ?? defaultColour

        imagesArray = productInfo.images;
        var mainImage = productInfo.mainImage;
        var productName = productInfo.productName;
        var size = productInfo.size;
        var description = productInfo.description;
        var flaws = 'none';
        var shipping = productInfo.shipping;

        var div_colour1 = `<div id="colour1"></div><p>${colour1}</p>`
        document.getElementById("div_colour").innerHTML += div_colour1;
        var newdiv_colour1 = document.getElementById("colour1")
        newdiv_colour1.style.backgroundColor = colour1code;
        if (colour1 === "white") {
          console.log("add border");
          newdiv_colour1.style.border = "1px solid black"
        }

        var div_colour2 = `<div id="colour2"></div><p>${colour2}</p>`
        document.getElementById("div_colour").innerHTML += div_colour2;
        var newdiv_colour2 = document.getElementById("colour2")
        newdiv_colour2.style.backgroundColor = colour2code;
        if (colour2 === "white") {
          console.log("add border");
          newdiv_colour2.style.border = "1px solid black"
        }

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
        
        var img_selectedSlide = document.getElementById("slide0");
        img_selectedSlide.style.opacity = 0.5;
        
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

        var p_shipping= document.getElementById("p_shipping");
        p_shipping.innerHTML += '$' + shipping;

    });
  } else {
    // Show error message or redirect
    console.log('product not found')
  }
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