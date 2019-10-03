async function sendJSON() {
    let response = await fetch("/results.json", 
        {
            method: 'post',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Field-Size-X": "6",
                "Field-Size-Y": "6",
                "Name": document.getElementById('name').value
            },
            body: data.getAttribute('points')
        })
}

console.log(document.getElementById('name'), document.getElementById('name')
    .value);
submit_button.addEventListener('click', function() {console.log('submit'); sendJSON();});

