/* File: gulpfile.js */

// grab our gulp packages
var gulp   = require('gulp'),
    sass   = require('gulp-sass'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify');


// define the default task and add the watch task to it
gulp.task('default', ['watch']);

gulp.task('build-css', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(concat('styles.css'))
    .pipe(sass())
    .on('error', function(err) {
      notify().write(err);
      this.emit('end');
    })
    .pipe(gulp.dest('public/css'));
});

gulp.task('build', function() {
  gulp.start('build-css');
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['build-css']);
});
