/**********************************************
 *                                            *
 * MrSlyde 1.1.0                              *
 *                                            *
 * James Waples (jamwaffles@gmail.com)        *
 *                                            *
 * http://www.jamwaffles.co.uk/jquery/mrslyde *
 *                                            *
 * https://github.com/jamwaffles/MrSlyde      *
 *                                            *
 **********************************************/

(function($) {
	var focusedSlider = null;		// Cache object for currently moving slider

	// Create some values, extending them with any options that were provided
	var defaults = {
		min: 0,
		max: 100,
		step: 10,
		snap: true,
		labels: true,
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

	// Clamp a value between min and max
	function confine(value, min, max) {
		return Math.min(max, Math.max(value, min));
	}

	// Snap a value to the closest multiple of a step
	function toNearest(value, base) {
		return Math.round(value / base) * base;
	}

	function setRangeBar(track, leftHandle, rightHandle) {
		var bar = $(track).children('.range-bar')[0];
		var handleWidthPercent = leftHandle.offsetWidth / track.clientWidth * 100;
		var delta = rightHandle.mrslyde.left - leftHandle.mrslyde.left;

		bar.style.left = leftHandle.mrslyde.left + '%';
		bar.style.width = delta + '%';
	}

	function setSliderValue(handles, opt, input, label) {
			var firstHandle = parseFloat($(handles[0]).data('value')).toFixed(opt.precision);
			var secondHandle = parseFloat($(handles[1]).data('value')).toFixed(opt.precision);

			label.innerHTML = firstHandle;

			if(handles.length > 1) {
				label.innerHTML += ' &#8211; ' + secondHandle;
			}

			return firstHandle + (!isNaN(secondHandle) ? ',' + secondHandle : '');
		}

	// Start dragging the handle
	$(document).on('mousedown.mrslyde touchstart.mrslyde', '.mrslyde-handle', function(e) {
		e.preventDefault();
		e.cancelBubble = true;
		e.returnValue = false;

		$(this).addClass('mousedown');

		// Add class to handle if touch enabled
		if(e.type === 'touchstart') {
			$(this).addClass('touch');
		}

		// Cache a load of properties so they don't have to be recalculated for every move event
		focusedSlider = {
			handle: this,
			track: this.parentNode,
			container: $(this).closest('.mrslyde-container'),
			otherHandle: $(this).siblings('.mrslyde-handle').first()[0]
		};
		focusedSlider.handles = $(focusedSlider.track).children('.mrslyde-handle').toArray();
		focusedSlider.opt = $(focusedSlider.track).data('mrslyde');
		focusedSlider.input = focusedSlider.container.prev();
		focusedSlider.label = focusedSlider.container.find('.center')[0];

		// Elements and maths specifically for the move event
		var props = {
			handle: $(this),
			handleWidth: this.offsetWidth,
			trackWidth: focusedSlider.track.clientWidth
		};
		props.handleWidthNormalised = props.handleWidth / props.trackWidth;

		focusedSlider.opt.props = props;

		// Trigger event on input
		focusedSlider.input.trigger('slydestart');

		// Listen for move events
		$(document).on('mousemove.mrslyde touchmove.mrslyde', onMove);
	});

	// Called on mouse move event
	function onMove(e) {
		// Don't do anything if no slider is focused
		if(focusedSlider === null) {
			return;
		}

		e.preventDefault();

		e = e.originalEvent;

		var handles = focusedSlider.handles;
		var opt = focusedSlider.opt;
		var pageX = (e.touches ? e.touches[0].pageX : e.pageX) || e.clientX;

		var props = opt.props;
		var handleX = pageX - focusedSlider.track.offsetLeft - (props.handleWidth / 2);
		var leftLimit = 0;
		var rightLimit = 1;		

		// Limit handle ranges based on other handle's position (collision detection)
		if(focusedSlider.otherHandle !== undefined) {
			if(props.handle.index() === 0) {
				rightLimit = (focusedSlider.otherHandle.mrslyde.left / 100) - props.handleWidthNormalised;
			} else {
				leftLimit = (focusedSlider.otherHandle.mrslyde.left / 100) + props.handleWidthNormalised;
			}
		}

		var handleNormalised = handleX / props.trackWidth;

		if(opt.snap) {
			handleNormalised = toNearest(temp, opt.normalisedStepSize);
		}

		handleNormalised = confine(handleNormalised, leftLimit, rightLimit);
		var handleValue = opt.min + (opt.max - opt.min) * handleNormalised;

		props.handle.data('value', handleValue);

		focusedSlider.handle.mrslyde.left = (handleNormalised * 100);

		focusedSlider.handle.style.left = focusedSlider.handle.mrslyde.left + '%';

		if(opt.range) {
			setRangeBar(focusedSlider.track, handles[0], handles[1]);
		}

		focusedSlider.input[0].value = setSliderValue(handles, opt, focusedSlider.input, focusedSlider.label);

		// Trigger event
		focusedSlider.input.trigger('slydechange');
	}

	// Stop dragging the handle
	$(document).on('mouseup touchend', function() {
		if(focusedSlider === null) {
			return;
		}

		// Stop listening for move events
		$(document).off('mousemove.mrslyde touchmove.mrslyde');

		// Trigger event
		focusedSlider.input.trigger('slydeend');

		$('.mrslyde-handle').removeClass('mousedown touch');

		focusedSlider = null;
	});

	// Set the handle positions if the original input's value changes
	$(document).on('change', 'input.mrslyde', function() {
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

	$.fn.mrslyde = function(options) {
		// Get options from data-* attributes
		function getDataOptions(input) {
			var obj = {};
			var data = input.data();

			$.each(defaults, function(key) {
				if(data[key] !== undefined) {
					obj[key] = data[key];
				}
			});

			return obj;
		}

		// Position handle along track based on value given
		function positionFromValue(handle, value, opt) {
			var track = $(handle).parent()[0];

			$(handle).data('value', value);

			var normalised = (value - opt.min) / (opt.max - opt.min);

			handle.mrslyde.left = (normalised * 100);

			handle.style.left = handle.mrslyde.left + '%';
		}

		// Initialise the slider
		function init(input, opt) {
			if(input.data('mrslyde-init') === true) {
				return;
			}

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
				this.mrslyde = {};

				opt.value[index] = confine(parseFloat(opt.value[index]), opt.min, opt.max);

				positionFromValue(this, opt.value[index], opt);
			});

			// If this is a range slider, set the range bar indicator
			if(handles.length === 2) {
				setRangeBar(html.find('.track')[0], handles[0], handles[1]);
			}

			setSliderValue(handles, opt, input, html.find('.center')[0]);

			// Hide labels if told to do so
			if(!opt.labels) {
				html.find('.values').hide();
			}

			input.data('mrslyde-init', true);
		}

		return this.each(function() {
			var settings = $.extend({}, defaults, options, getDataOptions($(this)));

			settings.min = toNearest(settings.min, settings.step);
			settings.max = toNearest(settings.max, settings.step);

			if(settings.value.indexOf(',') > -1) {
				settings.value = settings.value.split(',');
			}

			settings.value = this.value.length ? this.value.split(',') : settings.value;

			if(settings.value === undefined) {
				if(settings.range) {
					settings.value = [ settings.min, settings.max ];
				} else {
					settings.value = [ settings.max - ((settings.max - settings.min) / 2) ];
				}
			}

			settings.normalisedStepSize = 1 / ((settings.max - settings.min) / settings.step);

			init($(this), settings);
		});
	};
})(jQuery);