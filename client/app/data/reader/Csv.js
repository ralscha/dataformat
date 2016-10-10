Ext.define('Df.data.reader.Csv', {
	extend: 'Ext.data.reader.Array',
	alias: 'reader.csv',

	getResponseData: function(response) {
		var error;
		try {
			var start = performance.now();
			var results = Papa.parse(response.responseText);
			console.log('csv', (performance.now()-start) + ' ms');
			return results.data;
		}
		catch (ex) {
			error = this.createReadError(ex.message);
            Ext.Logger.warn('Unable to parse the CSV returned by the server');
            this.fireEvent('exception', this, response, error);
            return error;			
		}
	}
});