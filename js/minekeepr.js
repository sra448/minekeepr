$(function() {

  Minekeepr = {};

  Minekeepr.Field = function(x, y, board) {

    this.hasBomb = false;

    this.addBomb = function() {
      this.hasBomb = true;
    };

    this.getSurroundingFields = function() {
      // TODO: can I do this less complicated?
      this.surroundingFields = this.surroundingFields || _(_(_.range(x - 1, x + 2)).inject(function(rows, row_id) {        
        if (row_id >= 0 && row_id < board.fields.length) {
          rows.push(_(_.range(y - 1, y + 2)).inject(function(fields, field_id) {
            if (field_id >= 0 && field_id < board.fields.length && !(row_id == x && field_id == y)) {
              fields.push(board.fields[row_id][field_id]);
            }
            return fields;
          }.bind(this), []));
        }
        return rows;
      }.bind(this), [])).flatten();
      return this.surroundingFields;
    };

    this.countSurroundingBombs = function() {
      this.surroundingBombsCount = this.surroundingBombsCount || _(this.getSurroundingFields()).filter(function(item) {
        return item.hasBomb;
      }).length;
      return this.surroundingBombsCount;
    };

    this.hit = function(ev) {
      if (board.clockStarted == null) {
        board.startGame();
      }

      if (this.hasBomb) {
        board.stopGame();
        board.explode(x, y);
      } else {
        this.expose();
      }
    };

    this.markBomb = function() {
      if (this.marked) {
        var character = this.exposed && this.countSurroundingBombs() > 0 && this.countSurroundingBombs() || "-";
        this.marked = false;
        this.el.removeClass("marked");
        this.el.html(character);        
        this.el.on('click', this.hit.bind(this));
      } else {
        if (!this.exposed) {
          this.marked = true;
          this.el.addClass("marked");
          this.el.html("o");
          this.el.off("click");
        }
      }

      return false;
    };

    this.expose = function() {
      this.exposed = true;
      $(this.el).addClass("exposed");

      if (!this.hidden) {        
        if (this.countSurroundingBombs() == 0) {
          $(this.el).addClass("empty");
          var neighbours = _(this.getSurroundingFields()).filter(function(field) {
            return !field.exposed;
          });

          _(neighbours).each(function(field) {
            field.hit();
          });
        } else {
          this.el.html(this.countSurroundingBombs());
        }
      }
    };

    this.explode = function() {
      this.el.addClass("exploded");
      if (this.hasBomb) { 
        this.el.addClass("bomb");
        this.el.html("x");
      } else {
        this.el.html("-");
      }
      this.el.off("click");
    };

    this.hide = function() {
      this.el.addClass("exploded");

      setTimeout(function() {
        this.hidden = true;
        this.el.html("#");
      }.bind(this), 500);
    };

    this.render = function() {
      this.el = $("<a>").html("-")
                        .on('click', this.hit.bind(this))
                        .on("contextmenu", this.markBomb.bind(this));
      return this.el;
    };

    return this;
  };

  Minekeepr.Board = function(board_width, bombs_count) {
    var board_width = board_width || 30,
        bombs_count = bombs_count || 100,

        generate = function() {
          this.fields = _.range(board_width).map(function(x) { 
            return _.range(board_width).map(function(y) {
              return new Minekeepr.Field(x, y, this);
            }.bind(this));
          }.bind(this));

          _(bombs_count).times(function() {
            addRandomBomb();
          });
        }.bind(this),

        getRandomField = function() {
          var x = Math.floor(Math.random() * board_width),
              y = Math.floor(Math.random() * board_width);
          return this.fields[x][y];
        }.bind(this),

        addRandomBomb = function() {
          var field = getRandomField();
          field.hasBomb && addRandomBomb() || field.addBomb();
        }.bind(this),

        startClock = function() {
          var value = 999;

          $('#clock').html(value);
          value = value - 1;
          this.clockInverval = setInterval(function() {
            $('#clock').html(value);
            value = value - 1;
          }, 100);

          this.clockStarted = true;
        },

        stopClock = function() {
          clearInterval(this.clockInverval);
        },

        startGlitch = function() {          
          this.glitchInterval = setInterval(hideRandomField, 1000);
        },

        stopGlitch = function() {
          clearInterval(this.glitchInterval);
        },

        hideRandomField = function() {
          var field = getRandomField();
          if (field.exposed || field.marked) {
            hideRandomField();
          } else {
            field.hide();
          }
        };

    this.explode = function(x_center, y_center, i) {
      var i = i || 0;

      _(_.range(x_center - i, x_center + i)).each(function(x) {
        if (x >= 0 && x < board_width) {
          _(_.range(y_center - i, y_center + i)).each(function(y) {
            if (y >= 0 && y < board_width) {
              this.fields[x][y].explode();
            }
          }.bind(this));
        }
      }.bind(this));

      if (i < board_width) {
        // TODO: add easing to animation
        setTimeout(function() {
          this.explode(x_center, y_center, i + 1);
        }.bind(this), 10);
      }
    };

    this.startGame = function() {
      if (!this.started) {
        startClock();
        startGlitch();
        this.started = true;
      }
    };

    this.stopGame = function() {
      stopClock();
      stopGlitch();
    };

    this.render = function() {
      var element = $("<div>");

      _(this.fields).each(function(row) {
        _(row).each(function(field) {
          element.append(field.render());
        });

        element.append("<br>");
      });

      return element;
    }.bind(this);

    generate();
    return this
  };


  // kickstart
  board = new Minekeepr.Board;
  $("#minekeepr").html(board.render());

});
