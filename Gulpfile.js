"use strict";

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync').create();
var app = {};
var config = {
    npmDir: 'node_modules',
    assetsDir: 'assets',
    distDir: 'dist',
    scssPattern: 'scss/**/*.scss',
    jsPattern: 'js/**/*.js',
    imgPattern: 'img/**/*.{jpg,jpeg,png,gif}',
    production: !!plugins.util.env.production,
    sourceMaps: !plugins.util.env.production
};

// ************* //
// * FUNCTIONS * //
// ************* //

app.compileStyle = function (paths, outputFilename) {
    return gulp.src(paths)
        // Don't exit process on bugs (for watch)
        .pipe(plugins.if(!config.production, plugins.plumber()))
        // Init sourcemaps on dev
        .pipe(plugins.if(config.sourceMaps, plugins.sourcemaps.init()))
        // Transpiling SCSS to CSS
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        // Parse CSS and add vendor prefixes to rules by "Can I Use"
        .pipe(plugins.autoprefixer())
        // Concat * files to one output
        .pipe(plugins.concat('css/' + outputFilename))
        // Minify CSS on prod
        .pipe(plugins.if(config.production, plugins.cleanCss()))
        // Create sourcemaps on dev
        .pipe(plugins.if(config.sourceMaps, plugins.sourcemaps.write('.')))
        // Destination folder
        .pipe(gulp.dest(config.distDir));
};

app.compileScript = function (paths, outputFilename) {
    return gulp.src(paths)
        // Don't exit process on bugs (for watch)
        .pipe(plugins.if(!config.production, plugins.plumber()))
        // Init sourcemaps on dev
        .pipe(plugins.if(config.sourceMaps, plugins.sourcemaps.init()))
        // Concat * files to one output
        .pipe(plugins.concat('js/' + outputFilename))
        // Minify JS on prod
        .pipe(plugins.if(config.production, plugins.uglify()))
        // Create sourcemaps on dev
        .pipe(plugins.if(config.sourceMaps, plugins.sourcemaps.write('.')))
        // Destination folder
        .pipe(gulp.dest(config.distDir));
};

app.copy = function (srcFiles, outputDir) {
    gulp.src(srcFiles)
        .pipe(gulp.dest(outputDir));
};

// ********* //
// * TASKS * //
// ********* //

gulp.task('styles', function () {
    app.compileStyle([
        config.assetsDir + '/scss/app.scss'
    ], 'app.css');
});

gulp.task('scripts', function () {
    app.compileScript([
        config.npmDir + '/bootstrap/dist/js/bootstrap.js',
        config.npmDir + '/holderjs/holder.js'
    ], 'vendor.js');

    app.compileScript([
        config.assetsDir + '/js/app.js'
    ], 'app.js');
});

gulp.task('images', function () {
    gulp.src(config.assetsDir + '/' + config.imgPattern)
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(config.distDir + '/img'));
});

gulp.task('fonts', function () {
    app.copy([
        config.npmDir + '/font-awesome/fonts/*'
    ], config.distDir + '/font');
});

gulp.task('clean', function () {
    del.sync(config.distDir + '/css/*');
    del.sync(config.distDir + '/font/*');
    del.sync(config.distDir + '/img/*');
    del.sync(config.distDir + '/js/*');
});

gulp.task('watch', ['default'], function () {
    gulp.watch(config.assetsDir + '/' + config.scssPattern, ['styles']);
    gulp.watch(config.assetsDir + '/' + config.jsPattern, ['scripts']);
    gulp.watch(config.assetsDir + '/' + config.imgPattern, ['images']);
});

gulp.task('serve', ['default'], function() {
    setTimeout(function () {
        browserSync.init({
            server: "./dist"
        })
    }, 1000);

    gulp.watch(config.distDir + '/**/*').on('change', browserSync.reload);
});

gulp.task('default', ['clean', 'styles', 'scripts', 'images', 'fonts']);
