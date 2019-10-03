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
        styleText += ' ' + prop + ': ' + style[prop] + ';'
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
        this.onwin = function(table) {table.clear_table();}

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

        let table = this;
        this.draw_segment_animations = {
            no_animation: function (x1, y1, x2, y2) // real coordinates 
            {
                let xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
                let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height;
                let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                addElement(segments, 'div',
                    {
                        background: table.segment_color,
                        transform: `rotate(${ang}deg)`,
                        width: `${len}px`,
                        height: `${table.segment_height}px`,
                        top: `${yc + table.node_radius - table.segment_height / 2}px`,
                        left: `${xc - len / 2 + table.node_radius}px`,
                        'border-radius': `${table.segment_height / 2}px`
                    },
                    {
                        id: `segment_${table.id}_${table.lines_cnt()}`,
                        class: `segment`
                    });
            },
            linear_animation: function (x1, y1, x2, y2) {
                table.busy = true;
                let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                let segment = addElement(segments, 'div',
                    {
                        background: table.segment_color,
                        transform: 'rotate(' + ang + 'deg)',
                        height: `${table.segment_height}px`,
                        'border-radius': `${table.segment_height / 2}px`
                    }, {
                    id: 'segment_' + table.id + '_' + table.lines_cnt(),
                    class: 'segment'
                });

                function timer(t) {
                    if (t >= 1.05) {
                        table.busy = false;
                        return;
                    }
                    setTimeout(() => timer(t + 0.1), 20);
                    let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
                    let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
                    segment.style.width = len + 'px';
                    segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
                    segment.style.left = (xc - len / 2 + table.node_radius) + 'px';
                }
                timer(0);
            },
            lesha_animation: function (x1, y1, x2, y2) {
                table.busy = true;
                let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                let segment = addElement(segments, 'div',
                    {
                        background: table.segment_color,
                        transform: 'rotate(' + ang + 'deg)',
                        height: table.segment_height
                    }, {
                    id: 'segment_' + table.id + '_' + table.lines_cnt(),
                    class: 'segment'
                });

                function timer(t) {
                    if (t >= 1.05) {
                        table.busy = false;
                        return;
                    }
                    setTimeout(() => timer(t + 0.05), 10);
                    let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
                    let len1 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * 1;
                    let len2 = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
                    segment.style.width = len2 + 'px';
                    segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
                    segment.style.left = (xc - len1 / 2 + table.node_radius) + 'px';
                }
                timer(0);
            }
        };

        this.destroy_segment_animation = {
            no_animation: function (N) {
                segments.removeChild(table.segment(table.lines_cnt() - 1));
                table.update_score();
                table.update_colors();
                if (N > 1) { table.destroy_segment_animation.no_animation(N - 1); }
            },
            linear_animation: function (N, past = 0) {
                table.busy = true;
                let segment = table.segment((table.lines_cnt() - 1));
                let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
                let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;

                function timer(t) {
                    if (t == 1) {
                        table.points.pop();
                        table.update_colors();
                    } 
                    if (t <= 0) {
                        segments.removeChild(table.segment(table.lines_cnt()));
                        table.update_score();
                        table.update_colors();
                        if (N > 1) {
                            table.destroy_segment_animation.linear_animation(N - 1, past + 1);
                        } else {
                            table.busy = false;
                        }
                        return;
                    }
                    setTimeout(() => timer(t - 0.1 * (1 + Math.min(N - t, past + t))), 20);
                    let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
                    let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.segment_height) * t;
                    segment.style.width = len + 'px';
                    segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
                    segment.style.left = (xc - len / 2 + table.node_radius) + 'px';
                }
                timer(1);
            },
            lesha_animation: function (N, past = 0) {
                table.busy = true;
                let segment = table.segment((table.lines_cnt() - 1));
                let x2 = table.points[table.lines_cnt()][0] * table.sz, y2 = table.points[table.lines_cnt()][1] * table.sz;
                let x1 = table.points[table.lines_cnt() - 1][0] * table.sz, y1 = table.points[table.lines_cnt() - 1][1] * table.sz;

                function timer(t) {
                    if (t <= 0) {
                        segments.removeChild(table.segment(table.lines_cnt() - 1));
                        table.points.pop();
                        table.update_score();
                        this.update_colors();
                        if (N > 1) {
                            table.destroy_segment_animation.lesha_animation(N - 1, past + 1);
                        } else {
                            table.busy = false;
                        }
                        return;
                    }
                    setTimeout(() => timer(t - 0.05 * (1 + Math.min(N - t, past + t))), 10);
                    let xc = x1 * (1 - t) + ((x1 + x2) / 2) * t, yc = y1 * (1 - t) + ((y1 + y2) / 2) * t;
                    let len = (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + table.width) * t;
                    segment.style.top = yc + table.node_radius - table.segment_height / 2 + 'px';
                    segment.style.width = len + 'px';
                }
                timer(1);
            },

        };
    }

    make_busy() {
        this.busy = true;
    }

    not_busy() {
        this.busy = false;
    }

    segment(n) {
        return document.getElementById('segment_' + this.id + '_' + n);
    }

    node(x, y) {
        return document.getElementById('node_' + this.id + '_' + x + '_' + y);
    }

    clicknode(x, y) {
        return document.getElementById('clicknode_' + this.id + '_' + x + '_' + y);
    }

    gridline(dir, x) {
        return document.getElementById('gridline_' + this.id + '_' + dir + x);
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
                if (n == -1) {
                    this.node(y, x).style.background = this.hover_node_color;
                } else {
                    n++;
                    this.node(y, x).style.background = this.first_delete_node_color;
                    for (; n < this.points.length; n++) {
                        this.node(this.points[n][1], this.points[n][0]).style.background = this.delete_node_color;
                        this.segment(n - 1).style.background = this.delete_segment_color;
                    }
                }
            }
        }
        if (this.start_point) { this.node(this.start_point[1], this.start_point[0]).style.background = this.start_node_color };
        if (this.end_point) { this.node(this.end_point[1], this.end_point[0]).style.background = this.end_node_color };
    }

    update_positions () {
        for (let i = 0; i < this.sizeY; ++i) {
            for (let j = 0; j < this.sizeX; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                setStyles(this.node(i, j),
                    {
                        top: `${y_pos}px`,
                        left: `${x_pos}px`
                    });
            }
        }
        for (let i = 0; i < this.sizeY; ++i) {
            for (let j = 0; j < this.sizeX; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                setStyles(this.clicknode(i, j),
                    {
                        top: `${y_pos - this.clickable_node_radius + this.node_radius}px`,
                        left: `${x_pos - this.clickable_node_radius + this.node_radius}px`
                    });
            }
        }
        for (let n = 0; n < this.lines_cnt(); ++n) {
            let x1 = this.points[n][0]*this.sz, y1 = this.points[n][1]*this.sz;
            let x2 = this.points[n + 1][0]*this.sz, y2 = this.points[n + 1][1]*this.sz; 
            let xc = (x1 + x2) / 2, yc = (y1 + y2) / 2;
            let len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) + this.segment_height;
            let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            setStyles(this.segment(n),
                {
                    transform: `rotate(${ang}deg)`,
                    width: `${len}px`,
                    height: `${this.segment_height}px`,
                    top: `${yc + this.node_radius - this.segment_height / 2}px`,
                    left: `${xc - len / 2 + this.node_radius}px`,
                });
        }
        if (this.show_grid) {
            for (let i = 0; i < this.sizeY; ++i) {
                setStyles(this.gridline('y', i),
                {
                    top: `${i * this.sz + this.node_radius - this.grid_width/2}px`,
                    left: `${this.node_radius - this.grid_width/2}px`,
                    width: `${(this.sizeX - 1) * this.sz + this.grid_width}px`,
                    height: `${this.grid_width}px`
                })  
            }
            for (let j = 0; j < this.sizeX; ++j) {
                setStyles(this.gridline('x', j), 
                {
                    left: `${j * this.sz + this.node_radius - this.grid_width/2}px`,
                    top: `${this.node_radius - this.grid_width/2}px`,
                    height: `${(this.sizeY - 1) * this.sz + this.grid_width}px`,
                    width: `${this.grid_width}px`
                })  
            }
        }
    }

    update_background() {
        field.style.width = `${this.sz * (this.sizeX - 1) + this.node_radius * 2}px`;
        field.style.height = `${this.sz * (this.sizeY - 1) + this.node_radius * 2}px`;
        field.style.background = this.background_color;
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

    clear_table()
    {
        let for_delete = [];
        for (let child of segments.children) {
            if (child.getAttribute('id').startsWith('segment_' + this.id + '_')) {
                for_delete.push(child)
            }
        }
        for (let child of for_delete) {
            segments.removeChild(child);
        }
        this.points = [this.start_point];
        this.update_score();
        this.update_colors();
    }

    delete_table()
    {
        this.clear_table();
        let for_delete = []
        for (let child of nodes.children) {
            if (child.getAttribute('id').startsWith('node_' + this.id + '_')) {
                for_delete.push(child)
            }
        }
        for (let child of for_delete) {
            nodes.removeChild(child);
        }

    }

    generate_table(x, y, f_click = f_click_1, start_point = [0, 0], end_point = [x - 1, y - 1])
    {
        let for_delete = [];
        for (let child of segments.children) {
            if (child.getAttribute('id').startsWith('segment_' + this.id + '_')) {
                for_delete.push(child)
            }
        }
        for (let child of for_delete) {
            segments.removeChild(child);
        }
        for_delete = []
        for (let child of nodes.children) {
            if (child.getAttribute('id').startsWith('node_' + this.id + '_') || 
                child.getAttribute('id').startsWith('clicknode_' + this.id + '_')) {
                for_delete.push(child)
            }
        }
        for (let child of for_delete) {
            nodes.removeChild(child);
        }
        for_delete = []
        for (let child of grid.children) {
            if (child.getAttribute('id').startsWith('gridline_' + this.id + '_')) {
                for_delete.push(child)
            }
        }
        for (let child of for_delete) {
            grid.removeChild(child);
        }

        this.start_point = [Math.min(start_point[0], x - 1), Math.min(start_point[1], y - 1)];
        this.end_point = [Math.min(end_point[0], x - 1), Math.min(end_point[1], y - 1)];
        this.points = [this.start_point];
        this.sizeX = x*1; this.sizeY = y*1;

        this.busy = false;

        if (this.show_grid) {
            for (let i = 0; i < y; ++i) {
                addElement(grid, 'div', 
                {
                    top: `${i * this.sz + this.node_radius - this.grid_width/2}px`,
                    left: `${this.node_radius - this.grid_width/2}px`,
                    background: this.grid_color,
                    width: `${(this.sizeX - 1) * this.sz + this.grid_width}px`,
                    height: `${this.grid_width}px`
                }, {
                    id: `gridline_${this.id}_y${i}`,
                    class: 'grid'
                })  
            }
            for (let j = 0; j < x; ++j) {
                addElement(grid, 'div', 
                {
                    left: `${j * this.sz + this.node_radius - this.grid_width/2}px`,
                    top: `${this.node_radius - this.grid_width/2}px`,
                    background: this.grid_color,
                    height: `${(this.sizeY - 1) * this.sz + this.grid_width}px`,
                    width: `${this.grid_width}px`
                }, {
                    id: `gridline_${this.id}_x${j}`,
                    class: 'grid'
                })  
            }
        }


        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let node = addElement(nodes, 'div',
                    {
                        top: `${y_pos}px`,
                        left: `${x_pos}px`,
                        background: this.node_color,
                        width: `${(this.node_radius) * 2}px`,
                        height: `${(this.node_radius) * 2}px`,
                        border: `${this.node_border_radius}px solid ${this.node_border_color}`
                    }, {
                        id: `node_${this.id}_${i}_${j}`,
                        class: 'node'
                    });
            }
        }
        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                let y_pos = i * this.sz, x_pos = j * this.sz;
                let node = addElement(nodes, 'div',
                    {
                        top: `${y_pos - this.clickable_node_radius + this.node_radius}px`,
                        left: `${x_pos - this.clickable_node_radius + this.node_radius}px`,
                        background: 'transparent',
                        width: `${(this.clickable_node_radius) * 2}px`,
                        height: `${(this.clickable_node_radius) * 2}px`,
                    }, {
                        id: `clicknode_${this.id}_${i}_${j}`,
                        class: 'node'
                    });
                let table = this;
                node.onmouseover = function () {
                    if (!table.busy) {
                        table.covered_node = [j, i];
                        table.update_colors();
                    }
                };
                node.onmouseout = function () { table.covered_node = 0; table.update_colors() };
                // nodes.innerHTML += '<div id="node_' + i + '_' + j + '" class="node" style="top: ' + y_pos + 'px; left: ' + x_pos + 'px"></div>';
            }
        }
        for (let i = 0; i < y; ++i) {
            for (let j = 0; j < x; ++j) {
                let table = this;
                this.clicknode(i, j).onclick = function () { if (!table.busy) f_click(j, i, table) };
            }
        }
        this.node(this.start_point[1], this.start_point[0]).style.background = this.start_node_color;
        this.node(this.end_point[1], this.end_point[0]).style.background = this.end_node_color;
        this.update_background();
    }

    add_segment(x, y, animation_mode = this.draw_segment_animations.no_animation) {
    	if (!this.win) {
	        let last_x = this.points[this.lines_cnt()][0];
	        let last_y = this.points[this.lines_cnt()][1];
	        animation_mode(last_x * this.sz, last_y * this.sz, x * this.sz, y * this.sz);
	        this.points.push([x, y]);
	        this.update_colors();
	        this.update_score();
	        if (this.end_point[0] == x && this.end_point[1] == y) {
	        	this.onwin(this);
	        }
	    }

    }

    destroy_segments(x, y, animation_mode = this.destroy_segment_animation.no_animation)
    {
    	if (!this.win) {
	        for (let n = 0; n < this.lines_cnt(); ++n) {
	            if (x == this.points[n][0] && y == this.points[n][1]) {
	                animation_mode(this.lines_cnt() - n);
	                return true;
	            }
	        }
	        this.update_score();
	        this.update_colors();
	        return false;
	    }
    }
}

