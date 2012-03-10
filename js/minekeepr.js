$(function() {

  Minekeepr = {};
  Minekeepr.board = function() {

    var board_width = 10,
        bombs_count = 10,

        Field = function(x, y, playboard) {
          var x = x,
              y = y,
              playboard = playboard,
              bomb = false;

          this.hasBomb = function() {
            return bomb;
          },

          this.addBomb = function() {
            bomb = true;
          },

          this.getValue = function() {
            console.log(x, y, playboard);
            return "-";
          },

          this.render = function() {
            return $("<a>").html(bomb && "x" || this.getValue());
          }

          return this;
        },

        generate = function() {
          this.fields = _.range(board_width).map(function(x) { 
            return _.range(board_width).map(function(y) {
              return new Field(x, y, this);
            }.bind(this));
          }.bind(this));

          _(bombs_count).times(function() {
            generateBomb();
          });
        }.bind(this),

        generateBomb = function() {
          var x = Math.floor(Math.random() * 10),
              y = Math.floor(Math.random() * 10);

          if (!this.fields[x][y].hasBomb()) {
            return this.fields[x][y].addBomb();
          } else {
            return generateBomb();
          }
        }.bind(this);

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

  board = new Minekeepr.board;
  $("#minekeepr").html(board.render());

});