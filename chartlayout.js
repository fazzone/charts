/*
The chart schema is a JSON object that will look (for example) sort of like this
Note that we sort of have the CSS analogue of Greenspun's Tenth Rule going on here
*/

sch_top50 = cascade({
	name: "Top 50",
	font: "26px Sans",
	font_height: 26, //estimate
	text_padding_bottom: 10, //how much vertical space to put between the label text and first row
	text_padding_left: 40, //how much horiz. space between the label and x=0
	text_padding_top: 24,
	text_fill: "white",
	bg_fill: "rgb(36, 36, 36)",
	margin_bottom: 40, //how much vertical space to add after each section
	margin_side: 20,   //how much horizontal space before the leftmost album img
	picpadding_horiz: 5,
	picpadding_vert: 5,
	caption: "none", //where to put the album-name captions (inline, right, none)
	caption_font: "10px Sans",
	caption_fill: "white",
	caption_font_height: 10,
	caption_vert_padding: 2, //how much space to put in between the two lines 
	
	
	sections: [{
		name: "3x3", //rendered as the header
		n_albums: 9,   //how many albums in the group
		albums_per_row: 3,

		//note that you are defining TILE size, not PICTURE size.  They are different when
		//caption: inline is used.  In order to use caption: inline and get the art size
		//that you want (X), you must use a tilesize of X + inset, where inset is
		//2*caption_font_height + caption_vert_padding (see renderCell)
		tilesize: 326,  //size of the TILE
		picpadding_horiz: 4, //how much horiz. space to put between pictures
		picpadding_vert: 16, //how much vert. space to put between rows in this section
		placeholder_fill: "#1baf4d", //color of the rectangle drawn when no image is there
		caption: "inline", //with caption: inline it's a good idea to set picpadding_horiz to 0
		caption_font: "12px Sans",
		caption_font_height: 12
	}/* , {
		name: "Second-tier classics",
		n_albums: 16,
		albums_per_row: 8,  //defaults to take up the whole width, override for non-ragged rects
		tilesize: 90,
		placeholder_fill: "#feca1f"
	}, {
		name: "Other favorites",
		n_albums: 30,
		albums_per_row: 10,
		tilesize: 90,
		placeholder_fill: "#02a1e5"
	}*/
]});

function cascade(obj, parent) {
	for (var v in obj) 
		if (obj.hasOwnProperty(v) && obj[v] !== obj.sections)
			for (var i=0; i<obj.sections.length; i++)
				if (obj.sections[i][v] == undefined)
					obj.sections[i][v] = obj[v];
	return obj;
}


//The job of this module is to handle the chart config object and lay out the chart accordingly. What
//"laying out the chart" means is calling a provided render object with the proper RenderContext
//for each album-art tile.  A RenderContext has a canvas context, a row def object, a region-x, a region-y,
//a canvas-x and a canvas-y.  region-* is in units of album-tiles, canvas-* are coords of the actual
//rect
function RenderContext(ctx, sect, rx, ry, cx, cy) {
	this.ctx = ctx;
	this.sect = sect;
	this.rx = rx;
	this.ry = ry;
	this.cx = cx;
	this.cy = cy;
}

