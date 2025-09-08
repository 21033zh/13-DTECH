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
 ------------------------------------------------------------------*/
 function createWishlistAddButton(user) {
  console.log('createWishlistAddButton');
  var wishlistContainer = document.getElementById("container_wishlistButton");

  wishlistContainer.innerHTML = `
    <button id="button_addToWishlist">
      <img src="/images/heart.png">
    </button>`;

  const btn = document.getElementById("button_addToWishlist");
  btn.addEventListener("click", () => {
    if (user) {
      productPage_addToWishlist();
    } else {
      showPopup("Log in to add to wishlist");
    }
  });
}

/**-----------------------------------------------------------------
 * createWishlistRemoveButton
 ------------------------------------------------------------------*/
function createWishlistRemoveButton(user) {
  console.log('createWishlistRemoveButton');
  var wishlistContainer = document.getElementById("container_wishlistButton");

  wishlistContainer.innerHTML = `
    <button id="button_removeFromWishlist">
      <img src="/images/x.png">
    </button>`;

  const btn = document.getElementById("button_removeFromWishlist");
  btn.addEventListener("click", () => {
    if (user) {
      productPage_removeFromWishlist();
    } else {
      showPopup("Log in to remove from wishlist");
    }
  });
}

/**-----------------------------------------------------------------
 * loadProductDetails
 ------------------------------------------------------------------*/
function loadProductDetails() {
  console.log('loadProductDetails');

  if (!productID) {
    console.log('product not found');
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) { 
      const cartRef = firebase.database().ref(`/accounts/${user.uid}/cart/${productID}`);
      const wishlistRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${productID}`);

      wishlistRef.once("value").then(snapshot => {
        if (snapshot.val() === null) {
          createWishlistAddButton(user);
        } else {
          createWishlistRemoveButton(user);
        }
      });

      displayProductDetails(cartRef, user);
    } else {
      // Always show "add to wishlist" button even if not logged in
      createWishlistAddButton(null);
      displayProductDetails(null, null);
    }
  });
}

/**-----------------------------------------------------------------
 * displayProductDetails
 ------------------------------------------------------------------*/
function displayProductDetails(cartRef, user) {
  console.log('displayProductDetails');

  firebase.database().ref('/products/' + productID).once('value', function(snapshot) {
    var productInfo = snapshot.val();
    if (!productInfo) {
      console.error("No product info found for ID:", productID);
      return;
    }

    var price = productInfo.price; 
    var brand = productInfo.brand;
    var colour1 = productInfo.colour1;
    const colour1code = colourMap[colour1] ?? defaultColour;
    var colour2 = productInfo.colour2;
    const colour2code = colourMap[colour2] ?? defaultColour;
    imagesArray = productInfo.images;
    var productName = productInfo.productName;
    var size = productInfo.size;
    var description = productInfo.description;
    var flaws = 'none';
    var stock = Number(productInfo.stock);

    var container_cartButton = document.getElementById("container_cartButton");

    // ----------------------------
    // Handle cart button
    // ----------------------------
    if (stock > 0) {
      cartRef.once('value').then(snapshot => {
        if (snapshot.exists() && stock <= 1) {
          container_cartButton.innerHTML = `<div class="div_addToCart">IN CART</div>`;
        } else {
          console.log('stock higher than 0');
          container_cartButton.innerHTML = `<button id="button_addToCart">ADD TO CART</button>`;
          const addToCartButton = document.getElementById("button_addToCart");

          addToCartButton.addEventListener("click", () => {
            if (user) {
              // user signed in → normal addToCart
              cartRef.once('value').then(snapshot => {
                if (!snapshot.exists()) {
                  addToCart();
                } else {
                  console.log('not happening bud')
                }
              });
            } else {
              // user NOT signed in → show popup
              showPopup("Log in to add to cart");
            }
          });

        }
      })
    } else {
      container_cartButton.innerHTML = `<div class="div_addToCart">OUT OF STOCK</div>`;
    }

    // ----------------------------
    // Colour display
    // ----------------------------
    document.getElementById("div_colour").innerHTML = ""; // reset
    var div_colour1 = `<div id="colour1"></div><p>${colour1}</p>`;
    document.getElementById("div_colour").innerHTML += div_colour1;
    var newdiv_colour1 = document.getElementById("colour1");
    newdiv_colour1.style.backgroundColor = colour1code;
    if (colour1 === "white") newdiv_colour1.style.border = "1px solid black";

    var div_colour2 = `<div id="colour2"></div><p>${colour2}</p>`;
    document.getElementById("div_colour").innerHTML += div_colour2;
    var newdiv_colour2 = document.getElementById("colour2");
    newdiv_colour2.style.backgroundColor = colour2code;
    if (colour2 === "white") newdiv_colour2.style.border = "1px solid black";

    // ----------------------------
    // Images
    // ----------------------------
    var ul_photos = document.getElementById("ul_photos");
    ul_photos.innerHTML = ""; 
    for (let i = 0; i < imagesArray.length; i++) {
      let photo = `<li><img id="slide${i}" src="${imagesArray[i]}"></li>`;
      ul_photos.innerHTML += photo;
    }

    var div = document.getElementById("div_selectedImage");
    div.innerHTML = `<img class="img_selected" src=${imagesArray[slidePlace]}>`;

    var img_selectedSlide = document.getElementById("slide0");
    if (img_selectedSlide) img_selectedSlide.style.opacity = 0.5;

    // ----------------------------
    // Text fields
    // ----------------------------
    document.getElementById("title").innerHTML = productName;
    document.getElementById("h1_name").innerHTML = productName;
    document.getElementById("p_price").innerHTML = '$' + price;
    document.getElementById("p_brand").innerHTML = brand;
    document.getElementById("p_size").innerHTML = size;
    document.getElementById("p_description").innerHTML = description;
    document.getElementById("p_flaws").innerHTML = flaws;
  });
}

/**-----------------------------------------------------------------
 * Simple popup function
 ------------------------------------------------------------------*/
function showPopup(message) {
  // You can style this better with CSS
  const popup = document.createElement("div");
  popup.className = "popupMessage";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2000); // disappears after 2 seconds
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