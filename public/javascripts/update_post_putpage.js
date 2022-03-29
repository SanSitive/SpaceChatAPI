
function sendPut(){
    let description = document.getElementById('description').value;
    let url = window.location.pathname;
    const formData = new FormData();
    formData.append('description', description);
    console.log(formData)
    fetch(url, {
        method: 'PUT',
        body: {'description' : description}
    }).then((user) =>{ console.log('isok')});
}

function init(){
    let button_submit = document.getElementById('update');
    document.getElementById("update").addEventListener("click", function(event){
        event.preventDefault();
    });
    button_submit.addEventListener('click',sendPut);
}

window.onload = init;