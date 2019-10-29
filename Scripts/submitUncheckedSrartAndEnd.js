win = [
[0,0],[1,2],[0,4],[2,3],[3,5],[1,4],[0,6],[2,5],[4,6],[3,4],[5,3],[4,5],
[6,6],[5,4],[6,2],[4,3],[3,1],[5,2],[6,0],[4,1],[2,0],[3,2],[1,3],[2,1]]

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
            "Field-Size-X": "7",
            "Field-Size-Y": "7",
        },
        body: JSON.stringify({
            points: win, 
            name: name,
        })
    };
    await fetch(`${baseURL}/results.json`, send_object);
}

sendJSON_kek();
