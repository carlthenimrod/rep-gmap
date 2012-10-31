//create namespace
var repMap = repMap || (function() {

	var map,
		reps,
		locations,
		markers = [],
		addressList = [];

	var init = function(){

		var mapOptions,
			selected,
			selection;

		//create map options
		mapOptions = {
			center: new google.maps.LatLng(38.996163, -96.667969),
			zoom: 4,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}

		//create new map
		map = new google.maps.Map( document.getElementById("map_canvas"), mapOptions );			

		//perform ajax
		$.ajax({

			url : 'json/reps.json',
			dataType : 'json'
		})
		.done( function(data){

			//parse data
			parse(data);

			selection = {
				region : 'United States',
				abbr : 'US'
			}

			//find selected
			selected = findSelected( selection );

			if( selected ){

				//change map
				changeMap( selection );

				//clear markers
				clearMarkers( markers );

				//for each selected
				for( var i = 0, l = selected.length; i < l; ++i ){
				
					//add marker
					addMarker( selected[i] );
				}
			}			
		});

		//EVENTS
		///////////////////
		//on select menu change
		$('body').on('change', '#rep-select-menu', changeSelectMenu);
	};

	var parse = function(data){

		//store reps, locations
		reps = data.reps;
		locations = data.locations;

		//combine like address
		addressList = repMap.utilities.combine(reps);

		//create select menu
		createSelectMenu( data );

		//build new object
		reps = construct( reps );
	};

	var construct = function(reps){

		var results = 0,
			obj = 0,
			data = [];					

		for( var i = 0, l = addressList.length; i < l; ++i ){	

			//reset results var
			results = 0;

			//create new object
			data[obj] = {
				name 	: [],
				phone 	: [],
				cell 	: [],
				fax 	: [],
				web 	: [],
				email 	: []
			}

			//store address for later use
			address = addressList[i];

			for( var x = 0, j = reps.length; x < j; ++x ){

				if( address === repMap.utilities.format( reps[x].address ) ){
					//add to arrays
					data[obj].name.push( reps[x].name );
					data[obj].phone.push( reps[x].phone );
					data[obj].cell.push( reps[x].cell );
					data[obj].fax.push( reps[x].fax );
					data[obj].web.push( reps[x].web );
					data[obj].email.push( reps[x].email );

					//if company is missing
					if( !data[obj].company ){
						data[obj].company = reps[x].company;
					}

					//if address is missing
					if( !data[obj].address ){
						data[obj].address = reps[x].address;
					}

					//if city is missing
					if( !data[obj].city ){
						data[obj].city = reps[x].city;
					}

					//if state is missing
					if( !data[obj].state ){
						data[obj].state = reps[x].state;
					}

					//if state is missing
					if( !data[obj].country ){
						data[obj].country = reps[x].country;
					}

					//if address is missing
					if( !data[obj].zip ){
						data[obj].zip = reps[x].zip;
					}

					//if address is missing
					if( !data[obj].position ){
						data[obj].position = reps[x].position;
					}

					//if results are found, iterate results value
					++results;
				}
			}

			//iterate object item
			++obj;	
		}

		return data;
	};

	var findSelected = function(selection){

		var region = selection.region,
			abbr = selection.abbr,
			selected = [];

		for( var i = 0, l = reps.length; i < l; ++i ){

			if( region === "All" || region === "United States" || abbr === "US" ){

				selected.push( reps[i] );
			}
			else if( (reps[i].state === region) || (reps[i].state === abbr) || (reps[i].country === region) || (reps[i].country === abbr) ){

				selected.push( reps[i] );
			}
		};

		return selected;
	};

	var createSelectMenu = function(data){

		var selectMenu,
			selectMenuLabel,
			selectMenuContainer,
			h1,
			locations,
			option,
			parent,
			map;

		//filter selected
		locations = repMap.utilities.filterLocations( data );

		//create select menu container, give id
		selectMenuContainer = document.createElement('div');
		selectMenuContainer.setAttribute('id', 'rep-menu-container');

		//create h1
		h1 = document.createElement('h1');
		h1.innerHTML = 'Sales Rep Locator';	

		//create selectlabel, give id
		selectMenuLabel = document.createElement('div');
		selectMenuLabel.setAttribute('id', 'rep-select-label');
		selectMenuLabel.innerHTML = 'Select a Location:';

		//create select menu, give id
		selectMenu = document.createElement('select');
		selectMenu.setAttribute('id', 'rep-select-menu');

		//create option
		option = document.createElement('option');

		//set value and text
		option.value = null;
		option.innerHTML = 'Please Select a Location';

		//append option to select menu
		selectMenu.appendChild( option );

		//create option
		option = document.createElement('option');

		//set value and text
		option.value = 'All';
		option.innerHTML = 'All';

		//append option to select menu
		selectMenu.appendChild( option );					

		for( var i = 0, l = locations.length; i < l; ++i ){

			//create option
			option = document.createElement('option');

			//set value and text
			option.value = locations[i].abbr;
			option.innerHTML = locations[i].region;

			//append option to select menu
			selectMenu.appendChild( option );
		}

		//append select menu label and menu
		selectMenuContainer.appendChild( h1 );	
		selectMenuContainer.appendChild( selectMenuLabel );	
		selectMenuContainer.appendChild( selectMenu );		

		//store map
		map = document.getElementById('map_canvas');

		//store parent
		parent = map.parentNode;

		//insert menu before map
		parent.insertBefore( selectMenuContainer, map );
	};

	var changeSelectMenu = function(){
		if( this.value !== 'null' ){

			selection = {
				region : this.options[this.selectedIndex].text,
				abbr : this.value
			}

			//find selected
			selected = findSelected( selection );

			if( selected ){

				//change map
				changeMap( selection );

				//clear markers
				clearMarkers( markers );

				//for each selected
				for( var i = 0, l = selected.length; i < l; ++i ){
				
					//add marker
					addMarker( selected[i] );
				}
			}
		}
	};

	var changeMap = function(selected){

		var coords;

		//for every location
		for( var i = 0, l = locations.length; i < l; ++i ){

			if( ( locations[i].state === selected.region ) || ( locations[i].abbr === selected.abbr ) || ( locations[i].country === selected.region ) || ( locations[i].country === selected.abbr ) ){

				//create new LatLng object
				coords = new google.maps.LatLng( locations[i].position[0], locations[i].position[1] );

				//center
				map.panTo( coords );

				map.setZoom( locations[i].zoom );

				//return
				return;
			}
		}
	};

	var addMarker = function(rep){

		var marker,
			position,
			infoWindow,
			open = false,
			hoverOn,
			hoverOff,
			element;

		position = new google.maps.LatLng( rep.position[0], rep.position[1] );


		//create marker
		marker = new google.maps.Marker({
			position: position,
			map: map
		});

		markers.push( marker );

		//get element for info window
		element = repMap.utilities.parseRep( rep );	

		//create info window
		infoWindow = new google.maps.InfoWindow({
			content : element
		});

		google.maps.event.addListener(marker, 'click', function() {

			if( open ){

				//close
				infoWindow.close(map,marker);	

				//now closed
				open = false;
			}
			else{

				//open
				infoWindow.open(map,marker);

				//now open
				open = true;		
			}
		});		
	};

	var clearMarkers = function(markers){

		//if any markers exist
		if( markers.length > 0 ){

			//delete each marker
			for (var i = 0, l = markers.length; i < l; i++ ) {

				markers[i].setMap(null);
			}

			//empty array
			markers.length = 0;

			return markers;
		}
	};

	return{
		init : init
	}

})();

