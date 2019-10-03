async function sendJSON() {
    let response = await fetch("/results.json", 
        {
            method: 'post',
            headers: {
                "Content-Type": "application/json;charset=utf-8",
                "Field-Size-X": data.getAttribute('field_size_x'),
                "Field-Size-Y": data.getAttribute('field_size_y'),
                "Name": document.getElementById('name').value
            },
            body: data.getAttribute('points')
        })
}

console.log(document.getElementById('name'), document.getElementById('name')
    .value);
submit_button.addEventListener('click', function() {console.log('submit'); sendJSON();});

