module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			default: {
				options: {
					banner: '/*! MrSlyde jQuery plugin version <%= pkg.version %> (https://github.com/jamwaffles/MrSlyde), compiled on <%= grunt.template.today("dd/mm/yyyy") %> */\n',
					mangle: true,
					compress: {
						sequences: true,
						dead_code: true,
						conditionals: true,
						evaluate: true,
						booleans: true,
						loops: true,
						unused: true,
						if_return: true,
						join_vars: true,
						cascade: true
					},
					warnings: false,
					preserveComments: false
				},
				files: {
					'mrslyde.min.js': 'mrslyde.js'
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Development tasks
	grunt.registerTask('default', [ 'uglify:default' ]);
};