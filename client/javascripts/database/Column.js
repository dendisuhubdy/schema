/**
 * Table column
 * 
 * @class
 * @author  Tim Davies <mail@timdavi.es>
 */
var Column = Backbone.Model.extend({
    /**
     * Return datatype string split into parts
     * @return {Array} Array of datatype parts
     */
    parseDataType: function() {
        if (this.get('parsed_datatype')) {
            return this.get('parsed_datatype');
        }
        
        var type = this.get('datatype').split(' ');
        
        this.set('parsed_datatype', type);
        return type;
    },
    
    
    /**
     * Check whether the column is allowed to contain null values
     * @return {Boolean} Whether column can contain a null value
     */
    getNull: function() {
        var nullAllowed = this.get('null').toLowerCase();
        
        if (nullAllowed == 'yes') {
            return true;
        } else {
            return false;
        }
    },
    
    
    /**
     * Change whether column is allowed to contain null values
     * @param {Boolean} allow_null Value to change setting to
     * @return {undefined}
     */
    setAllowNull: function(allow_null, success_callback, error_callback) {
        console.info("Setting allow null to", allow_null, "for column", this.get('name'));
        
        // Get parameters for SQL:
        var table_name = this.get('table').get('name');
        var column_name = this.get('name');
        var type = this.get('datatype');
        
        // Build allow_null for SQL:
        if (allow_null) {
            var allow_null_sql = "NULL";
        } else {
            var allow_null_sql = "NOT NULL";
        }
        
        // Build SQL:
        var sql = _.str.sprintf(
            "ALTER TABLE `%s` MODIFY `%s` %s %s;",
            table_name,
            column_name,
            type,
            allow_null_sql
        );
        
        // Give this to variable for callback:
        var column = this;
        
        // Execute SQL and run callbacks:
        database.query(sql, function(err, rows) {
            // If there was an error, run the error callback:
            if (err && error_callback) {
                return error_callback();
            }
            
            // Set column allow null to new value:
            column.set('null', allow_null ? "YES" : "NO");
            
            // If success callback sent, call it:
            if (success_callback) {
                return success_callback();
            }
        });
    },
    
    
    /**
     * Get datatype without any other parameters or information
     * @return {String} Raw datatype
     */
    getDatatype: function() {
        // Get parsed datatype:
        var parts = this.parseDataType();
        var type = parts[0];
        
        // Find location of first bracket in datatype:
        var bracket_location = type.indexOf('(');
        
        // If no bracket could be found, just return the whole type:
        if (bracket_location == -1) {
            return type.trim();
        }
        
        // Return datatype up to the first bracket (trimmed):
        return type.substr(0, bracket_location).trim();
    },
    
    
    /**
     * Is column datatype an integer of some sort
     * @return {Boolean}
     */
    isIntegerType: function() {
        var integer_patterns = [
            'INTEGER',
            'INT',
            'SMALLINT',
            'TINYINT',
            'MEDIUMINT',
            'BIGINT',
            'DECIMAL',
            'NUMERIC',
            'FLOAT',
            'DOUBLE',
            'BIT'
        ];
        
        // Get raw datatype:
        var datatype = this.getDatatype();
        
        for (var i = 0; i < integer_patterns.length; i++) {
            var pattern = integer_patterns[i];
            
            if (pattern.toLowerCase() == datatype.toLowerCase()) {
                return true;
            }
        }
        
        return false;
    },
    
    
    isText: function() {
        if (this.getDatatype().toUpperCase() == 'TEXT') {
            return true;
        }
        return false;
    },
    
    
    /**
     * Is column datatype date/time related
     * @return {Boolean}
     */
    isDate: function() {
        var dt = this.getDatatype().toUpperCase();
        var datetypes = [
            'DATE',
            'DATETIME',
            'TIMESTAMP',
            'TIME',
            'YEAR'
        ]
        if (datetypes.indexOf(dt) >= 0) {
            return true;
        }
        return false;
    },
    
    
    /**
     * Is column the primary key
     * @return {Boolean} True if column is a primary key
     */
    isPrimaryKey: function() {
        return this.get('key') == 'PRI';
    },
    
    
    /**
     * Is column unique
     * @return {Boolean} True if column is unique
     */
    isUnique: function() {
        return this.get('key') == 'UNI';
    },
    
    
    /**
     * Is column unsigned
     * @return {Boolean} True if column is unsigned
     */
    isUnsigned: function() {
        return this.get('datatype').search("unsigned") > -1;
    },
    
    
    /**
     * Is column able to be unsigned (e.g. it's an integer)
     * @return {Boolean} True if column can be unsigned
     */
    isUnsignedValid: function() {
        // if (this.isUnsigned()) {
        //     return true;
        // }
        if (this.isIntegerType()) {
            return true;
        }
        
        return false;
    },
    
    
    /**
     * Get field maximum length
     *
     * @return {Number} Length
     */
    getLength: function() {
        var type = this.get('datatype');
        var regex = /[0-9]+/;
        var matches = regex.exec(type);
        
        if (matches) {
            return matches[0];
        }
        
        return null;
    },
    
    
    /**
     * Change name of column
     * @param {String} column_name     Old column name
     * @param {String} new_column_name New column name
     * @return {undefined}
     */
    changeFieldName: function(new_column_name, callback) {
        // Build SQL:
        var sql = _.str.sprintf(
            "ALTER TABLE `%s` CHANGE `%s` `%s` %s",
            this.get('table').get('name'),
            this.get('name'),
            new_column_name,
            this.get('datatype')
        );
        
        database.query(sql, callback);
    },
    
    
    /**
     * Get full name of key (e.g. 'PRIMARY' instead of 'PRI');
     * @return {String} Key full name
     */
    getKeyFullName: function() {
        var key = this.get('key').toUpperCase();
        
        if (!key) {
            return false;
        }
        
        if (key == 'PRI') {
            return 'PRIMARY';
        }
        
        if (key == 'UNI') {
            return 'UNIQUE';
        }
        
        if (key == 'MUL') {
            return 'INDEX';
        }
        
        console.warn("Could not determine full name for key:", key);
        
        return key;
    }
});
