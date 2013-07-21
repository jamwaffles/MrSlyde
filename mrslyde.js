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

			var normalised = (value - opt.min) / (opt.max - opt.min);

			handle.style.left = (normalised * 100) + '%';
		}

		// Position handle and store handle's converted value based on mouse position
		function positionFromMouse(handle, track, pagex, opt) {
			var handleWidth = handle.offsetWidth;
			var handleX = pagex - track.offsetLeft - (handleWidth / 2);
			var handlePercentage = confine((handleX / track.clientWidth) * 100, 0, 100);

			var handleValue = opt.min + (opt.max - opt.min) * handlePercentage;

			$(handle).data('value', handleValue);

			handle.style.left = confine(handlePercentage, 0, 100) + '%';

			return handleValue;
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
					handle: elem,
					track: elem.parent()
				};
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
				(e.preventDefault) ? e.preventDefault() : e.returnValue = false;

				var pageX = e.pageX || e.clientX || e.touches[0].clientX;

				positionFromMouse(focusedSlider.handle[0], focusedSlider.track[0], pageX, focusedSlider.track.data('mrslyde'));
			}
		}

		// Stop dragging the handle
		$('body').on('mouseup touchend', function() {
			if(focusedSlider === null) {
				return false;
			}

			focusedSlider.handle.removeClass('mousedown touch');

			$('html').removeClass('slyding');

			focusedSlider = null;
		});

		$('body').on('change', 'input.mrslyde', function() {
			
		});

		// Initialise the slider
		function init(input, opt) {
			var html = markup.clone();
			var handle = html.find('.mrslyde-handle');

			// If range slider, clone another handle
			if(opt.range) {
				var newHandle = handle.clone();

				handle.after(newHandle);
			}

			// Store options in slider track
			handle.parent().data('mrslyde', opt);

			input.after(html);

			html.find('.mrslyde-handle').each(function(index) {
				positionFromValue(this, opt.value[index], opt);
			});
		}

		return this.each(function() {
			var settings = $.extend({}, defaults, getDataOptions($(this)), options);

			settings.value = this.value.split(',');

			init($(this), settings);
		});
	};
})(jQuery);