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
					<span href="#" class="handle"></span>\
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


		// Bind events
		$('body').on('mousedown touchstart', function(e) {
			var elem = $(e.target);

			if(elem.hasClass('handle')) {
				e.preventDefault();

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

				
			}
		}

		$('body').on('mouseup touchend', function() {
			if(focusedSlider === null) {
				return false;
			}

			$('html').removeClass('slyding');

			focusedSlider = null;
		});

		$('body').on('change', 'input.mrslyde', function() {
			
		});

		return this.each(function() {
			
		});
	};
})(jQuery);