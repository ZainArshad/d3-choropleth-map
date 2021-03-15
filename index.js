 $(document).ready(function(){

 	let games = [];
	 let countries = [];
	 let no_of_users = [];
	 let option;
	 let m1=10,m3=0;
 	d3.csv("ratings-by-country.csv").then(function(data){

		data.map(function(row, index) {
			if(games.indexOf(row['Game']) === -1)
				games.push(row['Game']);

				if(countries.indexOf(row['Country'])===-1)
				{
					countries.push(row['Country']);
					no_of_users.push(row['Country']);
				}
		});

		d3.select("#menus")
		.selectAll('myOptions')
		 .data(games)
		.enter()
		.append('option')
		.text(function (d) { return d; }) 
		.attr("value", function (d) { return d; });
		option=games[0];

		let res = countries.reduce((acc,curr)=> (acc[curr]=0,acc),{});
		const no_of_use = no_of_users.reduce((acc,curr)=> (acc[curr]=0,acc),{});

 		choroplethchart(data);

		function choroplethchart(data){

			data.map(function(row, index) {
				if(row['Game'] === option)
				{
					res[row['Country']]=row['Average Rating'];
					if(m3<parseFloat(row['Average Rating']))
					{
						m3 = parseFloat(row['Average Rating']);
					}

					if(m1>parseFloat(row['Average Rating']))
					{
						m1 = parseFloat(row['Average Rating']);
					}
					
					no_of_use[row['Country']]=row['Number of Users'];
				}
			});

			 d3.select("#menus")
    .on("change", gameselect);

				function gameselect() {
					res = [];
					 option = document.getElementById('menus').value;
					console.log('option',option);
				
				data.map(function(row, index) {
					if(row['Game'] === option)
					{
						res[row['Country']]=row['Average Rating'];
						if(m3<parseFloat(row['Average Rating']))
						{
							m3 = parseFloat(row['Average Rating']);
						}

						if(m1>parseFloat(row['Average Rating']))
						{
							m1 = parseFloat(row['Average Rating']);
						}
						
						no_of_use[row['Country']]=row['Number of Users'];
					}
				});

				tooltipadded(res,option);
				mapintensitychange(res);
				temp = [];
			}

			var active = d3.select(null);

			var choropleth = d3.select("#choropleth")
			.append("svg")
			.attr("class", "choropleth")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("padding-right", '0px');

			// Width and height of the whole visualization
			var cp_width = $("#choropleth").width(),
			cp_height = $("#choropleth").height();

			// Create legend SVG
			var choropleth_legend = d3.select("#choropleth_legend")
			.append("svg")
			.attr("class", "choropleth_legend")
			.attr("width", 150)
			.attr("height", cp_height);

			// Set projection parameters
			var projection = d3.geoMercator()
			.scale(1)
			.translate([1, 0]); // width issue

			// Create geopath
			var path = d3.geoPath()
			.projection(projection);

			var cp_div = d3.select("#jason").append("div")
			.attr("id", "tooltip")
			.style("opacity", 0);

			choropleth.append("rect")
			.attr("class", "background")
			.attr("width", cp_width)
			.attr("height", cp_height);

			var g = choropleth.append("g");

	        // loading bar
	        d3.select('div#slider-range')
	        .transition().delay(1000).duration(500)
	        .style("opacity", 1);

	       	// choropleth --------------------------------------------------------------------------------------------------------------------------------------------------------

	        // Read Global map
	        d3.json("world_countries.json").then(function(map) {
	        	var bounds = path.bounds(map);
	        	var s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / cp_width, (bounds[1][1] - bounds[0][1]) / cp_height);
	        	var t = [(cp_width - s * (bounds[1][0] + bounds[0][0])) / 2, (cp_height - s * (bounds[1][1] + bounds[0][1])) / 2];
	        	projection
	        	.scale(s)
	        	.translate(t);

	        	d3.select("g")
	        	.attr("class", "tracts")
	        	.selectAll("path")
	        	.data(map.features)
	        	.enter()
	        	.append('path')
	        	.attr("d", path)
	        	//.on("click", clicked)
	        	.attr("stroke", "white")
	        	.attr("stroke-width", 0.5)
	        	.attr("fill", "white")
	        	.attr("fill-opacity", 0.7);

		       	// pre processing
		       	

		        // add and update mouse over tooltip div
		        tooltipadded(res,option);
		        
		        // add and update map color intensity for number of attacks
		        mapintensitychange(res);

		    })

			      function tooltipadded(map_data,option){
					  
					  
			      	choropleth.selectAll("path")
			      	.on("mouseover", function(d) {
			      		d3.select(this)
			      		.style("fill-opacity", 1);
			      		cp_div.transition().duration(300)
			      		.style("opacity", 1);
			      		cp_div.html(`<span style="font-size:20px;font-weight:bold">Country: ${d.properties.name}<br></span><span style="font-size:20px;font-weight:bold">Game: ${option}<br></span><span style="font-size:20px;">Average Rating: ${map_data[d.properties.name]===undefined || map_data[d.properties.name]===0?'N/A':map_data[d.properties.name]}<br></span><span style="font-size:20px;">Number of users: ${no_of_use[d.properties.name]===undefined || no_of_use[d.properties.name]===0?'N/A':no_of_use[d.properties.name]}<br></span>`).style("visibility", "visible")
			      		.style("left", (d3.event.pageX) + "px")
			      		.style("top", (d3.event.pageY -30) + "px");
			      	})
			      	.on("mouseout", function() {
			      		d3.select(this)
			      		.style("fill-opacity", 0.7);
			      		cp_div.style("visibility", "none").transition().duration(300)
			      		.style("opacity", 0);
			      	});
			      }

			function mapintensitychange(map_data){ // update legends together too

				let m2 = (m1+m3)/2;
				let diff = (m3-m1)/4;

				let m4 = m1+diff;
				let m5= m4+diff;
				let m6 = m5+diff;
				let m7= m6+diff;

				var cp_color = d3.scaleQuantile()
				.range(["grey", "#f58e6c", "#f77d54",'#f55b27','#c23404'])
				.domain([0,1,2,3,4]);


	            // set color
	            choropleth.selectAll('path')
	            .transition().duration(500)
	            .attr("fill", function(d) {
	            	if(parseFloat(map_data[d.properties.name])>=m1 && parseFloat(map_data[d.properties.name])<m4){
	            		return cp_color(1);
	            	}
					else if(parseFloat(map_data[d.properties.name])>=m4 && parseFloat(map_data[d.properties.name])<m5){
	            		return cp_color(2);
	            	}
					else if(parseFloat(map_data[d.properties.name])>=m5 && parseFloat(map_data[d.properties.name])<m6){
	            		return cp_color(3);
	            	}
					else if(parseFloat(map_data[d.properties.name])>=m6 && parseFloat(map_data[d.properties.name])<=m7){
	            		return cp_color(4);
	            	}
	            	else{
	            		return cp_color(0);
	            	}
	            });

	        	// color legend
	        	var legend_labels = [];
	        	var ext_color_domain = [];
	        	ext_color_domain.push(0);


				ext_color_domain.push(cp_color(1));
				ext_color_domain.push(cp_color(2));
				ext_color_domain.push(cp_color(3));
				ext_color_domain.push(cp_color(4));

				legend_labels.push(`${Math.ceil(m1)} - ${Math.ceil(m4)}`);
				legend_labels.push(`${Math.ceil(m4)} - ${Math.ceil(m5)}`);
				legend_labels.push(`${Math.ceil(m5)} - ${Math.ceil(m6)}`);
				legend_labels.push(`${Math.ceil(m6)} - ${Math.ceil(m7)}`);


	            // change legend text according to drop down menu
	            choropleth.selectAll("g.legend").select("text")
	            .transition().duration(500)
	            .on("start", function(){
	            	var t = d3.active(this)
	            	.style("opacity", 0);
	            })
	            .on("end", function(){
	            	choropleth.selectAll("g.legend").select("text")
	            	.text(function(d, i){ return legend_labels[i]; })
	            	.transition().delay(500).duration(1000)
	            	.style("opacity", 1);
	            });

				// exit and reset data
				choropleth_legend.selectAll("g.legend").exit();
				choropleth_legend.selectAll("g").remove();

				//Adding legend for our Choropleth
				var legend = choropleth_legend.selectAll("g.legend")
				.data(ext_color_domain)
				.enter().append("g")
				.attr("class", "legend");

				var ls_w = 25, ls_h = cp_height/10, n = 6;

				legend.append("rect")
				.attr("x", 20)
				.attr("y", function(d, i){ return ls_h*i+50;})
				.attr("width", ls_w)
				.attr("height", ls_h)
				.style("fill", function(d, i) { return (i+1===5?"white":cp_color(i+1)); })
				.style("opacity", 0.7)
				.style('padding',10);

				legend.append("text")
				.attr("x", 50)
				.attr("y", function(d, i){ return ls_h*i+60+ls_h/2;})
				.text(function(d, i){ return legend_labels[i]; });

				choropleth_legend.append("g")
				.attr("class", "title")
				.append("text")
				.attr("x", 20)
				.attr("y", parseInt(30))
			}		
	    }
	})
	.catch(function(erro)
	{
		console.log("error",error);
 	}); //end of d3.csv         
 })// end of document ready


	