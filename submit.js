async function sendJSON() {
    send_object = {
        method: 'post',
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Field-Size-X": data.getAttribute('field_size_x'),
            "Field-Size-Y": data.getAttribute('field_size_y')
        },
        body: JSON.stringify({
            points: JSON.parse(data.getAttribute('points')), 
            name: document.getElementById('name').value
        })
    };
    // console.log(send_object)
    let response = await fetch("/results.json", send_object)
    update()
}

// console.log(document.getElementById('name'), document.getElementById('name')
//     .value);
submit_button.addEventListener('click', function() {
    // console.log('submit', document.getElementById('name').value);
    sendJSON();
    Tbl.clear_table();
    // document.getElementById('chain_error').setAttribute('hidden', '');
    document.getElementById('submit_success').removeAttribute('hidden');
    setTimeout(() => document.getElementById('submit_success').setAttribute('hidden', ''), 3000);
});
