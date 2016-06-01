/**
 * @title WET-BOEW htmlAPI
 * @overview Operate an app by injecting a specific form interface, then on submit parsing the html result into JSON, then display the result by specifying a template
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @duboisp
 */
(function( $, window, wb ) {
	"use strict";
	/**
	* 
	
	* Error: When there is 2 dropdown and more, the Validation widget to not complete his work. 
		[TODO] : Validate each required field in the forms.
	* [TODO]: Add the Required keyword with it the red start
	
	
	* Variable and function definitions.
	* These are global to the plugin - meaning that they will be initialized once per page,
	* not once per instance of plugin on the page. So, this is a good place to define
	* variables that are common to all instances of the plugin on a page.
	*/
	var componentName = "jj-down",
		selector = "." + componentName,
		formComponent = componentName + "-form",
		selectorForm = "." + formComponent,
		initEvent = "wb-init" + selector,
		$document = wb.doc,
		
		/**
		* @method init
		* @param {jQuery Event} event Event that triggered the function call
		*/
		init = function( event ) {
			// Start initialization
			// returns DOM object = proceed with init
			// returns undefined = do not proceed with init (e.g., already initialized)
			var elm = wb.init( event, componentName, selector ),
				$elm,
				data, 
				dataIDSearch,
				dataExample, dataExampleAPI,
				$formContainer;
	
			if ( elm ) {
				$elm = $(elm);
				data = wb.getData( $(elm), componentName);

				dataIDSearch = {
					form: "../vwapj/frm-idSearch-eng.html/$FILE/frm-idSearch-eng.html",
					tplSetting: "../vwapj/tplSettingIDSearch.json/$FILE/tplSettingIDSearch.json", // Location of the setting for this customized plugin
					subPluginName: "idsearch" // This is to identify and avoid duplication of downloading the settings.
				}
				
				// Extend this data with the contextual default
				data = $.extend( true, data, dataIDSearch );
				
				// Example of data set
				dataExample = {
					in: "#formContainer", // Selector of where to ajax in the content [if not present, the form html will replace the existing content]
					inAction: "append", // Data-ajax method to use, default is "append"
					out: "#formResult" // Selector of where to show the results [if not present, the form html will replace the existing content]
				};
				
				dataExampleAPI = {
					form: "ajax/frm.html", // Location of the Form to input (Will be an Array if the purpose is AB testing
					error: "ajax/error.html", // Location of the sniped to include in case of an error
					loading: "ajax/load.html" // Static loading template to use
				};

				if (data.in) {
					$formContainer = $(data.in);
					// Transfer the config set at the element
					$formContainer.data(componentName, data);
					// console.log("Form Container Data");
					// console.log($formContainer.data());
				} else {
					// Nah, the form will replace the current element
					$formContainer = $elm; // in this case the form container is the same element
				}
				
				
				
				// Transform the list into a select, use the first paragrap content for the label, and extract for i18n the name of the button action.
				
				var formID = wb.getId();
				
				var stdOut = "<div id='" + formID + "' class='wb-frmvld " + formComponent + "'><form>";

				var label = $elm.find( "> p" );
				var items = $elm.find( "ul:first() > li" );
				
				stdOut = stdOut + fillOption(label, items);

				stdOut = stdOut + '<input type="submit" value="Continue" class="btn btn-primary" /> </form></div>';
				stdOut = stdOut + '<hr /><div id="' + formID + 'out" class="row mrgn-tp-md mrgn-bttm-md"></div>';
				$elm.addClass("wb-inv");
				$elm.after(stdOut);
				
				
				
				
				// Identify that initialization has completed
				wb.ready( $elm, componentName );
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				/*
				
				$formContainer.attr("data-ajax-after", "status/1.html");
				// $formContainer.attr("data-ajax-replace", data.form);
				$formContainer.trigger( "wb-init.wb-data-ajax" );
				
				*/
				
				
			}
				
		};
	
	function fillOption(label, items){
		
		var idSelect = wb.getId(),
			stdOut, $subLst, $itmAnchor,
			idItem, $cloned;
		
		stdOut = "<label for='" + idSelect + "'><span class='field-name'>" + $(label[ 0 ]).text() + "</span></label>" +
			"<select id='" + idSelect + "' class='full-width form-control mrgn-bttm-md' required>";
				
		// Add the Empty select
		stdOut = stdOut + "<option value=''>Select ...</option>";
		
		for	(var i = 0, i_len = items.length; i < i_len; i = i + 1) {
			var $itm = $(items[ i ]);
			
			// console.log($itm);
			
			// Check if has list
			$subLst = $itm.find("ul");
			
			if ($subLst.length === 0) {
				//console.lot("log");
				
				$itmAnchor = $($itm.find("a")[0]);
			
				stdOut = stdOut + "<option value='" + $itmAnchor.attr( 'href' ) + "'>" + $itmAnchor.text() + "</option>";
			
			} else {
				idItem = wb.getId();
				
				$itm.attr("id", idItem);
				
				// Get the title
				$cloned = $itm.clone();
				
				$cloned.find("ul").remove();
				$cloned.find("p").remove();

				// a sub list exist
				stdOut = stdOut + "<option value='jj-down-" + idItem + "'>" + $cloned.text() + "</option>";
				
				//console.log("new");
			}		
		}

		stdOut = stdOut + '</select>';
		
		return stdOut;
	}

	// Load content after the user have choosen an option
	$document.on( "change", selectorForm + " select", function( event ) {	
		
		var elm = event.currentTarget,
			$elm = $(elm),
			data;
		
		// Check if a new sub-list need to be created, otherwise remove all subsequent select
		
		var optSel = $elm.find( 'option:selected', $elm)[0],
			optValue = optSel.value,
			componentName_len = componentName.length;
		
		if( optValue.substr(0, componentName_len) !== componentName) {
			
			// Remove any subsequent select if any
			var $nextDom = $elm.next();
			while( $nextDom && ( $nextDom.get( 0 ).nodeName.toLowerCase() !== "input" )) {
				
				$nextDom.remove();
				
				$nextDom = $elm.next();
			}
			
			return;
		}
		
		
		// Stop propagation of the activate event
		event.preventDefault();
		if ( event.stopPropagation ) {
			event.stopImmediatePropagation();
		} else {
			event.cancelBubble = true;
		}
		
		
		// Get the option selected and ajax in the content in the wraper
		
		// Extract the id
		var idItem = optValue.substr(componentName_len + 1, optValue.length - componentName_len - 1 ),
			$itm = $( '#' + idItem),
			$label,
			lstItems,
			stdOut;
		
		// Get the title
		$label = $itm.clone();
		$label.find("ul").remove();
		
		if ($label.has("p")) {
			$label = $label.find("p");
		}
		
		lstItems = $itm.find( "ul:first() > li" );
		
		stdOut = fillOption($label, lstItems);
		
		$elm.after(stdOut);
		
		// console.log($elm);
		// console.log(idItem);
	});
	
	
	// Load content after the user have choosen an option
	$document.on( "submit", selectorForm, function( event ) {	
		
		var elm = event.currentTarget,
			$elm = $(elm),
			data;
				
		// Stop propagation of the activate event
		event.preventDefault();
		if ( event.stopPropagation ) {
			event.stopImmediatePropagation();
		} else {
			event.cancelBubble = true;
		}
		
		
		// Get the option selected and ajax in the content in the wraper
		
		var optionSelected = $elm.find( 'select:last > option:selected')[0];

		var $out = $('#' + $elm[0].id + 'out');
		
		
		$out.html('<p><span class="fa fa-spinner fa-spin"></span> Loading in progress</p>');
		$out.attr("data-ajax-replace", optionSelected.value);
		$out.removeClass("wb-data-ajax-replace-inited");
		$out.trigger( "wb-init.wb-data-ajax" );
		
	});
	
	// Bind the init event of the plugin
	$document.on( "timerpoke.wb " + initEvent, selector, function( event ) {
		var eventTarget = event.target;
		switch ( event.type ) {
			/*
			* Init
			*/
			case "timerpoke":
			case "wb-init":
				init( event );
				break;
		}
	
		/*
		* Since we are working with events we want to ensure that we are being passive about our control,
		* so returning true allows for events to always continue
		*/
		return true;
	});

	// Add the timer poke to initialize the plugin
	wb.add( selector );
})( jQuery, window, wb );
