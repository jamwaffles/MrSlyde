/***************************************
 *                                     *
 * MrSlyde 1.0                         *
 *                                     *
 * James Waples (jamwaffles@gmail.com) *
 *                                     *
 * http://www.jamwaffles.co.uk         *
 *                                     *
 ***************************************/

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
		}

		var toNearest = function(value, base) {
			return Math.round(value / base) * base;
		}

		var toDp = function(value, numDp) {
			value = parseFloat(value);
			return value.toFixed(numDp);
		}

		// Set handle's position from value given. Return left offset.
		var positionFromValue = function(value, container) {
			var opt = container.prev().data('ms');
			var handle = container.find('div.handle');
			var track = container.find('div.track');
			var trackWidth = track.outerWidth() - handle.outerWidth();
			var leftOffs = track.offset().left;

			var xPosition = leftOffs + (trackWidth * ((value - opt.min) / (opt.max - opt.min)));

			handle.css({ left: xPosition });

			return xPosition;
		}

		var valueFromNormalised = function(normalised, input) {
			var opt = input.data('ms');
			var value = opt.min + ((opt.max - opt.min) * normalised);
			
			return value;
		}

		// Set position of handle from mouse position
		var positionFromMouse = function(container, opt, pagex) {
			var handle = container.find('div.handle');
			var track = handle.next();
			var trackOffs = track.offset().left;
			var handleWidth = handle.outerWidth();
			var trackWidth = track.outerWidth() - handleWidth;

			var handleOffs = pagex - (handleWidth / 2);

			if(!opt.snap) {
				handleLeft = trackOffs + handleOffs - trackOffs, trackWidth / ((opt.max - opt.min) / opt.stepSize);
			} else {
				handleLeft = trackOffs + toNearest(handleOffs - trackOffs, trackWidth / ((opt.max - opt.min) / opt.stepSize));
			}

			var handlePosition = Math.max(trackOffs, Math.min(handleLeft, trackOffs + trackWidth));

			handle.css({ left: handlePosition });

			// Return normalised value along track
			return (handlePosition - trackOffs) / trackWidth;
		}

		// Set value display's text to slider value, nothing more
		var setValue = function(value, input) {
			var opt = input.data('ms');
			
			value = toDp(toNearest(confine(value, opt.min, opt.max), opt.stepSize), opt.precision);

			input.val(value);

			if(opt.showValues) {
				input.next().find('span.center').text(value);
			}

			return value;
		}

		var configure = function(input, opt) {
			if(input.data('msstepsize')) {
				opt.stepSize = input.data('msstepsize');
			}

			if(input.data('msmin')) {
				opt.min = toNearest(input.data('msmin'), opt.stepSize);
			}

			if(input.data('msmax')) {
				opt.max = toNearest(input.data('msmax'), opt.stepSize);
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

			if(input.val().length) {
				opt.default = toNearest(confine(input.val(), opt.min, opt.max), opt.stepSize);
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

			// Set track width
			html.width(input.outerWidth());

			// Stop autocomplete
			input.attr('autocomplete', 'off');

			// Give options to data()
			input.data('ms', opt);

			// Append markup to document
			input.addClass('mrslyde').after(html);

			// Set handle to initial position, and value display
			setValue(input.data('ms').default, input);
			positionFromValue(input.val(), input.next());
		};

		// Unbind events to prevent duplicates
		$('body').off('mousedown.mrslyde');
		$('body').off('mousemove.mrslyde');
		$('body').off('mouseup.mrslyde');
		$('body').off('change.mrslyde');

		// Bind events
		$('body').on('mousedown', function(e) {
			var elem = $(e.target);

			if(elem.is('.handle')) {
				elem.closest('div.mrslyde').addClass('slyding');

				// Add class to <html>
				$('html').addClass('slyding');
			}
		});
		$('body').on('mousemove', function(e) {
			var container = $('div.mrslyde.slyding');

			// Position handle and set value
			if(container.length) {
				var norm = positionFromMouse(container, container.prev().data('ms'), e.pageX);

				setValue(valueFromNormalised(norm, container.prev()), container.prev());
			}
		});
		$('body').on('mouseup', function() {
			$('div.mrslyde.slyding').removeClass('slyding');
		});
		$('body').on('change', 'input.mrslyde', function() {
			positionFromValue(setValue($(this).val(), $(this)), $(this).next());
		});

		return this.each(function() {
			var input = $(this);
			var html = markup.clone();
			var opt = $.extend(true, {}, settings);

			// Configure options from defaults/data- attributes
			configure(input, opt)

			// Initialise slider HTML, set inital position, etc
			init(input, opt, html);
		});
	};
})(jQuery);