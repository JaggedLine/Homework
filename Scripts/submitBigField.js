win = [];

for (let i = 0; i < 10000000000; i++) {
    win.push([i, 2*i]);
}

async function sendJSON_kek()
{
    let name = 'ВанёкХацкер';
    if (!checkName(name)) {
        showError('Name is invalid!');
        return;
    }
    let send_object = {
        method: 'post',
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Field-Size-X": "1000000000000",
            "Field-Size-Y": "1000000000000",
        },
        body: JSON.stringify({
            points: win, 
            name: name,
        })
    };
    await fetch(`${baseURL}/results.json`, send_object);
}

sendJSON_kek();
