selectedAlbums = [];

function lastSearchToDatums(res) {
	function alb2dat(r) {
		return {
			value: r.name,
			artist: r.artist,
			tokens: (r.name + " " +r.artist).split(" "),
			thumb32: r.image[0]["#text"],
			thumb64: r.image[1]["#text"],
			thumb126: r.image[2]["#text"],
			thumb300: r.image[3]["#text"]
		};
	}

	if (res.results.albummatches.album == undefined)
		return [{value: "No results for search"}];
	if (res.results.albummatches.album.length)
		return $.map(res.results.albummatches.album, alb2dat);
	return [alb2dat(res.results.albummatches.album)];
}

function albumSearchURL(query, N) {
	return "http://ws.audioscrobbler.com/2.0/?album=" + encodeURIComponent(query) + "&limit=" + N + "&method=album.search&api_key=0a828de6701971f3766542996b54c24b&format=json";
}

$(document).ready(function() {
	$("#albumsearch").typeahead([
		{
			name: 'album-search',
			remote: {
				url: albumSearchURL("QUERY", 5),
				wildcard: "QUERY", //no percent because we have to urlencode it which removes the percent...
				cache: true,
				filter: lastSearchToDatums
			},
			template: "<img width=\"64\" height=\"64\" class=\"res-albumart\" src=\"{{thumb64}}\">"
				+"<div class=\"res-text res-artistname\">{{artist}}</div> "
				+"<div class=\"res-text res-albumname\">{{value}}</div>",
			engine: Hogan
		}	 
	]);
	
	$("#albumsearch").bind('typeahead:selected', function(e, a) {
		//addAlbumToChart(a);
		selectedAlbums.push(a);
	});
	$("#albumsearch").bind("typeahead:autocompleted", function(e, a, b, c) {
		console.log(e, a, b, c);
	});
	$("#albumsearch").bind('keypress', function(e) {

	});
	$("#cvs").click(function(e) {
		var mpos = relMouseCoords(e);
		console.log("canvas click", mpos);
	});
	var cvs = document.getElementById("cvs");
	dim = calcCanvasSize(sch_top50);
	cvs.width  = dim.width;
	cvs.height = dim.height;
	renderChartPlaceholder(cvs, sch_top50);
});

//thank you: http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element1
function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = event.target;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

function getImageURL(album, size) {
	//try to degrade somewhat gracefully
	var t32  = album.thumb32;
	var t64  = album.thumb64  || t32;
	var t126 = album.thumb126 || t64;
	var t300 = album.thumb300 || t126;
	var ret = t300;
	if (size <= 32)          ret = t32;
	else if (size <= 64)	 ret = t64;
	else if (size <= 126)    ret = t126;
	console.log(size, "->", ret);
	return ret.replace("userserve-ak.last.fm", "occident");
}

function addAlbumToChart(album) {
	var img = new Image();
	img.onload = function() {
		ctx.drawImage(img, cax, cay);
		cax += (img.width + 10);
		if (cax + img.width > canvas.width) {
			cax = 0;
			cay += (img.height + 10);
		}			
	};
	img.src = album.thumb300.replace("userserve-ak.last.fm", "occident");
	console.log(img.src);
}




















