let euclideaFieldStyle = {
	node_radius: 7,
	node_color: 'transparent',
    used_node_color: 'white',
    delete_node_color: 'rgba(255, 110, 110, 0.9)',
    start_node_color: 'black',

    node_border_radius: 4,
    node_border_color: 'transparent',
    used_node_border_color: 'black',

    clickable_node_radius: 20,

	segment_height: 5,
    segment_color: 'black',
    delete_segment_color: 'rgba(255, 127, 127, 0.9)',

    show_grid: true,
    grid_width: 4,
    grid_color: '#ffc79b',

    background_color: '#fffefe',
    background_border: 10,

    minGridStep: 30,
    maxGridStep: 50,
}

let chainField = new ChainField(euclideaFieldStyle);

chainField.onchange = function() {
	if (!this.win) {
        document.getElementById('submit_button').setAttribute('disabled', '');
        document.getElementById('submit_it').setAttribute('hidden', '');
    }	
    else {
        document.getElementById('submit_button').removeAttribute('disabled');
        document.getElementById('submit_it').removeAttribute('hidden');
    }
    data.setAttribute('score', this.lines_cnt);
    data.setAttribute('points', JSON.stringify(this.points));
    data.setAttribute('field_size_x', this.sizeX);
    data.setAttribute('field_size_y', this.sizeY);
}

chainField.generate_table(7, 7, [3, 3], [4, 6]);
chainField.tie_to_parent();
