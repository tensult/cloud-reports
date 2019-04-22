var gulp = require('gulp');

gulp.task('copy-ejs', function(){
    return gulp.src("src/reporters/**/*.ejs")
    .pipe(gulp.dest('dist/reporters/'));
});