//a Renderer is an object with a renderCell function as such
r_placeholder = {
	
	renderCell: function(rc) {
		rc.ctx.textAlign = "center";
		rc.ctx.strokeStyle = "white";
		//rc.ctx.strokeRect(rc.cx, rc.cy, rc.sect.tilesize, rc.sect.tilesize);
		
		var i = rc.ry*3 + rc.rx%3;
		
		if (rc.sect.caption == "inline") {
			var inset = 2 * rc.sect.caption_font_height + rc.sect.caption_vert_padding;
			var artx = rc.cx + inset/2, arty = rc.cy;
			var artwidth = rc.sect.tilesize - inset, artheight = artwidth;

			this.drawLabeledRect(rc.ctx, rc.sect, artx, arty, rc.rx, rc.ry, artwidth);
			rc.ctx.fillStyle = "white";
			
			var tbase = arty + artheight + rc.sect.caption_font_height;
			var tx = artx + artwidth/2;
			rc.ctx.fillText(sampleAlbums[i].artist, tx, tbase);
			rc.ctx.fillText(sampleAlbums[i].value, tx, tbase + rc.sect.caption_font_height + rc.sect.caption_vert_padding);
		} else {
			this.drawLabeledRect(rc.ctx, rc.sect, rc.cx, rc.cy, rc.rx, rc.ry, rc.sect.tilesize);
		}
		rc.ctx.textAlign = "start";
	},
	drawLabeledRect: function(ctx, sect, cx, cy, rx, ry, size) {
		var im = getImageURL(sampleAlbums[ry*3 + rx%3], size);

		ctx.fillStyle = sect.placeholder_fill;
		ctx.fillRect(cx, cy, size, size);
		var s  = size+"x"+size;
		ctx.font = sect.caption_font;
		ctx.fillStyle = sect.caption_fill;
		ctx.fillText(s, cx + size / 2, cy + size / 2);

		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, cx, cy, size, size);
		}
		img.src = im;
	},
	drawImage: function(ctx, sect, cx, cy, rx, ry, size) {
		
	}
};

function calcAlbumsPerRow(canvas, r) {
	var v = canvas ? Math.floor((canvas.width - r.margin_side) / (r.tilesize + r.picpadding_horiz)) : r.n_albums;
	if (r.albums_per_row)
		return Math.min(r.albums_per_row, v);
	return v;
}

function calcRowHeight(canvas, r) {
	if (r.n_albums == 0)
		return r.font_height + r.text_padding_top;
	var n = Math.ceil(r.n_albums / calcAlbumsPerRow(canvas, r));
	return r.text_padding_top + r.margin_bottom + r.tilesize * n + r.picpadding_vert * (n-1);
}

function calcCanvasSize(sch) {
	var maxW = 0, extentY = sch.text_padding_top;
	for (var i=0; i<sch.sections.length; i++) {
		var r = sch.sections[i];
		//got to subtract picpadding_horiz because we count it twice
		maxW = Math.max(maxW, 2*r.margin_side + (r.tilesize + r.picpadding_horiz) * calcAlbumsPerRow(null, r) - r.picpadding_horiz);
		extentY += calcRowHeight(null, r);
	}
	return {
		width: maxW,
		height: extentY
	};
}

function renderChartPlaceholder(canvas, sch) {
	g_renderChart(canvas, sch, renderRowPlaceholder);
}

function g_renderChart(canvas, sch, rowfunc) {
	var ctx = canvas.getContext("2d");

	ctx.fillStyle = sch.bg_fill;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var cRowY = sch.text_padding_top;
	for (var i=0; i<sch.sections.length; i++) {
		rowfunc(canvas, ctx, sch.sections[i], cRowY);
		cRowY += calcRowHeight(canvas, sch.sections[i]);
	}		
}

function g_renderRow(canvas, ctx, renderer, r, base_y) {
	base_y += r.text_padding_top;

	ctx.fillStyle = r.text_fill;
	ctx.font = r.font;
	ctx.fillText(r.name, r.text_padding_left, base_y);
	
	base_y += r.text_padding_bottom;
	ctx.fillStyle = r.placeholder_fill;
	
	var apr = calcAlbumsPerRow(canvas, r);
	
	//var tsize = r.tilesize + r.picpadding_horiz;
	var twidth  = r.tilesize + r.picpadding_horiz;
	var theight = r.tilesize + r.picpadding_vert
	var x = 0, y = 0;
	for (var i=0; i<r.n_albums; i++) {
		renderer.renderCell(new RenderContext(ctx, r, x, y, r.margin_side + x * twidth, base_y + y * theight));
		x++;
		if (x >= apr) {
			y++;
			x = 0;
		}		
	}
}

function renderRowPlaceholder(canvas, ctx, r, base_y) {
	g_renderRow(canvas, ctx, r_placeholder, r, base_y);
}