function f_click_1(j, i, table)
{
    let last_x = table.points[table.lines_cnt()][0];
    let last_y = table.points[table.lines_cnt()][1];
    len = table.lines_cnt();

    if (table.destroy_segments(j, i, table.destroy_segment_animation.linear_animation)) { return; }

    for (let n = 1; n <= len; ++n) {
        if (segments_intersect(j, i, last_x, last_y, table.points[n - 1][0], table.points[n - 1][1], table.points[n][0], table.points[n][1])) {
            // alert('Intersection!!');
            return;
        }
    }

    if ((i - last_y) ** 2 + (j - last_x) ** 2 - 5) {
        // alert('Distance should be ~' + Math.sqrt(5) + '!');
        return;
    }

    table.add_segment(j, i, table.draw_segment_animations.linear_animation);

    table.onwin = function(table) {
    	data.setAttribute('score', table.lines_cnt());
    	data.setAttribute('points', JSON.stringify(table.points));
    	submit_score.innerHTML = table.lines_cnt();
    	setTimeout(function() {
    		alert('Your score '+table.lines_cnt());
    		table.clear_table();
    		table.win = false;
    	}, 300)
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
    background_color: '#fffefe'
}

let Tbl = new Table(
    yura_styles
);

Tbl.generate_table(6, 6, f_click_1, [2, 2], [4, 5]);
Tbl.resize(315, 315);
