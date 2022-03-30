
function onErrorPostImage(x){
    x.src = '/images/no_image_available.png';
}

function onErrorAuthorImage(x){
    x.src = '/images/default_user_image.png';
}

function setUp(){
    let x = document.getElementsByClassName('img_post_error');
    for(let i=0; i<x.length; i++){
        x[0].onerror = onErrorPostImage(x[0])
    }
    let y = document.getElementsByClassName('img_author_error');
    for(let i=0; i<y.length; i++){
        y[0].onerror = onErrorAuthorImage(y[0])
    }
}

//window.onload = setUp
