(function($) {
	$.fn.mrslyde = function(options) {
		// Create some defaults, extending them with any options that were provided
		var settings = $.extend( {
			min: 100,
			max: 200,
			default: 150,
			stepSize: 10,
			snap: true,
			showValues: true
		}, options);

		var markup = $('<div class="mrslyde">
			<div class="slider">
				<div class="track"></div>
				<div class="handle"></div>
			</div>
			<div class="values">
				<span class="left"></span>
				<span class="center"></span>
				<span class="right"></span>
			</div>
		</div>');

		var configure = function(input) {

		}

		var init = function(input) {

		}

		return this.each(function() {
			var input = $(this);
			var html = markup.clone();


			// Unbind events to prevent duplicates
			//$('body').off);

			// Bind events
			$
		});
	};
})(jQuery);