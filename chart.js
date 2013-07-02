function lastSearchToDatums(res) {
	return $.map(res.results.albummatches.album, function(r) {
		return {
			value: r.name,
			artist: r.artist,
			tokens: (r.name + " " +r.artist).split(" "),
			thumb64: r.image[1]["#text"],
			thumb126: r.image[2]["#text"],
			thumb300: r.image[3]["#text"]
		}
	});
}

$(document).ready(function() {
	$("#albumsearch").typeahead([
		{
			name: 'album-search',
			remote: {
				url: "http://ws.audioscrobbler.com/2.0/?album=%QUERY&limit=5&method=album.search&api_key=0a828de6701971f3766542996b54c24b&format=json",
				cache: true,
				filter: lastSearchToDatums
			},
			template: "<img class=\"res-albumart\" src=\"{{thumb64}}\"><div class=\"res-text res-artistname\">{{artist}}</div> <div class=\"res-text res-albumname\">{{value}}</div>",
			engine: Hogan
		}	 
	]);
});
