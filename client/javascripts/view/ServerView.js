/**
 * ServerView
 * 
 * @class
 * @author  Tim Davies <mail@timdavi.es>
 */
var ServerView = Backbone.View.extend({
    /**
     * Close the pane is it's open
     * @constructor
     * @return {undefined}
     */
    initialize: function() {
        if (pane.isOpen) {
            pane.close();
        }
    },
    
    
    /**
     * Render view
     * @return {undefined}
     */
    render: function() {
        // Populate left nav (database switcher):
        database.queryOrLogout("SHOW DATABASES;", function (rows) {
            for (var row_id in rows) {
                var row = rows[row_id];
                sidebar.addItem(row.Database, '', '#/database/' + row.Database + '/', undefined, false);
            }
            sidebar.render();
            
            $('#main').html(_.template(
                $('#template-list-databases').html(),
                {
                    server_name: window.server_name,
                    num_databases: rows.length
                }
            ));
        });
    }
});