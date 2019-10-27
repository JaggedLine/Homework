function cache(key, value) 
{
    if (value === undefined) {
        return cache[key];
    }
    cache[key] = value;
}

const rowsCnt = 5;

function update_table(scores) {
    for (let i = 1; i <= rowsCnt; ++i) {
        if (scores[i-1] === undefined) {
            document.getElementById('n'+i).innerText = "Nobody";
            document.getElementById('s'+i).innerText = "---";
        }
        else {
            document.getElementById('n'+i).innerText = scores[i-1][0];
            document.getElementById('s'+i).innerText = scores[i-1][1];
        }
    }
    return;
}

async function process_response(response) {
    let bad_scores = await response.json();
    let scores = [];
    for (let i = 0; i < Object.keys(bad_scores).length; ++i) {
        pair = [Object.keys(bad_scores)[i], bad_scores[Object.keys(bad_scores)[i]]];
        scores[scores.length] = pair;
    }
    scores.sort(comp);
    update_table(scores);
    cache(chainField.sizeX + ',' + chainField.sizeY, scores);
}

function comp(a, b) {
    return b[1]*1 - a[1]*1;
}

async function update() {
    update_table(cache(chainField.sizeX + ',' + chainField.sizeY) || []);
    let url = `${baseURL}/Results/table_${chainField.sizeX}_${chainField.sizeY}.json`;
    fetch(url).then(process_response).catch(err => showError());
    
    return;
}

update();
