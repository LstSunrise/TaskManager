'use strict';

let gulp = require('gulp');
let babel = require('gulp-babel');
let concat = require('gulp-concat');
let imagemin = require('gulp-imagemin');
let sass = require('gulp-sass');
let clean = require('gulp-clean');
let browserify = require('browserify');
let source = require('vinyl-source-stream');
let gtap = require('gulp-tap');


gulp.task('sass', ['clean'], function () {
    return gulp
        .src('src/client/app/*.scss')
        .pipe(concat('main.scss'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('src/server/static'))
});

gulp.task("babel", function(){
    return gulp
        .src("src/client/app/*.jsx")
    	.pipe(babel())
    	.pipe(gulp.dest('src/server/static/'))
});

gulp.task('images', function() {
    return gulp
        .src('src/client/app/*.jpg')
        .pipe(imagemin())
        .pipe(gulp.dest('src/server/static'));
});

gulp.task('bower', ['sass'], function(){
    return gulp.src(['src/server/static/*.css','bower_components/materialize/dist/css/materialize.min.css', 'bower_components/sweetalert/dist/sweetalert.css'])
        .pipe(concat('main.css'))
        .pipe(gulp.dest('src/server/static'));
});

gulp.task('build', function(){
    gulp.run('sass');
    gulp.run('bower');
    gulp.run('babel');
    gulp.run('images');
    gulp.run('browserify-1');
    gulp.run('browserify-2');
    gulp.run('clean');
    gulp.run('clean-scripts');

});

gulp.task('clean', function(){
    return gulp.src(['src/server/static/*.css', '!src/server/static/bundle.js', 'src/server/static/*.js'], {read:false})
        .pipe(clean())
});

gulp.task('clean-scripts', ['browserify-1','browserify-2'], function(){
    return gulp.src(['!src/server/static/bundle.js', 'src/server/static/*.js'], {read:false})
        .pipe(clean())
});

gulp.task('styles', function(){
    gulp.run('clean');
    gulp.run('sass');
    gulp.run('bower');
});

gulp.task('browserify-2',['babel', 'browserify-1'], function() {
    return browserify('src/server/static/app.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('src/server/static'));
});

gulp.task('browserify-1',['babel'], function() {
    return browserify('src/server/static/root.js')
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('src/server/static'));
});

gulp.task('watch', function() {
    gulp.run('build');
    gulp.watch('src/client/app/*.scss', ['styles']);
    gulp.watch('src/client/app/*.jsx', ['babel', 'browserify-1', 'browserify-2', 'clean-scripts']);
});

gulp.task('default', ['watch']);
