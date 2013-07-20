/**********************************************
 *                                            *
 * MrSlyde 0.3.1                              *
 *                                            *
 * James Waples (jamwaffles@gmail.com)        *
 *                                            *
 * http://www.jamwaffles.co.uk/jquery/mrslyde *
 *                                            *
 * https://github.com/jamwaffles/MrSlyde      *
 *                                            *
 **********************************************/

(function($) {
	$.fn.mrslyde = function(options) {
		var focusedSlider = null;

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

		var markup = $('<div class="mrslyde-container">\
			<div class="track-wrapper">\
				<div class="track">\
					<a href="#" class="handle"></a>\
				</div>\
			</div>\
			<div class="values">\
				<span class="left"></span><span class="center"></span><span class="right"></span>\
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
			var handle = el !== undefined ? el : container.find('.handle')[0];
			var track = container.find('.track');

			var normalised = (value - opt.min) / (opt.max - opt.min);

			return handle.style.left = (normalised * 100) + '%';
		}

		var valueFromPosition = function(handle, opt) {
			return opt.min + ((opt.max - opt.min) * (handle.position().left / (handle.parent().outerWidth() - handle.outerWidth())));
		}

		// Return normalised value for handle based on mouse position
		var normalisedFromMouse = function(container, opt, pagex, el) {
			var handle = el !== undefined ? el : container.find('.handle').first();
			var handleWidth = handle.outerWidth();
			var track = handle.parent()[0];
			var trackWidth = track.clientWidth;

			var posX = confine(pagex - track.offsetLeft - (handleWidth / 2), 0, trackWidth);

			// Snapping
			if(opt.snap) {
				posX = toNearest(posX, trackWidth / ((opt.max - opt.min) / opt.stepSize));
			}

			return posX / trackWidth;
		}

		// Set value display's text to slider value, nothing more
		var setValue = function(value, input, opt) {
			if(typeof value !== "object") {
				value = toDp(toNearest(confine(value, opt.min, opt.max), opt.stepSize), opt.precision);

				input[0].value = value;

				if(opt.showValues) {
					input.next().find('span.center').text(value);
				}
			} else {
				lower = toDp(toNearest(confine(value[0], opt.min, opt.max), opt.stepSize), opt.precision);
				upper = toDp(toNearest(confine(value[1], opt.min, opt.max), opt.stepSize), opt.precision);

				input[0].value = lower + ',' + upper;

				if(opt.showValues) {
					input.next().find('span.center').html(lower + ' &#8211; ' + upper);
				}
			}

			return value;
		}

		var checkCollisions = function(thisHandle, thatHandle, pagex) {
			var isFirst = thisHandle.index() === 0;
			var handleWidth = thisHandle[0].offsetWidth;
			var track = thisHandle.parent();
			var trackWidth = track[0].clientWidth;

			// Work out handlewidth in normalised
			handleWidth = handleWidth / trackWidth;

			var leftLimit = 0;
			var rightLimit = 1;

			if(isFirst) {
				var rightLimit = parseFloat(thatHandle[0].style.left) / 100 - handleWidth;
			} else {
				var leftLimit = parseFloat(thatHandle[0].style.left) / 100 + handleWidth;
			}

			return confine((pagex - track[0].offsetLeft) / trackWidth - (handleWidth / 2), leftLimit, rightLimit);
		}

		var setRangeBar = function(leftHandle, rightHandle) {
			var track = leftHandle.parent();
			var bar = track.children('.range-bar')[0];

			bar.style.left = leftHandle[0].style.left;
			bar.style.width = (parseFloat(rightHandle[0].style.left) - parseFloat(leftHandle[0].style.left)) + '%';
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

					opt.defaultValue = [ toNearest(confine(parseFloat(values[0]), opt.min, opt.max), opt.stepSize), toNearest(confine(parseFloat(values[1]), opt.min, opt.max), opt.stepSize) ];
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

				// Add range div thingy (shown between handles)
				html.find('.track').append($('<div />').addClass('range-bar'));

				// Add second handle
				var handle = html.find('.handle');
				var newHandle = handle.clone().addClass('range-upper');

				handle.after(newHandle).addClass('range-lower');

				setValue(opt.defaultValue, input, opt);

				handle.css({ left: positionFromValue(values[0], input.next(), handle[0]) + '%' });
				newHandle.css({ left: positionFromValue(values[1], input.next(), newHandle[0]) + '%' });

				setRangeBar(handle, newHandle);
			} else {
				// Set handle to initial position, and value display
				setValue(opt.defaultValue, input, opt);
				html.find('.handle').css({ left: positionFromValue(input.val(), input.next()) });
			}
		};

		// Bind events
		$('body').on('mousedown touchstart', function(e) {
			var elem = $(e.target);

			if(elem.hasClass('handle')) {
				e.preventDefault();

				// Cache container
				focusedSlider = {
					input: elem.closest('.mrslyde-container').prev(),
					container: elem.closest('.mrslyde-container'),
					handle: elem
				};
				focusedSlider.opt = focusedSlider.input.data('ms');

				focusedSlider.container.addClass('slyding');
				focusedSlider.input.trigger('slydestart');

				elem.addClass('mousedown');

				// If this is a touch event, add a bubble to show marker position under finger. Woop woop!
				if(e.type === 'touchstart') {
					elem.addClass('touch');
				}

				// Add class to <html>
				$('html').addClass('slyding');
			}
		});

		if(document.addEventListener !== undefined) {
			document.addEventListener('mousemove', onMove, false);
			document.addEventListener('touchmove', onMove, false);
		} else if(document.attachEvent) {
			document.attachEvent('onmousemove', onMove);
		}

		function onMove(e) {
			if(document.documentElement.className.indexOf('slyding') > -1) {
				(e.preventDefault) ? e.preventDefault() : e.returnValue = false;

				var opt = focusedSlider.opt;
				var handle = focusedSlider.handle;
				var container = focusedSlider.container;
				var input = focusedSlider.input;

				var pageX = e.pageX || e.clientX || e.touches[0].pageX;

				// Position handle and set value
				if(container !== null) {
					if(opt.range) {
						handle[0].style.left = (checkCollisions(handle, container.find('.handle').not('.mousedown'), pageX) * 100) + '%';

						var rangeUpper = container.find('.range-upper');
						var rangeLower = container.find('.range-lower');

						setRangeBar(rangeLower, rangeUpper);

						var lower = valueFromPosition(rangeLower, opt);
						var upper = valueFromPosition(rangeUpper, opt);

						setValue([ lower, upper ], focusedSlider.input, opt);
					} else {
						handle[0].style.left = (normalisedFromMouse(container, opt, pageX, handle) * 100) + '%';

						setValue(valueFromPosition(container.find('.handle'), opt), input, opt);
					}
				}
			}
		}

		$('body').on('mouseup touchend', function() {
			if(focusedSlider === null) {
				return false;
			}

			var container = focusedSlider.container;
			var handle = focusedSlider.handle;

			container.removeClass('slyding');
			handle.removeClass('mousedown touch');

			$('html').removeClass('slyding');

			focusedSlider.input.trigger('slydeend');

			focusedSlider = null;
		});
		$('body').on('change', 'input.mrslyde', function() {
			positionFromValue(setValue($(this).val(), $(this), $(this).data('ms')), $(this).next());
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