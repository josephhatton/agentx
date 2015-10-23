//TODO: replace concat & uglify with browserify & browserify-shim
//https://www.npmjs.org/package/gulp-browserify
//https://github.com/thlorenz/browserify-shim

var gulp = require('gulp'),
	prefixer = require('gulp-autoprefixer'),
	minify = require('gulp-minify-css'),
	order = require('gulp-order'),
	concat = require('gulp-concat'),
	ngmin = require('gulp-ngmin'),
	clean = require('gulp-clean'),
	uglify = require('gulp-uglify'),
	html = require('gulp-html-replace'),
	exec = require('gulp-exec'),
    ftp = require('gulp-ftp');

	gulp.task('clean', function() {
		return gulp.src('build', {
			"read": false
		})
			.pipe(clean());
	});

gulp.task('copy', ['clean'], function() {
	return gulp.src('app/**')
		.pipe(gulp.dest('build'));
});

gulp.task('css', ['copy'], function() {
	return gulp.src('app/styles/*.css')
		.pipe(prefixer("last 1 version", "> 1%", "ie 9"))
		.pipe(minify())
		.pipe(concat('styles.css'))
		.pipe(gulp.dest('build/styles'));
});

gulp.task('js', ['css'], function() {
	//return gulp.src('app/scripts/**/*.js')
	return gulp.src([
		'app/scripts/setup.js',
		'app/scripts/routing.js',
		'app/scripts/modustri-dir.js',
		'app/scripts/filters.js',
		'app/scripts/services/setup.js',
		'app/scripts/services/customer.js',
		'app/scripts/services/inspection.js',
		'app/scripts/services/machine.js',
		'app/scripts/services/user.js',
		'app/scripts/services/auth.js',
		'app/scripts/services/password.js',
		'app/scripts/services/dealer.js',
		'app/scripts/services/utils.js',
		'app/scripts/controllers/navigation.js',
		'app/scripts/controllers/dashboard.js',
		'app/scripts/controllers/customers-list.js',
		'app/scripts/controllers/customer.js',
		'app/scripts/controllers/customer-add.js',
		'app/scripts/controllers/inspection.js',
		'app/scripts/controllers/inspections-list.js',
		'app/scripts/controllers/machines-list.js',
		'app/scripts/controllers/machine-add.js',
		'app/scripts/controllers/machine.js',
		'app/scripts/controllers/user.js',
		'app/scripts/controllers/settings.js',
		'app/scripts/controllers/login.js',
		'app/scripts/controllers/password.js'
	])
		.pipe(concat('app.js'))
		.pipe(gulp.dest('build/scripts'));
});

//doesnt minify, just prepares angular for it
gulp.task('ngmin', ['js'], function() {
	return gulp.src('build/scripts/**/*.js')
		.pipe(ngmin())
		.pipe(gulp.dest('build/scripts'));
});

gulp.task('uglify', ['ngmin'], function() {
	return gulp.src('build/scripts/app.js')
		.pipe(uglify({
			outSourceMap: true
		}))
		.pipe(gulp.dest('build/scripts'));
});

gulp.task('htmlreplace', ['uglify'], function() {
	return gulp.src('app/index.html')
		.pipe(html({
			'styles': 'styles/styles.css',
			'scripts': 'scripts/app.js'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('deploy', [], function(){
   gulp.src('build')
       .pipe(ftp({
           host: '162.209.61.245',
           user: 'portal',
           pass: 'sjkmrekmwm.mp45',
           remotePath: '/'
       }))
});

gulp.task('default', ['clean', 'copy', 'css', 'js', 'ngmin', 'uglify', 'htmlreplace']);