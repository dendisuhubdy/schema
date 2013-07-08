var DatabasePicker = Backbone.Model.extend({
    initialize: function() {
        if (pane.isOpen) {
            pane.close();
        }
    },
    
    displayPicker: function() {
        // Populate left nav (database switcher):
        database.queryOrLogout("SHOW DATABASES;", function (rows) {
            for (var row_id in rows) {
                var row = rows[row_id];
                sidebar.addItem(row.Database, '', '#/database/' + row.Database + '/', 0);
            }
        });
        
        $('#main').html(_.template(
            $('#template-database-picker').html(),
            {
            }
        ));
    }
});