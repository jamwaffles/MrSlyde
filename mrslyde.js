/**********************************************
 *                                            *
 * MrSlyde 1.0.0                              *
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
		var focusedSlider = null;		// Cache object for currently moving slider

		// Create some values, extending them with any options that were provided
		var defaults = {
			min: 0,
			max: 100,
			step: 10,
			snap: true,
			showValues: true,
			precision: 0,
			range: false 		// Whether this is a two handled range slider or not
		};

		var markup = $('<div class="mrslyde-container">\
			<div class="track-wrapper">\
				<div class="track">\
					<span class="mrslyde-handle"></span>\
				</div>\
			</div>\
			<div class="values">\
				<span class="left"></span><span class="center"></span><span class="right"></span>\
			</div>\
		</div>');

		// Get options from data-* attributes
		function getDataOptions(input) {
			var obj = {};
			var data = input.data();

			$.each(defaults, function(key) {
				if(data[key] !== undefined) {
					obj[key] = data[key];
				}
			});

			return data;
		}

		// Clamp a value between min and max
		function confine(value, min, max) {
			return Math.min(max, Math.max(value, min));
		}

		// Snap a value to the closest multiple of a step
		function toNearest(value, base) {
			return Math.round(value / base) * base;
		}

		// Convert a number to a fixed number of DP
		function toDp(value, numDp) {
			return parseFloat(value).toFixed(numDp);
		}

		// Position handle along track based on value given
		function positionFromValue(handle, value, opt) {
			var track = $(handle).parent();

			$(handle).data('value', value);

			var normalised = (value - opt.min) / (opt.max - opt.min);

			handle.style.left = (normalised * 100) + '%';
		}

		// Position handle and store handle's converted value based on mouse position
		function positionFromMouse(handle, track, pagex, opt, otherHandle) {
			var $handle = $(handle);
			var handleWidth = handle.offsetWidth;
			var trackWidth = track.clientWidth;
			var handleX = pagex - track.offsetLeft - (handleWidth / 2);
			var handleWidthNormalised = handleWidth / trackWidth;
			var normalisedStepSize = 1 / ((opt.max - opt.min) / opt.step);

			var leftLimit = 0;
			var rightLimit = 1;

			// Limit handle ranges based on other handle's position (collision detection)
			if(otherHandle !== undefined) {
				var isFirst = $handle.index() === 0;

				if(isFirst) {
					rightLimit = parseFloat(otherHandle.style.left) / 100 - handleWidthNormalised;
				} else {
					leftLimit = parseFloat(otherHandle.style.left) / 100 + handleWidthNormalised;
				}
			}

			var handleNormalised = confine(toNearest(handleX / trackWidth, normalisedStepSize), leftLimit, rightLimit);
			var handleValue = opt.min + (opt.max - opt.min) * handleNormalised;

			$handle.data('value', handleValue);

			handle.style.left = (handleNormalised * 100) + '%';

			return handleValue;
		}

		function setRangeBar(track, leftHandle, rightHandle) {
			var bar = $(track).children('.range-bar')[0];
			var handleWidthPercent = leftHandle.offsetWidth / track.clientWidth * 100;
			var delta = parseFloat(rightHandle.style.left) - parseFloat(leftHandle.style.left);

			bar.style.left = leftHandle.style.left;
			bar.style.width = delta + '%';
		}

		function setSliderValue(handles, opt, input, label) {
			var firstHandle = toDp($(handles[0]).data('value'), opt.precision);
			var secondHandle = toDp($(handles[1]).data('value'), opt.precision);

			label.innerHTML = firstHandle;

			if(handles.length > 1) {
				label.innerHTML += ' &#8211; ' + secondHandle;
			}

			return firstHandle + (!isNaN(secondHandle) ? ',' + secondHandle : '');
		}

		// Start dragging the handle
		$('body').on('mousedown touchstart', function(e) {
			var elem = $(e.target);

			if(elem.hasClass('mrslyde-handle')) {
				e.preventDefault();

				elem.addClass('mousedown');

				// Add class to <html>
				$('html').addClass('slyding');

				// Add class to handle if touch enabled
				if(e.type === 'touchstart') {
					elem.addClass('touch');
				}

				focusedSlider = {
					handle: elem[0],
					track: elem.parent(),
					container: elem.closest('.mrslyde-container'),
					otherHandle: elem.siblings('.mrslyde-handle').first()[0]
				};
				focusedSlider.handles = focusedSlider.track.children('.mrslyde-handle').toArray();
				focusedSlider.opt = focusedSlider.track.data('mrslyde');
				focusedSlider.input = focusedSlider.container.prev();
				focusedSlider.label = focusedSlider.container.find('.center')[0];

				// Trigger event on input
				focusedSlider.input.trigger('slydestart');
			}
		});

		// Mouse move event. Raw JS for speed
		if(document.addEventListener !== undefined) {
			document.addEventListener('mousemove', onMove, false);
			document.addEventListener('touchmove', onMove, false);
		} else if(document.attachEvent) {
			document.attachEvent('onmousemove', onMove);
		}

		// Called on mouse move event
		function onMove(e) {
			if(document.documentElement.className.indexOf('slyding') > -1) {
				var handles = focusedSlider.handles;
				var opt = focusedSlider.opt;
				var pageX = e.pageX || e.clientX || e.touches[0].clientX;

				positionFromMouse(focusedSlider.handle, focusedSlider.track[0], pageX, opt, focusedSlider.otherHandle);

				if(opt.range) {
					setRangeBar(focusedSlider.track[0], handles[0], handles[1]);
				}

				focusedSlider.input[0].value = setSliderValue(handles, opt, focusedSlider.input, focusedSlider.label);

				// Trigger event
				focusedSlider.input.trigger('slydechange');
			}
		}

		// Stop dragging the handle
		$('body').on('mouseup touchend', function() {
			if(focusedSlider === null) {
				return false;
			}

			// Trigger event
			focusedSlider.input.trigger('slydeend');

			$('.mrslyde-handle').removeClass('mousedown touch');

			$('html').removeClass('slyding');

			focusedSlider = null;
		});

		// Set the handle positions if the original input's value changes
		$('body').on('change', 'input.mrslyde', function() {
			var html = $(this).next();
			var handles = html.find('.mrslyde-handle');
			var opt = html.find('.track').data('mrslyde');

			opt.value = this.value.split(',');

			handles.each(function(index) {
				opt.value[index] = confine(parseFloat(opt.value[index]), opt.min, opt.max);

				positionFromValue(this, opt.value[index], opt);
			});

			// If this is a range slider, set the range bar indicator
			if(handles.length === 2) {
				setRangeBar(html.find('.track')[0], handles[0], handles[1]);
			}

			// Set input's value again to confine number range
			this.value = opt.value.join(',');

			setSliderValue(handles, opt, this, $(this).next().find('.center'));
		});

		// Initialise the slider
		function init(input, opt) {
			var html = markup.clone();
			var handle = html.find('.mrslyde-handle');

			// If range slider, clone another handle
			if(opt.range) {
				var newHandle = handle.clone();

				handle.after(newHandle);

				html.find('.track').append($('<div />').addClass('range-bar'));
			}

			input.addClass('mrslyde').hide().after(html);

			// Set up labels
			html.find('.left').text(opt.min);
			html.find('.right').text(opt.max);

			// Store options in slider track
			handle.parent().data('mrslyde', opt);

			var handles = html.find('.mrslyde-handle');

			handles.each(function(index) {
				opt.value[index] = confine(parseFloat(opt.value[index]), opt.min, opt.max);

				positionFromValue(this, opt.value[index], opt);
			});

			// If this is a range slider, set the range bar indicator
			if(handles.length === 2) {
				setRangeBar(html.find('.track')[0], handles[0], handles[1]);
			}

			setSliderValue(handles, opt, input, html.find('.center')[0]);
		}

		return this.each(function() {
			var settings = $.extend({}, defaults, getDataOptions($(this)), options);

			settings.min = toNearest(settings.min, settings.step);
			settings.max = toNearest(settings.max, settings.step);

			settings.value = this.value.split(',');

			if(!settings.value[0].length) {
				settings.value = [ settings.max - ((settings.max - settings.min) / 2) ];
			}

			init($(this), settings);
		});
	};
})(jQuery);