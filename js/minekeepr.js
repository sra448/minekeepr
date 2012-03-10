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

          this.destroyed = false;

          this.hasBomb = function() {
            return bomb;
          };

          this.addBomb = function() {
            bomb = true;
          };

          this.countSurroundingBombs = function() {
            return _(this.getSurroundingFields()).filter(function(item) {
              return item.hasBomb();
            }).length;
          };

          this.getSurroundingFields = function() {
            return _(_(_.range(x - 1, x + 2)).inject(function(rows, row_id) {                      
              if (row_id >= 0 && row_id < board_width) {
                rows.push(_(_.range(y - 1, y + 2)).inject(function(fields, field_id) {
                  if (field_id >= 0 && field_id < board_width && !(row_id == x && field_id == y)) {
                    fields.push(playboard.fields[row_id][field_id]);
                  }
                  return fields;
                }.bind(this), []));
              }
              return rows;
            }.bind(this), [])).flatten();
          };

          this.hit = function(ev) {
            if (this.hasBomb()) {
              this.el.html("x").addClass("bomb");
              console.log("BOOOOOOOOOOOOOOM!!!!!!!!!!");
              
            } else {
              this.destroyed = true;
              $(this.el).addClass("destroyed");

              if (this.countSurroundingBombs() == 0) {
                var neighbours = _(this.getSurroundingFields()).filter(function(field) {
                  return !field.destroyed;
                });

                _(neighbours).each(function(field) {
                  field.hit();
                });
              } else {
                this.el.html(this.countSurroundingBombs());
              }
            }
          };

          this.render = function() {
            this.el = $("<a>").attr("href", "#")
                              .html("-")
                              .click(this.hit.bind(this));
            return this.el;
          };

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