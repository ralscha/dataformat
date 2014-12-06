Ext.define('DF.data.reader.Csv', {
    extend: 'Ext.data.reader.Array',
    alias: 'reader.csv',
    
    getResponseData: function(response) {
        try {            
        	var results = Papa.parse(response.responseText);
        	return results.data;
        } catch (ex) {
            Ext.Logger.warn('Unable to parse the CSV returned by the server');
            return this.createReadError(ex.message);   
        }
    }
});