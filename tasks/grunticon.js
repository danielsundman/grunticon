/*
 * grunticon
 * https://github.com/filamentgroup/grunticon
 *
 * Copyright (c) 2012 Scott Jehl, Filament Group, Inc
 * Licensed under the MIT license.
 */
(function(){
	"use strict";
module.exports = function(grunt ) {

	var uglify = require("uglify-js");

	grunt.registerTask( 'grunticon', 'A mystical CSS icon solution.', function() {

		// just a quick starting message
		grunt.log.write( "Look, it's a grunticon!\n" );

		// get the config
		var config = grunt.config.get( "grunticon" );

		// fail if config or no src or dest config
		if( !config || config.src === undefined || config.dest === undefined ){
			grunt.fatal( "Oops! Please provide grunticon configuration for src and dest in your Gruntfile.js file" );
			return;
		}

		// make sure src and dest have / at the end
		if( !config.src.match( /\/$/ ) ){
				config.src += "/";
		}
		if( !config.dest.match( /\/$/ ) ){
				config.dest += "/";
		}

		var asyncCSS = __dirname + "/grunticon/static/grunticon.loader.js";
		var asyncCSSBanner = __dirname + "/grunticon/static/grunticon.loader.banner.js";
		var previewHTMLsrc = __dirname + "/grunticon/static/preview.html";

		// CSS filenames with optional mixin from config
		var datasvgcss = config.datasvgcss || "icons.data.svg.css";
		var datapngcss = config.datapngcss || "icons.data.png.css";
		var urlpngcss = config.urlpngcss || "icons.fallback.css";

		//filename for generated output preview HTML file
		var previewhtml = config.previewhtml || "preview.html";

		//filename for generated loader HTML snippet file
		var loadersnippet = config.loadersnippet || "grunticon.loader.txt";

		// css references base path for the loader
		var cssbasepath = config.cssbasepath || "/";

		// folder name (within the output folder) for generated png files
		var pngfolder = config.pngfolder || "png/";
		// make sure pngfolder has / at the end
		if( !pngfolder.match( /\/$/ ) ){
				pngfolder += "/";
		}

		// if we should generate high dpi fallback png icons and which resolutions
		var pngpixelratio = config.pngpixelratio || [1]; // example for other densities [1,1.5,2]

		// css class prefix
		var cssprefix = config.cssprefix || "icon-";

		// create the output directory
		grunt.file.mkdir( config.dest );

		// create the output icons directory
		grunt.file.mkdir( config.dest + pngfolder );

		// minify the source of the grunticon loader and write that to the output
		grunt.log.write( "\ngrunticon now minifying the stylesheet loader source." );
		var banner = grunt.file.read( asyncCSSBanner );
        var asyncsrcMinified = uglify.minify( asyncCSS );
		var min = banner + "\n" + asyncsrcMinified.code;
		var loaderCodeDest = config.dest + loadersnippet;
		grunt.file.write( loaderCodeDest, min );
		grunt.log.write( "\ngrunticon loader file created." );

		// take it to phantomjs to do the rest
		grunt.log.write( "\ngrunticon now spawning phantomjs." );

		var done = this.async();
		grunt.util.spawn({
			cmd: require('phantomjs').path,
			args: [
				__dirname + '/grunticon/phantom.js',
				config.src,
				config.dest,
				loaderCodeDest,
				previewHTMLsrc,
				datasvgcss,
				datapngcss,
				urlpngcss,
				previewhtml,
				pngfolder,
				cssprefix,
				cssbasepath,
				pngpixelratio
			],
			fallback: ''
		}, function(err) {
			if (err) {
				grunt.log.write("\nSomething went wrong with phantomjs...\n" + err);
				return done();
			}
			grunt.log.write("OK!");
			return done();
		});

		var progress = function() {
			grunt.log.write(".");
			setTimeout(progress, 1000);
		};
		progress();

	});
};
})();
