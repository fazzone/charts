//model-ish for top-N charts

//the album object we have currently selected in the Typeahead thingy, or null if this is invalid
//(invalid meaning we have to 
currentSelectedAlbum = null;

function lastSearchToDatums(res) {
	function alb2dat(r) {
		return {
			value: r.name,
			artist: r.artist,
			tokens: (r.name + " " +r.artist).split(" "),
			thumb64: r.image[1]["#text"],
			thumb126: r.image[2]["#text"],
			thumb300: r.image[3]["#text"]
		}	
	}
	if (res.results.albummatches.album.length)
		return $.map(res.results.albummatches.album, alb2dat);
	else return [alb2dat(res.results.albummatches.album)];
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
		console.log(e);
		addAlbumToChart(a);
	});
	$("#albumsearch").bind("typeahead:autocompleted", function(e, a, b, c) {
		console.log(e, a, b, c);
	});
	$("#albumsearch").bind('keypress', function(e) {

	});
});

function addAlbumToChart(album) {
	if (window.cax == undefined) {
		window.cax = window.cay = 0;
	}
	var ctx = document.getElementById("cvs").getContext("2d");
	var img = new Image();
	img.onload = function() {
		ctx.drawImage(img, cax, cay);
		cax += (img.width + 10);
		if (cax > 500) {
			cax = 0;
			cay += (img.height + 10);
		}			
	};
	img.src = album.thumb126.replace("userserve-ak.last.fm", "occident");
	console.log(img.src);
}
