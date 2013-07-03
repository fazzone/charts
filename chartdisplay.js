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
	margin_bottom: 40, //how much vertical space to add after each row
	margin_side: 20,   //how much horizontal space before the leftmost album img
	picpadding: 5,
	
	rows: [{
		name: "Top 4", //rendered as the header
		n_albums: 4,   //how many albums in the group
		picsize: 200,  //size of the picture (all pictures are square)
		picpadding: 20, //how much space to put between pictures
		placeholder_fill: "#1baf4d", //color of the rectangle drawn when no image is there
	}, {
		name: "Second-tier classics",
		n_albums: 16,
		albums_per_row: 8,  //defaults to take up the whole width, override for non-ragged rects
		picsize: 90,
		placeholder_fill: "#feca1f"
	}, {
		name: "Other favorites",
		n_albums: 30,
		albums_per_row: 10,
		picsize: 90,
		placeholder_fill: "#02a1e5"
	}]});

//a Renderer is an object with a renderCell function as such
r_placeholder = {
	renderCell: function(ctx, sch, x, y) {
		ctx.fillStyle = sch.placeholder_fill;
		ctx.fillRect(x, y, sch.picsize, sch.picsize);
	}
}

function cascade(obj, parent) {
	for (var v in obj) {
		if (obj.hasOwnProperty(v) && obj[v] !== obj.rows)
			for (var i=0; i<obj.rows.length; i++)
				if (obj.rows[i][v] == undefined)
					obj.rows[i][v] = obj[v];
	}
	return obj;
}

function calcAlbumsPerRow(canvas, r) {
	var v = canvas ? Math.floor((canvas.width - r.margin_side) / (r.picsize + r.picpadding)) : r.n_albums;
	if (r.albums_per_row)
		return Math.min(r.albums_per_row, v);
	return v;
}

function calcRowHeight(canvas, r) {
	if (r.n_albums == 0)
		return r.font_height + r.text_padding_top;
	return r.text_padding_top + r.margin_bottom + (r.picsize + r.picpadding) * Math.ceil(r.n_albums / calcAlbumsPerRow(canvas, r))
}

function calcCanvasSize(sch) {
	var maxW = 0, extentY = sch.text_padding_top;
	for (var i=0; i<sch.rows.length; i++) {
		var r = sch.rows[i];
		//got to subtract picpadding because we count it twice
		maxW = Math.max(maxW, 2*r.margin_side + (r.picsize + r.picpadding) * calcAlbumsPerRow(null, r) - r.picpadding);
		extentY += calcRowHeight(null, r);
	}
	console.log(maxW, extentY);
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
	for (var i=0; i<sch.rows.length; i++) {
		rowfunc(canvas, ctx, sch.rows[i], cRowY);
		cRowY += calcRowHeight(canvas, sch.rows[i]);
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
	var tsize = r.picsize + r.picpadding; //tile size
	var x = 0, y = 0;
	for (var i=0; i<r.n_albums; i++) {
 		renderer.renderCell(ctx, r, r.margin_side + x * tsize, base_y + y * tsize);

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
