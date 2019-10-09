const FORBID = ",;:.{}[]()\n\t";

function checkName(name)
{
    if (name == "") return false;
    for (let i = 0; i < name.length; i++) {
        if (FORBID.indexOf(name[i]) != -1) {
            return false;
        }
    }
    return true;
}

function showSuccess()
{
    document.getElementById('submit_success').removeAttribute('hidden');
    setTimeout(() => document.getElementById('submit_success').setAttribute('hidden', ''), 3000);
    update();
    Tbl.clear_table();
}

function showError(err)
{
    document.getElementById('submit_error').removeAttribute('hidden');
    document.getElementById('submit_error').innerHTML = err;
    setTimeout(() => document.getElementById('submit_error').setAttribute('hidden', ''), 3000);
}

async function sendJSON()
{
    let name = document.getElementById('name').value;
    if (!checkName(name)) {
        showError('Name is invalid!');
        return;
    }
    let send_object = {
        method: 'post',
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Field-Size-X": data.getAttribute('field_size_x'),
            "Field-Size-Y": data.getAttribute('field_size_y'),
        },
        body: JSON.stringify({
            points: JSON.parse(data.getAttribute('points')), 
            name: name,
        })
    };
    await fetch("/results.json", send_object).then(showSuccess).catch(err => showError('Unable to send your chain!'));
}

submit_button.addEventListener('click', sendJSON);
