(function($) {
	$.fn.mrslyde = function(options) {
		// Create some defaults, extending them with any options that were provided
		var settings = $.extend( {
			min: 100,
			max: 200,
			default: 150,
			stepSize: 10,
			snap: true,
			showValues: true,
			precision: 0
		}, options);

		var markup = $('<div class="mrslyde">\
			<div class="slider">\
				<div class="handle"></div>\
				<div class="track"></div>\
			</div>\
			<div class="values">\
				<span class="left"></span>\
				<span class="center"></span>\
				<span class="right"></span>\
			</div>\
		</div>');

		var confine = function(value, min, max) {
			return Math.min(max, Math.max(value, min));
		};

		// Set handle's position from value given. Return left offset.
		var positionFromValue = function(value, container, opt) {
			var handle = container.find('div.handle');
			var track = container.find('div.track');
			var trackWidth = track.outerWidth() - handle.outerWidth();
			var leftOffs = track.offset().left;

			var xPosition = leftOffs + (trackWidth * ((value - opt.min) / (opt.max - opt.min)));

			handle.css({ left: xPosition });

			return xPosition;
		};

		// Set value display's text to slider value, nothing more
		var setValueDisplay = function(value, container) {
			container.find('span.center').text(value);
		}

		var configure = function(input, opt) {
			if(input.data('msmin')) {
				opt.min = input.data('msmin');
			}
			if(input.data('msmax')) {
				opt.max = input.data('msmax');
			}
			if(input.data('msstepsize')) {
				opt.stepSize = input.data('msstepsize');
			}
			if(input.data('mssnap')) {
				opt.snap = input.data('mssnap');
			}
			if(input.data('msshowvalues')) {
				opt.showValues = input.data('msshowvalues');
			}
			if(input.data('msprecision')) {
				opt.precision = input.data('msprecision');
			}

			if(input.val()) {
				opt.default = confine(input.val(), opt.min, opt.max);
			} else {
				input.val(opt.default);
			}
		};

		var init = function(input, opt, html) {
			// Setup HTML
			if(!opt.showValues) {
				html.remove('div.values');
			} else {
				html.find('span.left').text(opt.min);
				html.find('span.center').text(opt.default);
				html.find('span.right').text(opt.max);
			}

			html.width(input.outerWidth());

			// Append markup to document
			input.after(html);

			// Set handle to initial position, and value display
			positionFromValue(input.val(), html, opt);
			setValueDisplay(confine(input.val(), opt.min, opt.max), html);
		};

		return this.each(function() {
			var input = $(this);
			var html = markup.clone();
			var opt = $.extend(true, {}, settings);

			// Configure options from defaults/data- attributes
			configure(input, opt)

			// Initialise slider HTML, set inital position, etc
			init(input, opt, html);

			// Unbind events to prevent duplicates
			//$('body').off);

			// Bind events
			
		});
	};
})(jQuery);