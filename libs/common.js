export function hashString(str) {
	var hash = 0,
		i,
		chr
	if (str.length === 0) return hash
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return Math.abs(hash)
}

export function insertStyle(css, id) {
	if (document.querySelector(`#${id}`)) {
		return
	}
	const head = document.head
	const style = document.createElement('style')

	if (id) {
		style.id = id
	}

	head.appendChild(style)
	style.type = 'text/css'
	style.appendChild(document.createTextNode(css))
}
