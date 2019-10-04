let xxx;
let yyy = false;

function segments_intersect(x1, y1, x2, y2, x3, y3, x4, y4) // true if intersects
{
    let a = vector_mul(x2 - x1, y2 - y1, x3 - x1, y3 - y1) * vector_mul(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
    let b = vector_mul(x4 - x3, y4 - y3, x1 - x3, y1 - y3) * vector_mul(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
    if (a <= 0 && b <= 0) {
        if (a == 0 && b == 0) {
            // оставим на потом)
            return false;
        }
        return true;
    }
    return false;
}

function vector_mul(x1, y1, x2, y2)
{
    return x1 * y2 - x2 * y1;
}

function addElement(parent, tag, style, opt)
{
    elem = document.createElement(tag);
    for (let prop in opt) {
        elem.setAttribute(prop, opt[prop]);
    }
    let styleText = '';
    for (let prop in style) {
        styleText += ` ${prop}: ${style[prop]};`;
    }
    elem.style.cssText = styleText;
    parent.append(elem);
    return elem;
}

function setStyles(elem, style) {
    for (let prop in style) {
        elem.style[prop] = style[prop]
    }
}

class Table
{
    constructor(opt = {})
    {
        this.sizeX = 0;
        this.sizeY = 0;
        this.points = new Array();
        this.games_cnt = 0;

        this.id = opt.id === undefined ? 'main' : opt.id;
        this.sz = opt.sz || 60;
        this.win = false;

        this.segment_height = opt.segment_height || 15;
        this.segment_color = opt.segment_color || 'green';

        this.node_radius = opt.node_radius || 15;
        this.clickable_node_radius = opt.clickable_node_radius || this.node_radius;
        this.node_border_radius = opt.node_border_radius || 0;
        this.node_color = opt.node_color || 'green';
        this.node_border_color = opt.node_border_color || this.node_color;
        this.hover_node_color = opt.hover_node_color || 'grey';
        this.used_node_color = opt.used_node_color || this.node_color;
        this.used_node_border_color = opt.used_node_border_color || this.node_border_color;
        this.start_node_color = opt.start_node_color || 'red';
        this.end_node_color = opt.end_node_color || 'black';

        this.covered_node = 0;
        this.delete_node_color = opt.delete_node_color || this.node_color;
        this.first_delete_node_color = opt.first_delete_node_color || this.delete_node_color + 'url(cross.png)';
        this.delete_segment_color = opt.delete_segment_color || this.segment_color;

        this.show_score = opt.show_score === undefined ? true : opt.show_score;
        this.show_grid = opt.show_grid === undefined ? false : opt.show_grid;
        this.grid_color = opt.grid_color || 'yellow';
        this.grid_width = opt.grid_width || 10;

        this.background_color = opt.background_color || 'transparent';
        this.background_border = opt.background_border || 0;
    }

    make_busy() {
        this.busy = true;
    }

    not_busy() {
        this.busy = false;
    }

    segment(n) {
        return document.getElementById(`segment_${this.id}_${n}`);
    }

    node(x, y) {
        return document.getElementById(`node_${this.id}_${x}_${y}`);
    }

    clicknode(x, y) {
        return document.getElementById(`clicknode_${this.id}_${x}_${y}`);
    }

    gridline(dir, x) {
        return document.getElementById(`gridline_${this.id}_${dir}${x}`);
    }

    update_colors()
    {
        for (let x = 0; x < this.sizeX; ++x) {
            for (let y = 0; y < this.sizeY; ++y) {
                this.node(y, x).style.background = this.node_color;
                this.node(y, x).style.borderColor = this.node_border_color;
            }
        }
        for (let point of this.points) {
            this.node(point[1], point[0]).style.background = this.used_node_color;
            this.node(point[1], point[0]).style.borderColor = this.used_node_border_color;
        }
        for (let n = 0; n < this.lines_cnt(); n++) {
            this.segment(n).style.background = this.segment_color;
        }
        if (this.covered_node) {
            let n = this.find_node(this.covered_node[0], this.covered_node[1]);
            if (n != this.points.length - 1) {
                let x = this.covered_node[0], y = this.covered_node[1];
                // console.log(x, y, n);
                if (n == -1) {
                    this.node(y, x).style.background = this.hover_node_color;
                }
                else {
                    n++;
                    this.node(y, x).style.background = this.first_delete_node_color;
                    for (; n < this.points.length; n++) {
                        this.node(this.points[n][1], this.points[n][0]).style.background = this.delete_node_color;
                        this.segment(n - 1).style.background = this.delete_segment_color;
                    }
                }
            }
        }
        if (this.start_point) {
            this.node(this.start_point[1], this.start_point[0]).style.background = this.start_node_color;
        }
        if (this.end_point) {
            this.node(this.end_point[1], this.end_point[0]).style.background = this.end_node_color;
        }
    }

    update_positions()
    {
        for (let i = 0; i < this.sizeY; ++i) {
            for (let j = 0; j < this.sizeX; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let styleObject = {
                    top: `${y_pos + this.background_border}px`,
                    left: `${x_pos + this.background_border}px`,
                };
                setStyles(this.node(i, j), styleObject);
            }
        }
        for (let i = 0; i < this.sizeY; ++i) {
            for (let j = 0; j < this.sizeX; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let styleObject = {
                    top: `${y_pos - this.clickable_node_radius + this.node_radius + this.background_border}px`,
                    left: `${x_pos - this.clickable_node_radius + this.node_radius + this.background_border}px`,
                };
                setStyles(this.clicknode(i, j), styleObject);
            }
        }
        for (let n = 0; n < this.lines_cnt(); ++n) {
            let x1 = this.points[n][0] * this.sz, y1 = this.points[n][1] * this.sz;
            let x2 = this.points[n + 1][0] * this.sz, y2 = this.points[n + 1][1] * this.sz; 
            let xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
            let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + this.segment_height;
            let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            let styleObject = {
                transform: `rotate(${ang}deg)`,
                width: `${len}px`,
                height: `${this.segment_height}px`,
                top: `${yc + this.node_radius - this.segment_height / 2 + this.background_border}px`,
                left: `${xc - len / 2 + this.node_radius + this.background_border}px`,
            };
            setStyles(this.segment(n), styleObject);
        }
        if (this.show_grid) {
            for (let i = 0; i < this.sizeY; ++i) {
                let styleObject = {
                    top: `${i * this.sz + this.node_radius - this.grid_width/2 + this.background_border}px`,
                    left: `${this.node_radius - this.grid_width/2 + this.background_border}px`,
                    width: `${(this.sizeX - 1) * this.sz + this.grid_width}px`,
                    height: `${this.grid_width}px`,
                };
                setStyles(this.gridline('y', i), styleObject);
            }
            for (let j = 0; j < this.sizeX; ++j) {
                let styleObject = {
                    left: `${j * this.sz + this.node_radius - this.grid_width/2 + this.background_border}px`,
                    top: `${this.node_radius - this.grid_width/2 + this.background_border}px`,
                    height: `${(this.sizeY - 1) * this.sz + this.grid_width}px`,
                    width: `${this.grid_width}px`,
                };
                setStyles(this.gridline('x', j), styleObject);  
            }
        }
    }

    update_background() {
        field.style.width = `${this.sz * (this.sizeX - 1) + this.node_radius * 2 + this.background_border * 2}px`;
        field.style.height = `${this.sz * (this.sizeY - 1) + this.node_radius * 2 + this.background_border * 2}px`;
        field.style.background = this.background_color;
        field.style.border = `${this.background_border} solid ${this.background_color}`;
    }

    resize(xLength, yLength) {
        let xsz = (xLength - this.node_radius * 2) / (this.sizeX - 1);
        let ysz = (yLength - this.node_radius * 2) / (this.sizeY - 1);
        this.sz = Math.min(xsz , ysz);
        this.update_positions();
        this.update_background();
    }

    lines_cnt() {
        return this.points.length - 1;
    }

    update_score() {
        if (this.show_score) {
            score.innerHTML = this.lines_cnt();
        }
    }

    find_node(x, y)
    {
        for (let i = 0; i < this.points.length; i++) {
            let node = this.points[i];
            if (node[0] == x && node[1] == y) {
                return i;
            }
        }
        return -1;
    }

    clear_segments()
    {
        let for_delete = [];
        for (let child of segments.children) {
            if (child.getAttribute('id').startsWith(`segment_${this.id}_`)) {
                for_delete.push(child);
            }
        }
        for (let child of for_delete) {
            segments.removeChild(child);
        }
    }

    clear_nodes()
    {
        let for_delete = []
        for (let child of nodes.children) {
            if (child.getAttribute('id').startsWith(`node_${this.id}_`) || 
                child.getAttribute('id').startsWith(`clicknode_${this.id}_`)) {
                for_delete.push(child);
            }
        }
        for (let child of for_delete) {
            nodes.removeChild(child);
        }
    }

    clear_grid()
    {
        let for_delete = []
        for (let child of grid.children) {
            if (child.getAttribute('id').startsWith(`gridline_${this.id}_`)) {
                for_delete.push(child);
            }
        }
        for (let child of for_delete) {
            grid.removeChild(child);
        }
    }

    clear_table()
    {
        this.clear_segments();
        this.points = [this.start_point];
        this.onchange();
        this.update_score();
        this.update_colors();
    }

    f_click(j, i)
    {
        let last_x = this.points[this.lines_cnt()][0];
        let last_y = this.points[this.lines_cnt()][1];
        let len = this.lines_cnt();
        if (this.destroy_segments(j, i, destroyLinearAnimation)) {
            return;
        }
        for (let n = 1; n <= len; ++n) {
            if (segments_intersect(j, i, last_x, last_y,
                this.points[n - 1][0], this.points[n - 1][1], this.points[n][0], this.points[n][1])) {
                return;
            }
        }
        if ((i - last_y) ** 2 + (j - last_x) ** 2 - 5) {
            // alert('Distance should be ~' + Math.sqrt(5) + '!');
            return;
        }
        this.add_segment(j, i, drawLinearAnimation);
    }

    generate_table(x, y, start_point = [0, 0], end_point = [x - 1, y - 1])
    {
        this.start_point = [Math.min(start_point[0], x - 1), Math.min(start_point[1], y - 1)];
        this.end_point = [Math.min(end_point[0], x - 1), Math.min(end_point[1], y - 1)];
        this.points = [this.start_point];
        this.sizeX = x*1; this.sizeY = y*1;
        this.busy = false;
        let table = this;

        if (this.show_grid) {
            for (let i = 0; i < y; ++i) {
                let styleObject = {
                    top: `${i * this.sz + this.node_radius - this.grid_width/2 + this.background_border}px`,
                    left: `${this.node_radius - this.grid_width/2 + this.background_border}px`,
                    background: this.grid_color,
                    width: `${(this.sizeX - 1) * this.sz + this.grid_width}px`,
                    height: `${this.grid_width}px`,
                };
                let optObject = {
                    id: `gridline_${this.id}_y${i}`,
                    class: `grid`,
                };
                addElement(grid, 'div', styleObject, optObject);  
            }
            for (let j = 0; j < x; ++j) {
                let styleObject = {
                    left: `${j * this.sz + this.node_radius - this.grid_width/2 + this.background_border}px`,
                    top: `${this.node_radius - this.grid_width/2 + this.background_border}px`,
                    background: this.grid_color,
                    height: `${(this.sizeY - 1) * this.sz + this.grid_width}px`,
                    width: `${this.grid_width}px`,
                };
                let optObject = {
                    id: `gridline_${this.id}_x${j}`,
                    class: `grid`,
                };
                addElement(grid, 'div', styleObject, optObject);  
            }
        }

        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let styleObject = {
                    top: `${y_pos + this.background_border}px`,
                    left: `${x_pos + this.background_border}px`,
                    background: this.node_color,
                    width: `${(this.node_radius) * 2}px`,
                    height: `${(this.node_radius) * 2}px`,
                    border: `${this.node_border_radius}px solid ${this.node_border_color}`,
                };
                let optObject = {
                    id: `node_${this.id}_${i}_${j}`,
                    class: `node`,
                };
                addElement(nodes, 'div', styleObject, optObject);
            }
        }

        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let styleObject = {
                    top: `${y_pos - this.clickable_node_radius + this.node_radius + this.background_border}px`,
                    left: `${x_pos - this.clickable_node_radius + this.node_radius + this.background_border}px`,
                    background: 'transparent',
                    width: `${(this.clickable_node_radius) * 2}px`,
                    height: `${(this.clickable_node_radius) * 2}px`,
                };
                let optObject = {
                    id: `clicknode_${this.id}_${i}_${j}`,
                    class: `node`,
                };
                let node = addElement(nodes, 'div', styleObject, optObject);
                node.onmouseover = function () {
                    if (!table.busy) {
                        table.covered_node = [j, i];
                        table.update_colors();
                    }
                };
                node.onmouseout = function () {
                    table.covered_node = 0;
                    table.update_colors();
                };
            }
        }

        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                this.clicknode(i, j).onclick = function () {
                    if (!table.busy) {
                        table.f_click(j, i, table);
                    }
                };
            }
        }

        this.onchange();
        this.update_score();
        this.update_colors();
        this.node(this.start_point[1], this.start_point[0]).style.background = this.start_node_color;
        this.node(this.end_point[1], this.end_point[0]).style.background = this.end_node_color;
        this.update_background();
    }

    add_segment(x, y, animation_mode = drawNoAnimation) {
        let last_x = this.points[this.lines_cnt()][0];
        let last_y = this.points[this.lines_cnt()][1];
        animation_mode(this, last_x * this.sz, last_y * this.sz, x * this.sz, y * this.sz);
        this.points.push([x, y]);
        this.onchange();
        this.update_colors();
        this.update_score();
    }

    destroy_segments(x, y, animation_mode = destroyNoAnimation)
    {
        for (let n = 0; n < this.lines_cnt(); ++n) {
            if (x == this.points[n][0] && y == this.points[n][1]) {
                animation_mode(this, this.lines_cnt() - n);
                return true;
            }
        }
        this.update_score();
        this.update_colors();
        return false;
    }

    onchange()
    {
        let last_point = this.points[this.points.length - 1];
        if (this.end_point[0] == last_point[0] && this.end_point[1] == last_point[1]) {
            this.win = true;
        }
        else {
            this.win = false;
        }
        if (!this.win) {
            document.getElementById('submit_button').setAttribute('disabled', '');
            document.getElementById('submit_it').setAttribute('hidden', '');
        }
        else {
            document.getElementById('submit_button').removeAttribute('disabled');
            document.getElementById('submit_it').removeAttribute('hidden');
        }
        data.setAttribute('score', this.lines_cnt());
        data.setAttribute('points', JSON.stringify(this.points));
        data.setAttribute('field_size_x', this.sizeX);
        data.setAttribute('field_size_y', this.sizeY);
    }
}

let yura_styles = {
    node_color: 'transparent',
    used_node_color: 'rgba(50, 50, 255, 0.9)',
    delete_node_color: 'rgba(255, 110, 110, 0.9)',
    segment_color: 'black',
    start_node_color: 'black',
    segment_height: 5,
    delete_segment_color: 'rgba(255, 127, 127, 0.9)',
    show_grid: true,
    grid_color: '#ffc79b',
    grid_width: 4,
    node_radius: 7,
    node_border_radius: 4,
    node_border_color: 'transparent',
    used_node_border_color: 'black',
    used_node_color: 'white',
    clickable_node_radius: 20,
    background_color: '#fffefe',
    background_border: 10,
}

let Tbl = new Table(yura_styles);
Tbl.generate_table(7, 7, [3, 3], [4, 6]);
Tbl.resize(350, 350);
