/***************************************
 *                                     *
 * MrSlyde 0.3                         *
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
		var positionFromValue = function(value, container, opt) {
			var handle = container.find('div.handle');
			var track = container.find('div.track');
			var trackWidth = track.outerWidth() - handle.outerWidth();
			var leftOffs = track.offset().left;

			var xPosition = leftOffs + (trackWidth * ((value - opt.min) / (opt.max - opt.min)));

			handle.css({ left: xPosition });

			return xPosition;
		}

		var valueFromPosition = function(handlePosition, container) {
			var track = container.find('div.track');
			var handle = container.find('div.handle');
			var input = container.prev();

			var leftOffs = track.offset().left;
			var handleWidth = handle.outerWidth();
			var trackWidth = track.outerWidth() - handleWidth;

			if(handlePosition >= leftOffs && handlePosition <= (leftOffs + trackWidth)) {
				var offset = handlePosition - leftOffs;
				var value = input.data('msmin') + (input.data('msmax') - input.data('msmin')) * (offset / trackWidth);

				return toNearest(value, input.data('msstepsize'));
			} else {
				return false;
			}
		}

		// Set value display's text to slider value, nothing more
		var setValueDisplay = function(input, container) {
			if(input.data('msshowvalues')) {
				var value = toDp(input.val(), input.data('msprecision'));
				container.find('span.center').text(value);
			}
		}

		var configure = function(input, opt) {
			/*if(input.data('msstepsize')) {
				opt.stepSize = input.data('msstepsize');
			} else {
				input.data('msstepsize', opt.stepSize);
			}

			if(input.data('msmin')) {
				opt.min = toNearest(input.data('msmin'), opt.stepSize);
			} else {
				input.data('msmin', opt.min);
			}

			if(input.data('msmax')) {
				opt.max = toNearest(input.data('msmax'), opt.stepSize);
			} else {
				input.data('msmax', opt.max);
			}

			if(input.data('mssnap')) {
				opt.snap = input.data('mssnap');
			} else {
				input.data('mssnap', opt.snap);
			}

			if(input.data('msshowvalues')) {
				opt.showValues = input.data('msshowvalues');
			} else {
				input.data('msshowvalues', opt.showValues);
			}

			if(input.data('msprecision')) {
				opt.precision = input.data('msprecision');
			}  else {
				input.data('msprecision', opt.precision);
			}

			if(input.val()) {
				opt.default = toNearest(confine(input.val(), opt.min, opt.max), opt.stepSize);
			} else {
				opt.default = toNearest(opt.default, opt.stepSize);
			}*/

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

			if(input.val()) {
				opt.default = toNearest(confine(input.val(), opt.min, opt.max), opt.stepSize);
			} else {
				opt.default = toNearest(opt.default, opt.stepSize);
			}

			input.data('ms', opt);

			input.val(opt.default)//.hide();
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
			input.addClass('mrslyde').after(html);

			// Set handle to initial position, and value display
			positionFromValue(input.val(), html, opt);
			setValueDisplay(input, html);
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
			$('body').off('mousedown.mrslyde');
			$('body').off('mousemove.mrslyde');
			$('body').off('mouseup.mrslyde');
			$('input.mrslyde').off('change.mrslyde');

			// Bind events
			$('body').on('mousedown', function(e) {
				var elem = $(e.target);

				if(elem.is('.handle')) {
					//valueFromPosition(e.pageX, elem.closest('div.mrslyde'));
					elem.closest('div.mrslyde').addClass('slyding');

					// Add class to <html>
					$('html').addClass('slyding');
				}
			});
			$('body').on('mousemove', function(e) {
				var container = $('div.mrslyde.slyding');

				// Position handle and set value
				if(container.length) {
					var handle = container.find('div.handle');
					var track = container.find('div.slider');

					var leftOffs = confine(e.pageX - (handle.outerWidth() / 2), track.offset().left, track.offset().left + track.outerWidth() - handle.outerWidth());
					var value = valueFromPosition(leftOffs, container);

					handle.css({ left: leftOffs });

					setValueDisplay(container.prev(), container);
					container.prev().val(value);
				}
			});
			$('body').on('mouseup', function() {
				$('div.mrslyde.slyding').removeClass('slyding');
			});
			$('input.mrslyde').on('change', function() {
				$(this).val(confine($(this).val(), $(this).data('msmin'), $(this).data('msmax')));

				positionFromValue($(this).val(), $(this).next(), { min: $(this).data('msmin'), max: $(this).data('msmax') });
				setValueDisplay($(this), $(this).next());
			});
		});
	};
})(jQuery);