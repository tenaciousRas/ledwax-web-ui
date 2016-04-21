'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
	ssdAppConfig: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: [
                '<%= ssdAppConfig.app %>/app/js/{,*/}*.js',
                '<%= ssdAppConfig.app %>/app/lib/{,*/}*.js'
                ],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/unit/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      css: {
        files: ['<%= ssdAppConfig.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:css', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= ssdAppConfig.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
          '<%= ssdAppConfig.app %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= ssdAppConfig.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= ssdAppConfig.app %>/app/js/{,*/}*.js',
          '<%= ssdAppConfig.app %>/app/lib/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/unit/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= ssdAppConfig.dist %>/{,*/}*',
            '!<%= ssdAppConfig.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= ssdAppConfig.app %>/index.html'],
        ignorePath:  /\.\.\//
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= ssdAppConfig.dist %>/js/{,*/}*.js',
          '<%= ssdAppConfig.dist %>/css/{,*/}*.css',
          '<%= ssdAppConfig.dist %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= ssdAppConfig.dist %>/img/{,*/}ssd_logo*.{png,jpg,jpeg,gif,webp,svg}',
          '!<%= ssdAppConfig.dist %>/img/slides{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= ssdAppConfig.dist %>/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= ssdAppConfig.app %>/index.html',
      options: {
        dest: '<%= ssdAppConfig.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= ssdAppConfig.dist %>/{,*/}*.html'],
      css: ['<%= ssdAppConfig.dist %>/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= ssdAppConfig.dist %>','<%= ssdAppConfig.dist %>/img']
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
//    cssmin: {
//       dist: {
//         files: {
//           '<%= ssdAppConfig.dist %>/css/main.css': [
//             '.tmp/css/{,*/}*.css'
//           ]
//         }
//       }
//    },
//    uglify: {
//       dist: {
//         files: {
//           '<%= ssdAppConfig.dist %>/js/scripts.js': [
//             '<%= appConfig.dist %>/js/scripts.js'
//           ]
//         }
//       }
//    },
//    concat: {
//       dist: {}
//    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= ssdAppConfig.app %>/img',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= ssdAppConfig.dist %>/img'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= ssdAppConfig.app %>/img',
          src: '{,*/}*.svg',
          dest: '<%= ssdAppConfig.dist %>/img'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= ssdAppConfig.dist %>',
          src: ['*.html', 'partials/{,*/}*.html'],
          dest: '<%= ssdAppConfig.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/js',
          src: ['*.js', '!oldieshim.js'],
          dest: '.tmp/concat/js'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= ssdAppConfig.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= ssdAppConfig.app %>',
          dest: '<%= ssdAppConfig.dist %>',
          src: [
            '.htaccess',
            '*.{ico,png,txt}',
            '*.html',
            'partials/{,*/}*.html',
            'l10n/{,*/}*.json',
            'img/{,*/}*.{webp}',
            'fonts/{,*/}*.*',
            '*.xml',
            '*.php',
            '!*template.php',
            'pdf/{,*/}*.*',
          ]
        }, {
          expand: true,
          cwd: '.tmp/img',
          dest: '<%= ssdAppConfig.dist %>/img',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap-css/',
          src: 'fonts/*',
          dest: '<%= ssdAppConfig.dist %>'
        }]
      },
      css: {
        expand: true,
        cwd: '<%= ssdAppConfig.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:css'
      ],
      test: [
        'copy:css'
      ],
      dist: [
        'copy:css',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: './config/karma.conf.js',
        singleRun: true
      }
    },

    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
        }
      },
    });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
