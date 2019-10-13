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

function comp(a, b) {
    return b[1]*1 - a[1]*1;
}

async function update() {
    let field_size = {
        x_size: chainField.sizeX,
        y_size: chainField.sizeY
    };
    let url = `Results/table_${field_size.x_size}_${field_size.y_size}.json`;
    let response = await fetch(url).catch(err => showError());
    let bad_scores = await response.json();
    let scores = [];
    for (let i = 0; i < Object.keys(bad_scores).length; ++i) {
        pair = [Object.keys(bad_scores)[i], bad_scores[Object.keys(bad_scores)[i]]];
        scores[scores.length] = pair;
    }
    scores.sort(comp);
    update_table(scores);
    return;
}

update();
