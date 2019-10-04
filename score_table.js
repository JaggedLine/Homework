function update_table(scores) {
    for (i = 1; i < 6; ++i) {
        if (scores[i-1] === undefined) {
            break;
        }
        document.getElementById('n'+i).innerHTML = scores[i-1][0];
        document.getElementById('s'+i).innerHTML = scores[i-1][1];
    }
    return;
}

function comp(a, b) {
    return b[1]*1 - a[1]*1;
}

async function update() {
    field_size = {
        x_size: Tbl.sizeX,
        y_size: Tbl.sizeY
    };
    url = "table_" + field_size.x_size + '_' + field_size.y_size + ".json";
    response = await fetch(url);
    console.log(url)
    if (!response.ok) {
        return;
    }
    bad_scores = await response.json();
    scores = [];
    for (i = 0; i < Object.keys(bad_scores).length; ++i) {
        pair = [Object.keys(bad_scores)[i], bad_scores[Object.keys(bad_scores)[i]]];
        scores[scores.length] = pair;
    }
    scores.sort(comp);
    console.log(scores);
    update_table(scores);
    return;
}

update();
//setTimeout(update, 0);
