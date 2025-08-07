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