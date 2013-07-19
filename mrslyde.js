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
	function isDOMAttrModifiedSupported() {
		var p = document.createElement('p');
		var flag = false;

		if(p.addEventListener) {
			p.addEventListener('DOMAttrModified', function() {
				flag = true
			}, false);
		} else if(p.attachEvent) {
			p.attachEvent('onDOMAttrModified', function() {
				flag = true
			});
		} else {
			return false;
		}

		p.setAttribute('id', 'target');

		return flag;
   }

   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

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

		var markup = $('<div class="mrslyde">\
			<div class="slider">\
				<a class="handle"></a><div class="track"></div>\
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

			return handle.style.left = (track[0].offsetWidth - handle.offsetWidth) * ((value - opt.min) / (opt.max - opt.min));
		}

		var valueFromPosition = function(handle, opt) {
			return opt.min + ((opt.max - opt.min) * (handle.position().left / (handle.nextAll('.track').outerWidth() - handle.outerWidth())));
		}

		// Set position of handle from mouse position
		var positionFromMouse = function(container, opt, pagex, el) {
			var handle = el !== undefined ? el : container.find('.handle').first();
			var handleWidth = handle.outerWidth();
			var track = handle.nextAll('.track');
			var trackWidth = track[0].offsetWidth - handleWidth;

			var minLeft = track.offset().left + (handleWidth / 2);
			var maxLeft = minLeft + track[0].offsetWidth - handleWidth;

			var offset = confine(pagex, minLeft, maxLeft) - minLeft;

			// Snapping
			if(opt.snap) {
				offset = toNearest(offset, trackWidth / ((opt.max - opt.min) / opt.stepSize));
			}

			return offset;
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
			var track = thisHandle.nextAll('.track');
			var trackWidth = track[0].offsetWidth - handleWidth;

			var rightLimit = isFirst ? thatHandle.offset().left - handleWidth : track.offset().left + trackWidth;
			var leftLimit = isFirst ? track.offset().left : thatHandle.offset().left + handleWidth;

			return confine(pagex - handleWidth / 2, leftLimit, rightLimit) - track.offset().left;
		}

		var setRangeBar = function(leftHandle, rightHandle) {
			var track = leftHandle.nextAll('.track');
			var bar = track.children()[0];

			bar.style.left = (leftHandle.position().left + leftHandle[0].offsetWidth / 2) + 'px';
			bar.style.right = (track[0].clientWidth - rightHandle.position().left - rightHandle[0].offsetWidth / 2) + 'px';
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

				handle.css({ left: positionFromValue(values[0], input.next(), handle[0]) });
				newHandle.css({ left: positionFromValue(values[1], input.next(), newHandle[0]) });

				setRangeBar(handle, newHandle);
			} else {
				// Set handle to initial position, and value display
				setValue(opt.defaultValue, input, opt);
				html.find('.handle').css({ left: positionFromValue(input.val(), input.next()) });
			}
		};

		// Unbind events to prevent duplicates
		$('body').off('.mrslyde');

		// Bind events
		$('body').on('mousedown touchstart', function(e) {
			var elem = $(e.target);

			if(elem.hasClass('handle')) {
				e.preventDefault();

				// Cache container
				focusedSlider = {
					input: elem.closest('.mrslyde').prev(),
					container: elem.closest('.mrslyde'),
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
						handle[0].style.left = checkCollisions(handle, container.find('.handle').not('.mousedown'), pageX) + 'px';

						var rangeUpper = container.find('.range-upper');
						var rangeLower = container.find('.range-lower');

						setRangeBar(rangeLower, rangeUpper);

						var lower = valueFromPosition(rangeLower, opt);
						var upper = valueFromPosition(rangeUpper, opt);

						setValue([ lower, upper ], focusedSlider.input, opt);
					} else {
						handle[0].style.left = positionFromMouse(container, opt, pageX, handle) + 'px';

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

/*
A simple jQuery function that can add listeners on attribute change.
http://meetselva.github.io/attrchange/

About License:
Copyright (C) 2013 Selvakumar Arumugam
You may use attrchange plugin under the terms of the MIT Licese.
https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
*/
(function($) {
   function isDOMAttrModifiedSupported() {
		var p = document.createElement('p');
		var flag = false;

		if (p.addEventListener) p.addEventListener('DOMAttrModified', function() {
			flag = true
		}, false);
		else if (p.attachEvent) p.attachEvent('onDOMAttrModified', function() {
			flag = true
		});
		else return false;

		p.setAttribute('id', 'target');

		return flag;
   }
   
   function checkAttributes(chkAttr, e) {
		if (chkAttr) {
			var attributes = this.data('attr-old-value');

			if (e.attributeName.indexOf('style') >= 0) {
				if (!attributes['style']) attributes['style'] = {}; //initialize
				var keys = e.attributeName.split('.');
				e.attributeName = keys[0];
				e.oldValue = attributes['style'][keys[1]]; //old value
				e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
				attributes['style'][keys[1]] = e.newValue;
			} else {
				e.oldValue = attributes[e.attributeName];
				e.newValue = this.attr(e.attributeName);
				attributes[e.attributeName] = e.newValue; 
			}

			this.data('attr-old-value', attributes); //update the old value object
		}	   
   }

   //initialize Mutation Observer
   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

   $.fn.attrchange = function(o) {

		var cfg = {
			trackValues: false,
			callback: $.noop
		};

		//for backward compatibility
		if (typeof o === "function" ) { 
			cfg.callback = o; 
		} else { 
			$.extend(cfg, o); 
		}

	    if (cfg.trackValues) { //get attributes old value
	    	$(this).each(function (i, el) {
	    		var attributes = {};
	    		for (var attr, i=0, attrs=el.attributes, l=attrs.length; i<l; i++){
	    		    attr = attrs.item(i);
	    		    attributes[attr.nodeName] = attr.value;
	    		}

	    		$(this).data('attr-old-value', attributes);
	    	});
	    }

		if (MutationObserver) { //Modern Browsers supporting MutationObserver
			/*
			   Mutation Observer is still new and not supported by all browsers. 
			   http://lists.w3.org/Archives/Public/public-webapps/2011JulSep/1622.html
			*/
			var mOptions = {
				subtree: false,
				attributes: true,
				attributeOldValue: cfg.trackValues
			};

			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(e) {
					var _this = e.target;

					//get new value if trackValues is true
					if (cfg.trackValues) {
						/**
						 * @KNOWN_ISSUE: The new value is buggy for STYLE attribute as we don't have 
						 * any additional information on which style is getting updated. 
						 * */
						e.newValue = $(_this).attr(e.attributeName);
					}

					cfg.callback.call(_this, e);
				});
			});

			return this.each(function() {
				observer.observe(this, mOptions);
			});
		} else if (isDOMAttrModifiedSupported()) { //Opera
			//Good old Mutation Events but the performance is no good
			//http://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/
			return this.on('DOMAttrModified', function(event) {
				if (event.originalEvent) event = event.originalEvent; //jQuery normalization is not required for us 
				event.attributeName = event.attrName; //property names to be consistent with MutationObserver
				event.oldValue = event.prevValue; //property names to be consistent with MutationObserver 
				cfg.callback.call(this, event);
			});
		} else if ('onpropertychange' in document.body) { //works only in IE		
			return this.on('propertychange', function(e) {
				e.attributeName = window.event.propertyName;
				//to set the attr old value
				checkAttributes.call($(this), cfg.trackValues , e);
				cfg.callback.call(this, e);
			});
		}

		return this;
    }
})(jQuery);