repMap.utilities = (function(){

	var format = function(address){

		//replace any non-alphanumeric characters
		address = address.toLowerCase().replace(/[^A-Za-z0-9]/g, '');

		//return formatted address
		return address;
	};

	var combine = function( reps ){

		var match = false,
			address,
			addressList = [];

		//combine the same address
		for ( var i = 0, l = reps.length; i < l ; ++i ){

			//for each rep
			address = format( reps[i].address );

			//reset match var
			match = false;

			if( addressList.length < 1 ){

				//add address if list is empty
				addressList.push( address );
			}	

			for( var x = 0, j = addressList.length; x < j; ++x ){
					
				//check if match exists	
				if( address === addressList[x] ){

					match = true;
				}
			}

			if( !match ){

				//add address to list
				addressList.push( address );
			}
		}

		return addressList;
	};

	var filterLocations = function(data){

		var locations = data.locations,
			reps = data.reps,
			selected = [];

		//for each location
		for( var i = 0, l = locations.length; i < l; ++i ){

			//for each rep
			for( var x = 0, j = reps.length; x < j; ++x ){

				//if location's region is equal to reps state or reps country
				if( locations[i].region === reps[x].state || locations[i].region === reps[x].country ){

					//add to selected
					selected.push( locations[i] );

					//break loop if one result found
					break;
				}
			}
		}

		//return selected array
		return selected;
	};

	var parseRep = function(rep){

		//create element
		var element = document.createElement('div');

		//set class name
		element.className = 'rep';

		//parse fields
		parseCompany( rep.company, element );
		parseName( rep.name, element );
		parseAddress( rep, element );
		parseInfo( rep.phone, 'Phone', element );
		parseInfo( rep.cell, 'Cell', element );
		parseInfo( rep.fax, 'Fax', element );
		parseInfo( rep.web, 'Web', element );
		parseInfo( rep.email, 'Email', element );

		return element;
	};
	
	var parseCompany = function(company, element){

		var el;

		if( company ){

			//create element
			el = document.createElement('div');

			//set attributes
			el.setAttribute('class', 'rep-company');

			//set inner html
			el.innerHTML = company;

			//append to element
			element.appendChild(el);
		}
	};

	var parseName = function(name, element){

		var el;

		//for each name
		for( var i = 0, l = name.length; i < l; ++i ){

			//if name exists
			if( name[i] ){

				//create element
				el = document.createElement('div');

				//set attributes
				el.setAttribute('id', 'rep-' + i);
				el.setAttribute('class', 'rep-name');

				//set inner html
				el.innerHTML = name[i];

				//append to element
				element.appendChild(el);
			}
		}
	};

	parseAddress = function(rep, element){

		var el,
			address,
			address2,
			city,
			state,
			zip,
			string = '';

		el = document.createElement('div');

		//set attributes
		el.setAttribute('class', 'rep-address');

		address = (rep.address) ? rep.address : false;
		city 	= (rep.city) ? rep.city : false;
		state 	= (rep.state) ? (rep.state) : false;
		country = (rep.country) ? (rep.country) : false;
		zip 	= (rep.zip) ? (rep.zip) : false;

		string = address + "<br />";

		//if city
		if( city ){
			address2 = city;
		}

		//if state
		if( state ){
			if( address2 ){
				address2 = address2 + ', ' + state;
			}
			else{
				address2 = state;
			}
		}

		//if zip
		if( zip ){
			if( address2 ){
				address2 = address2 + ' ' + zip;
			}
			else{
				address2 = zip;
			}
		}	

		//if country
		if( country ){
			if( address2 ){
				address2 = address2 + ' ' + country;
			}
			else{
				address2 = country;
			}
		}

		//append address line 2
		string = string + address2;						

		//set inner html
		el.innerHTML = string;

		//append to element
		element.appendChild(el);
	};

	parseInfo = function(infos, label, element){

		var info = infos[0],
			match = true,
			a,
			el,
			elements;

		for( var i = 1, l = infos.length; i < l; ++i ){

			//if info is not empty
			if( infos[i] ){

				//check if not equal
				if( info !== infos[i] ){

					//info doesn't match
					match = false;
				}
			}
		}

		//append info if matchs, else append info for every rep
		if( match ){

			if( info ){

				//if web or email, create link as well
				if( repMap.utilities.format( label.toLowerCase() ) === 'web' || repMap.utilities.format( label.toLowerCase() ) === 'email'){

					//if info exists
					el = document.createElement('div');
					el.setAttribute( 'class', 'rep-' + repMap.utilities.format( label.toLowerCase() ) );

					a = document.createElement('a');
					a.setAttribute('href', info );
					
					//create lavel
					el.innerHTML = '<span class="rep-label">' + label + ': </span>';

					//append link
					el.appendChild(a);
					
					//create link
					a.innerHTML = info;

					//append to element
					element.appendChild(el);
				}
				else{

					//if info exists
					el = document.createElement('div');
					el.setAttribute( 'class', 'rep-' + repMap.utilities.format( label.toLowerCase() ) );
					el.innerHTML = '<span class="rep-label">' + label + ': </span>' + info;

					//append to element
					element.appendChild(el);				
				}
			}
		}
		else{

			//for every info
			for( var x = 0, j = infos.length; x < j; ++x ){
					
				//if web or email, create link as well
				if( repMap.utilities.format( label.toLowerCase() ) === 'web' || repMap.utilities.format( label.toLowerCase() ) === 'email' ){

					//if info exists
					el = document.createElement('div');
					el.setAttribute( 'class', 'rep-' + repMap.utilities.format( label.toLowerCase() ) );

					a = document.createElement('a');
					a.setAttribute('href', infos[x] );
					
					//create lavel
					el.innerHTML = '<span class="rep-label">' + label + ': </span>';

					//append link
					el.appendChild(a);
					
					//create link
					a.innerHTML = infos[x];

					//get all elements in element
					elements = element.getElementsByTagName('*');

					//check for element with proper id
					for( var y = 0, k = elements.length; y < k; ++y ){

						if( elements[y].id === 'rep-' + x ){

							//append info
							elements[y].appendChild(el);
						}
					}
				}
				else{

					el = document.createElement('div');
					el.setAttribute( 'class','rep-' + repMap.utilities.format( label.toLowerCase() ) );
					el.innerHTML = '<span class="rep-label">' + label + ': </span>' + infos[x];

					//get all elements in element
					elements = element.getElementsByTagName('*');

					//check for element with proper id
					for( var y = 0, k = elements.length; y < k; ++y ){

						if( elements[y].id === 'rep-' + x ){

							//append info
							elements[y].appendChild(el);
						}
					}			
				}
			}
		}

	};

	return{
		combine : combine,
		format 	: format,
		filterLocations : filterLocations,
		parseRep : parseRep
	}

})();

//on ready
$(function(){
	
	//initialize map
	repMap.init();
});