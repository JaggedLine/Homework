function drawNoAnimation(table, x1, y1, x2, y2)
{
    let xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
    let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height;
    let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    let styleObject = {
        background: table.segment_color,
        transform: `rotate(${ang}deg)`,
        width: `${len}px`,
        height: `${table.segment_height}px`,
        top: `${yc + table.node_radius - table.segment_height / 2 + table.background_border}px`,
        left: `${xc - len / 2 + table.node_radius + table.background_border}px`,
        'border-radius': `${table.segment_height / 2}px`,
    };
    let optObject = {
        id: `segment_${table.id}_${table.lines_cnt()}`,
        class: `segment`,
    };
    addElement(segments, 'div', styleObject, optObject);
}

function drawLinearAnimation(table, x1, y1, x2, y2)
{
    table.busy = true;
    let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    let styleObject = {
        background: table.segment_color,
        transform: `rotate(${ang}deg)`,
        height: `${table.segment_height}px`,
        'border-radius': `${table.segment_height / 2}px`,
    };
    let optObject = {
        id: `segment_${table.id}_${table.lines_cnt()}`,
        class: 'segment',
    };
    let segment = addElement(segments, 'div', styleObject, optObject);

    function timer(t) {
        if (t >= 1.05) {
            table.busy = false;
            return;
        }
        setTimeout(() => timer(t + 0.1), 20);
        let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
        let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
        segment.style.width = `${len}px`;
        segment.style.top = `${yc + table.node_radius - table.segment_height / 2 + table.background_border}px`;
        segment.style.left = `${xc - len / 2 + table.node_radius + table.background_border}px`;
    }
    timer(0);
}

function drawLeshaAnimation(table, x1, y1, x2, y2)
{
    table.busy = true;
    let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    let styleObject = {
        background: table.segment_color,
        transform: `rotate(${ang}deg)`,
        height: table.segment_height,
    };
    let optObject = {
        id: `segment_${table.id}_${table.lines_cnt()}`,
        class: `segment`,
    };
    let segment = addElement(segments, 'div', styleObject, optObject);

    function timer(t) {
        if (t >= 1.05) {
            table.busy = false;
            return;
        }
        setTimeout(() => timer(t + 0.05), 10);
        let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
        let len1 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * 1;
        let len2 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
        segment.style.width = `${len2}px`;
        segment.style.top = `${yc + table.node_radius - table.segment_height / 2 + table.background_border}px`;
        segment.style.left = `${xc - len1 / 2 + table.node_radius + table.background_border}px`;
    }
    timer(0);
}

function destroyNoAnimation(table, N)
{
    segments.removeChild(table.segment(table.lines_cnt() - 1));
    table.points.pop();
    table.update_score();
    table.update_colors();
    if (N > 1) {
        destroyNoAnimation(table, N - 1);
    }
}

function destroyLinearAnimation(table, N, past = 0)
{
    table.busy = true;
    let segment = table.segment((table.lines_cnt() - 1));
    let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
    let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;

    function timer(t) {
        if (t == 1) {
            table.points.pop();
            table.onchange();
            table.update_colors();
        } 
        if (t <= 0) {
            segments.removeChild(table.segment(table.lines_cnt()));
            table.update_score();
            table.update_colors();
            if (N > 1) {
                destroyLinearAnimation(table, N - 1, past + 1);
            }
            else {
                table.busy = false;
            }
            return;
        }
        setTimeout(() => timer(t - 0.1 * (1 + Math.min(N - t, past + t))), 20);
        let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
        let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
        segment.style.width = `${len}px`;
        segment.style.top = `${yc + table.node_radius - table.segment_height / 2 + table.background_border}px`;
        segment.style.left = `${xc - len / 2 + table.node_radius + table.background_border}px`;
    }
    timer(1);
}

function destroyLeshaAnimation(table, N, past = 0)
{
    table.busy = true;
    let segment = table.segment((table.lines_cnt() - 1));
    let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
    let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;

    function timer(t) {
        if (t <= 0) {
            segments.removeChild(table.segment(table.lines_cnt() - 1));
            table.points.pop();
            table.onchange();
            table.update_score();
            table.update_colors();
            if (N > 1) {
                destroyLeshaAnimation(table, N - 1, past + 1);
            }
            else {
                table.busy = false;
            }
            return;
        }
        setTimeout(() => timer(t - 0.05 * (1 + Math.min(N - t, past + t))), 10);
        let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
        let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
        segment.style.top = `${yc + table.node_radius - table.segment_height / 2 + this.background_border}px`;
        segment.style.width = `${len}px`;
    }
    timer(1);
}
