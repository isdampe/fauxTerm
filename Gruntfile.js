module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		//Minify JS.
		uglify: {
			js: {
				options: {
					sourceMap: true
				},
				files: {
					'build/fauxterm.min.js': ['src/fauxterm.js']
				}
			}
		},

		//CSS Min
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'build/fauxterm-noprefix.min.css': ['src/fauxterm.css']
				}
			}
		},	

		//Configure autoprefixer
		autoprefixer: {
			options: {
				browsers: ['last 50 versions', 'ie 6', 'ie 7', 'ie 8', 'ie 9'],
				map: true
			},
			dist: {
				files: {
					'build/fauxterm.min.css': 'build/fauxterm-noprefix.min.css'
				}
			}
		},

		//Configure watch
		watch: {
			scss: {
				files: ['src/*.css'],
				tasks: ['cssmin', 'autoprefixer'],
				options: {
					debounceDelay: 100,
				},
			},
			scripts: {
				files: 'src/*.js',
				tasks: ['uglify'],
				options: {
					debounceDelay: 100,
				},
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['uglify', 'cssmin', 'autoprefixer']);

};
