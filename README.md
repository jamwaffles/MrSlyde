# MrSlyde

MrSlyde is a lightweight jQuery slider plugin. It is designed to be easily stylable with CSS, and seamlessly integrate with the `<input>` it is bound to.

**MrSlyde requires jQuery 1.7 or higher, as it uses the `$.on()` and `$.off()` functions intriduced in this version.**

# Usage

To use MrSlyde, simply apply it to the `<input>` elements you like with a selector:

    $('input.foo').mrslyde();

## Specifying Default Options

All options made available by MrSlyde can be seen under Options

Setting default options is done by passing an object to the plugin:

	$('input.foo').mrslyde({
		min: 10,
		max: 30,
		defaultValue: 20
	});

The example above will set all matched sliders to a range of 10-30 with a default of 20.

## Specifying Per-input Options

This is perhaps the most useful feature of MrSlyde. If multiple sliders are required, but each with different properties, HTML5 `data-` attributes can be used. To avoid pollution, all MrSlyde attributes are prefixed with `ms`. Again, all options can be found under Options.

A basic example might look like this:

	<input class="foo" data-msMin="150" data-msMax="300" data-msStepSize="15" value="175">

This will (when `$.mrslyde` is invoked) produce a slider with a range of 150-300 with a step size of 15 and a default (starting) value of 175.

# Options

Below are all the options that can be passed to MrSlyde, either as defaults or `data-` attributes. Both types as well as the default values are shown.

Note that any `data-` attributes are lowercased by jQuery, so camel case isn't necessary.

- **min** (_data-msMin_): 100

	Specifies the minimum value the slider can be set to.

- **max** (_data-msMax_): 200

	Specifies the maximum value the slider can be set to.

- **defaultValue** (_value_): 150

	What the default value of the slider should be when `$.mrslyde` is invoked. **Note that this uses the `<input>`'s `value` attribute instead of a `data-` attribute.**

- **stepSize** (_data-msStepSize_): 10

	Sets to which multiple the slider value should snap to. For example, a value of `15` will increment the slider's value in steps of 15. **Setting actual handle snap is defined by the `snap:` option, below.**

- **snap** (_data-msSnap_): true

	If set to true, this will tell the handle to 'jump' to each step point along the slider track, instead of following the mouse pixel for pixel.

- **showValues** (_data-msShowValues_): true

	Specifies whether the minimum, current and maximum values should be displayed under the slider track.

- **precision** (_data-msPrecision_): 0

	Specifies how many digits should be present after the decimal point. For whole values, leave this at `0`. For values less than 1, this option _must_ be set to **less than 1**.

# TODO

- Range slider

### Added Thu 18th Jul 2013

- Minified version
- Grunt build script

### Added Sat 17th Dec 2012

- Handle snapping
- Code optimisations (it runs well at present, but I'd like it to run faster)