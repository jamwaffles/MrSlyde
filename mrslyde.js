/**********************************************
 *                                            *
 * MrSlyde 1.1                                *
 *                                            *
 * James Waples (jamwaffles@gmail.com)        *
 *                                            *
 * http://www.jamwaffles.co.uk/jquery/mrslyde *
 *                                            *
 **********************************************/

(function($) {
	$.fn.mrslyde = function(options) {

		// Create some values, extending them with any options that were provided
		var settings = $.extend( {
			min: 0,
			max: 100,
			defaultValue: 50,
			stepSize: 10,
			snap: true,
			showValues: true,
			precision: 0,
			range: false 		// Whether this is a two handled range slider or not
		}, options);

		var markup = $('<div class="mrslyde">\
			<div class="slider">\
				<a class="handle"></a>\
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
			return parseFloat(value).toFixed(numDp);
		}

		// Set handle's position from value given. Return left offset.
		var positionFromValue = function(value, container, el) {
			var opt = container.prev().data('ms');
			var handle = el !== undefined ? el : container.find('.handle');
			var track = container.find('.track');
			var trackWidth = track.outerWidth() - handle.outerWidth();
			var leftOffs = track.offset().left;

			var xPosition = trackWidth * ((value - opt.min) / (opt.max - opt.min));

			handle.css({ left: xPosition });

			return xPosition;
		}

		var valueFromNormalised = function(normalised, input) {
			var opt = input.data('ms');
			var value = opt.min + ((opt.max - opt.min) * normalised);
			
			return value;
		}

		// Get normalised value from the position of a handle
		var normalisedFromPosition = function(handle) {
			var handleWidth = handle.outerWidth();
			var track = handle.nextAll('.track');
			var trackWidth = track.outerWidth() - handleWidth;

			var offset = handle.offset().left - track.offset().left;

			return offset / trackWidth;
		}

		// Set position of handle from mouse position
		var positionFromMouse = function(container, opt, pagex, el) {
			var handle = el !== undefined ? el : container.find('.handle').first();
			var handleWidth = handle.outerWidth();
			var track = handle.nextAll('.track');
			var trackWidth = track.outerWidth() - handleWidth;

			var minLeft = track.offset().left + (handleWidth / 2);
			var maxLeft = minLeft + track.outerWidth() - handleWidth;

			var offset = confine(pagex, minLeft, maxLeft) - minLeft;

			// Snapping
			if(opt.snap) {
				offset = toNearest(offset, trackWidth / ((opt.max - opt.min) / opt.stepSize));
			}

			handle.css({ left: offset });

			return offset / trackWidth;
		}

		// Set value display's text to slider value, nothing more
		var setValue = function(value, input) {
			var opt = input.data('ms');
			
			if(typeof value != "object") {
				value = toDp(toNearest(confine(value, opt.min, opt.max), opt.stepSize), opt.precision);

				input.val(value);

				if(opt.showValues) {
					input.next().find('span.center').text(value);
				}
			} else {
				lower = toDp(toNearest(confine(value[0], opt.min, opt.max), opt.stepSize), opt.precision);
				upper = toDp(toNearest(confine(value[1], opt.min, opt.max), opt.stepSize), opt.precision);

				input.val(lower + ',' + upper);

				if(opt.showValues) {
					input.next().find('span.center').html(lower + ' &#8211; ' + upper);
				}
			}

			return value;
		}

		var checkCollisions = function(thisHandle, thatHandle, pagex) {
			var isFirst = thisHandle.index() === 0;
			var handleWidth = thisHandle.outerWidth();
			var track = thisHandle.nextAll('.track');
			var trackWidth = track.outerWidth() - handleWidth;

			var rightLimit = isFirst ? thatHandle.offset().left - handleWidth : track.offset().left + trackWidth;
			var leftLimit = isFirst ? track.offset().left : thatHandle.offset().left + handleWidth;

			thisHandle.css({ left: confine(pagex - handleWidth / 2, leftLimit, rightLimit) - track.offset().left });
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

			if(input.data('mssnap') != undefined) {
				if(input.data('mssnap') == 'false' || input.data('mssnap') == '0') {
					opt.snap = false;
				} else if(input.data('mssnap') == 'true' || input.data('mssnap') == '1') {
					opt.snap = true;
				}
			}

			if(input.data('msshowvalues') != undefined) {
				if(input.data('msshowvalues') == 'false' || input.data('msshowvalues') == '0') {
					opt.showValues = false;
				} else if(input.data('msshowvalues') == 'true' || input.data('msshowvalues') == '1') {
					opt.showValues = true;
				}
			}

			if(input.data('msprecision')) {
				opt.precision = input.data('msprecision');
			}

			if(input.val().length) {
				opt.defaultValue = toNearest(confine(input.val(), opt.min, opt.max), opt.stepSize);
			}

			if(input.data('msrange')) {
				opt.range = true;

				if(input.val().length) {
					var values = input.val().split(',');

					opt.defaultValue = [ toNearest(confine(parseInt(values[0]), opt.min, opt.max), opt.stepSize), toNearest(confine(parseInt(values[1]), opt.min, opt.max), opt.stepSize) ];
				}
			}
		};

		var init = function(input, opt, html) {
			// Hide input
			input.hide();

			// Setup HTML
			if(!opt.showValues) {
				html.remove('div.values');
			} else {
				html.find('span.left').text(opt.min);
				html.find('span.center').text(opt.defaultValue);
				html.find('span.right').text(opt.max);
			}

			// Set CSS
			html.width(input.outerWidth());
			html.find('.handle').css({ left: html.offset().left });

			// Stop autocomplete
			input.attr('autocomplete', 'off');

			// Give options to data()
			input.data('ms', opt);

			// Append markup to document
			input.addClass('mrslyde').after(html);

			if(opt.range) {
				var values = input.val().split(',');

				html.find('span.left, span.right').hide();
				html.addClass('range');

				// Add second handle
				var handle = html.find('.handle');
				var newHandle = handle.clone().addClass('range-upper');

				handle.after(newHandle).addClass('range-lower');

				setValue(input.data('ms').defaultValue, input);
				positionFromValue(values[0], input.next(), handle);
				positionFromValue(values[1], input.next(), newHandle);
			} else {
				// Set handle to initial position, and value display
				setValue(input.data('ms').defaultValue, input);
				positionFromValue(input.val(), input.next());
			}
		};

		// Unbind events to prevent duplicates
		$('body').off('.mrslyde');

		// Bind events
		$('body').on('mousedown', function(e) {
			e.preventDefault();
			
			var elem = $(e.target);

			if(elem.is('.handle')) {
				elem.closest('div.mrslyde').addClass('slyding').prev().trigger('slydestart');

				elem.addClass('mousedown');

				// Add class to <html>
				$('html').addClass('slyding');
			}
		});
		$('body').on('mousemove', function(e) {
			var container = $('div.mrslyde.slyding');
			var input = container.prev();
			var opt = input.data('ms');
			var handle = container.find('.mousedown');

			// Position handle and set value
			if(container.length) {
				positionFromMouse(container, opt, e.pageX, handle);

				if(opt.range) {
					// Check for handle collisions and react accordingly
					checkCollisions(handle, container.find('.handle').not('.mousedown'), e.pageX);

					var lower = valueFromNormalised(normalisedFromPosition(container.find('.range-lower')), input);
					var upper = valueFromNormalised(normalisedFromPosition(container.find('.range-upper')), input);

					setValue([ lower, upper ], input);
				} else {
					setValue(valueFromNormalised(normalisedFromPosition(container.find('.handle')), input), input);
				}
			}
		});
		$('body').on('mouseup', function() {
			var container = $('div.mrslyde.slyding');

			container.removeClass('slyding').find('.mousedown').removeClass('mousedown');
			$('html').removeClass('slyding');

			container.prev().trigger('slydeend');
		});
		$('body').on('change', 'input.mrslyde', function() {
			positionFromValue(setValue($(this).val(), $(this)), $(this).next());
		});

		return this.each(function() {
			var input = $(this);
			var html = markup.clone();
			var opt = $.extend(true, {}, settings);

			// Configure options from defaultValues/data- attributes
			configure(input, opt)

			// Initialise slider HTML, set inital position, etc
			init(input, opt, html);
		});
	};
})(jQuery);