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
		}	
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
		addAlbumToChart(a);
	});
	$("#albumsearch").bind("typeahead:autocompleted", function(e, a, b, c) {
		console.log(e, a, b, c);
	});
	$("#albumsearch").bind('keypress', function(e) {

	});
	var cvs = document.getElementById("cvs");
	dim = calcCanvasSize(sch_top50);
	cvs.width  = dim.width;
	cvs.height = dim.height;
	renderChartPlaceholder(cvs, sch_top50);
});

function getImage(album, size) {
	//try to degrade somewhat gracefully
	var t32  = album.thumb32;
	var t64  = album.thumb64  || t32;
	var t126 = album.thumb126 || t64;
	var t300 = album.thumb300 || t126;
	if (size <= 32)	 return t32;
	if (size <= 64)	 return t64;
	if (size <= 126) return t126;
	return t300;
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
