const hr = document.getElementById('hour');
const mn = document.getElementById('minute');
const sc = document.getElementById('second');

function update(){
	const d = new Date();
	const s = d.getSeconds();
	const m = d.getMinutes();
	const h = d.getHours() % 12;

	const sec = s * 6;
	const min = m * 6 + s * 0.1;
	const hour = h * 30 + m * 0.5;

	hr.style.transform = `translateX(-50%) rotate(${hour}deg)`;
	mn.style.transform = `translateX(-50%) rotate(${min}deg)`;
	sc.style.transform = `translateX(-50%) rotate(${sec}deg)`;
}

update();
setInterval(update, 1000);

