window.onload = function() {
  console.log('nav page load')
  navBar()
  footer()
};

function navBar() {
  console.log('navBar')
  var div = document.getElementById("container_navBar");
  div.innerHTML = `
  <div id="hb_darkOverlay" onclick="closeHamburger()"></div>
  <div id="search_darkOverlay" onclick="closeSearch()"></div>
<!-- HEADER BAR  ********************************************************-->
<header>
<!-- MOBILE-hamburger-menu -->
<div id="hamburger_menu">
  <a id="a_hamburger" href="javascript:void(0);" onclick="openHamburger()">
  <img id="hamburger" src="/images/hamburger.png" alt="menu">
  </a>

  <div id="myLinks" class="hamburgerNeutral">
  <img src="/images/x.png" onclick="closeHamburger()" alt="exit">

  <a class="a_pageLink" href="/index.html">HOME</a>

  <!-- SHOP DROPDOWN -->
  <div class="dropdown">
      <a class="a_pageLink dropdown-toggle" href="javascript:void(0);" onclick="toggleDropdown()">SHOP ▾</a>
      <div class="dropdown-menu">
      <a href="/shopAll/shopAll.html">Shop All</a>
      <a href="/shopAll/tops.html">Tops</a>
      <a href="/shopAll/bottoms.html">Bottoms</a>
      <a href="/shopAll/dresses.html">Dresses</a>
      <a href="/shopAll/shoes.html">Shoes</a>
      <a href="/shopAll/accessories.html">Accessories</a>
      <a href="/shopAll/art.html">Art</a>
      </div>
  </div>

<a class="a_pageLink" href="/about/about.html">ABOUT</a>
<a class="a_pageLink" href="/reviews/reviews.html">REVIEWS</a>
</div>
</div>

<!--MOBILE-search-icon-->
  <div id="mobile_searchIcon" class="icon"> 
      <amp-img src="/images/search.png" onclick="openSearch()" alt="search">
  </div>

<!--WEB-search-bar-->
  <div id="div_search">
      <form id="web_searchForm" class="form_searchBar" onsubmit="web_searchSubmit(event); return false">
          <input class="submitButton" type="image" id="web_searchSubmit"
          src="/images/search.png" alt="submit">
          <input class="inputBar" type="text" id="web_searchInput"
          placeholder="Search..." required>
          <div id="inputBar_line"></div>
      </form>
  </div>

<!--WEB-MOBILE-logo-->
<div id="logoDiv">
  <a href="/index.html">
      <img id="logo" src="/images/translogo.png" alt="Doll Planet">
  </a>
</div>


<div id="div_filler"></div>

<!--WEB-MOBILE-icons-->
<div class="icon" id="wishlist">
  <a href="/account/account_wishlist.html">
      <img class="navIcons" src="/images/heart.png" alt="wishlist">
  </a>
</div>
<div class="icon" id="cart">
  <a href="/purchase/cart.html">
      <img class="navIcons" src="/images/cart.png" alt="cart">
  </a>
</div>
<div class="icon" id="account">
  <a href="/account/account_redirect.html">
      <img class="navIcons" src="/images/account.png" alt="account">
  </a>
</div>
</header>
<!-- HEADER END ********************************************************-->
<!-- NAV BAR  ********************************************************-->
<!--MOBILE-search-bar-->
  <div id="mobile_div_search" class="searchNeutral">
      <form id="mobile_searchForm" class="form_searchBar" onsubmit="mobile_searchSubmit(event); return false">
          <input class="inputBar" id="mobile_searchInput" type="text" autofocus required>
          <input class="submitButton" id="mb_searchSubmit" type="image"
          src="/images/search.png" alt="submit">
      </form>
  </div>

<nav>
  <a href="/index.html">HOME</a>
  <div class="shopDropdown">
     <button class="dropbtn" onclick="window.location='/shopAll/shopAll.html'">SHOP</button>
      <div class="shopDropdownContent">
          <a href="/shopAll/shopAll.html">Shop All</a>
          <a href="/shopAll/tops.html">Tops</a>
          <a href="/shopAll/bottoms.html">Bottoms</a>
          <a href="/shopAll/dresses.html">Dresses</a>
          <a href="/shopAll/shoes.html">Shoes</a>
          <a href="/shopAll/accessories.html">Accessories</a>
          <a href="/shopAll/art.html">Art</a>
      </div>
      </div>
  <a href="/about/about.html">ABOUT</a>
  <a href="/reviews/reviews.html">REVIEWS</a>
</nav>
<!-- NAV BAR END ********************************************************-->
  `
}

function footer() {
  console.log('footer')
  var div = document.getElementById("container_footer");
  div.innerHTML = `
<!-- FOOTER SECTION ********************************************************-->
        <div id="footer">
            <div>
                <h3>Socials</h3>
                <ul>
                <li>
                    <img src="gmail">
                    <button><p>Gmail</p></button>
                </li>
                <li>
                    <img src="insta">
                    <button><p>Insta</p></button>
                </li>
                </ul>
            </div>
            <div>
                <h3>About Doll Planet</h3>
                <ul>
                    <li><a href="/about/about.html">About us</a></li>
                    <li><a href="/about/privacypolicy.html">Privacy policy</a></li>
                    <li><a href="/about/termsandconditions.html">Terms and conditions</a></li>
                </ul>
            </div>
            <div>
                <h3>Sign up</h3>
                <a href="/account/account_redirect.html">Make an account</a>
            </div>
        </div>
<!-- FOOTER SECTION END ********************************************************-->`
}


function openHamburger() {
    var overlay = document.getElementById("hb_darkOverlay");
    document.getElementById('myLinks').classList.add('hamburgerIn');
    document.getElementById('myLinks').classList.remove('hamburgerOut');
    document.getElementById('myLinks').classList.remove('hamburgerNeutral');
    document.body.style.overflow = 'hidden';
    overlay.style.display = 'block'
  }
  
  function closeHamburger() {
    var overlay = document.getElementById("hb_darkOverlay");
    document.getElementById('myLinks').classList.add('hamburgerOut');
    document.getElementById('myLinks').classList.remove('hamburgerIn');
    document.body.style.overflow = 'scroll';
    overlay.style.display = 'none'
    overlay.style.position = 'fixed'
  }

  function toggleDropdown() {
    const dropdown = document.querySelector(".dropdown");
    dropdown.classList.toggle("open");
  }
  
  function openSearch() {
    var overlay = document.getElementById("search_darkOverlay");
    document.body.style.overflow = 'hidden';
    document.getElementById('mobile_div_search').classList.add('searchIn');
    document.getElementById('mobile_div_search').classList.remove('searchOut');
    document.getElementById('mobile_div_search').classList.remove('searchNeutral');
    overlay.style.display = 'block'
    overlay.style.position = 'fixed'
  }
  
  function closeSearch() {
    var overlay = document.getElementById("search_darkOverlay");
    document.body.style.overflow = 'scroll';
    document.getElementById('mobile_div_search').classList.add('searchOut');
    document.getElementById('mobile_div_search').classList.remove('searchIn');
    overlay.style.display = 'none'
  }