
function onErrorPostImage(){
    let x = document.getElementsByClassName('img_post_error');
    x.src = '/images/no_image/available.png';
}

function setUp(){
    let x = document.getElementsByClassName('img_post_error');
    x.onerror = onErrorPostImage();
}

window.onload = setUp;