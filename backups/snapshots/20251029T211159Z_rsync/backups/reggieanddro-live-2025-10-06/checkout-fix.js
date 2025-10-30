<script>
	var viewportStyleEl = document.createElement('style');
	viewportStyleEl.appendChild(
		document.createTextNode(
			':root {' +
				'--vh: ' + window.innerHeight + ';' +
				'--vw: ' + window.innerWidth + ';' +
			'}'
		)
	);
	document.head.appendChild(viewportStyleEl);
</script>