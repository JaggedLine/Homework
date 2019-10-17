let fieldNavigator = document.getElementById('field_navigator')
fieldNavigator.style.width = `${chainField.width}px`; 

function changeFieldSize(x, y) {
	chainField.generate_table(x, y, [3, 3], [4, 6], cfKnightGame);
}

for (let btn of document.querySelectorAll('#field_navigator button')) {
	btn.onclick = function() 
	{
		for (let other_btn of 
			document.querySelectorAll('#field_navigator button')) {
			// other_btn.classList.add('not-active');
			other_btn.classList.remove('active');
		}

		let sizeX = btn.getAttribute('fieldsizex');
		let sizeY = btn.getAttribute('fieldsizey');
		changeFieldSize(sizeX, sizeY);

		btn.classList.add('active');
		// btn.classList.remove('not-active');

		fieldNavigator.style.width = `${chainField.width}px`; 
		document.getElementById('fieldSize').innerText = `${sizeX}x${sizeY}`
		update();
	}
}