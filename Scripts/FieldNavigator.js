let fieldNavigator = document.getElementById('field_navigator')
fieldNavigator.style.width = `${chainField.width}px`; 

function changeFieldSize(x, y, _this) {
	chainField.generate_table(x, y, [3, 3], [4, 6], cfKnightGame);
	chainField.tie_to_parent();
	console.log(_this)
}

console.log(document.querySelectorAll('#field_navigator button'))
for (let btn of document.querySelectorAll('#field_navigator button')) {
	btn.onclick = function() 
	{
		for (let other_btn of 
			document.querySelectorAll('#field_navigator button')) {
			other_btn.classList.add('not-active');
			other_btn.classList.remove('active');
		}

		changeFieldSize(
			btn.getAttribute('fieldsizex'), btn.getAttribute('fieldsizey'), 
			[3, 3], [4, 6], cfKnightGame);

		btn.classList.add('active');
		btn.classList.remove('not-active');

		fieldNavigator.style.width = `${chainField.width}px`; 

		update();
	}
}