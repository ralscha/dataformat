Ext.define('Df.data.reader.FlatBuffers', {
	extend: 'Ext.data.reader.Json',
	alias: 'reader.flatbuffers',
	
	read: function(response, readOptions) {
		var data, result;

		if (response && response.responseBytes) {
			result = this.getResponseData(response);
			if (result && result.__$isError) {
				return new Ext.data.ResultSet({
					total: 0,
					count: 0,
					records: [],
					success: false,
					message: result.msg
				});
			}
			else {
				data = this.readRecords(result, readOptions);
			}
		}

		return data || this.nullResultSet;
	},

	getResponseData: function(response) {
		var error;
		try {
			var start = performance.now();
			
			var buf = new flatbuffers.ByteBuffer(response.responseBytes);
			var addresses = ch.rasc.dataformat.fb.Addresses.getRootAsAddresses(buf);									
			
			var result = [];			
			var len = addresses.addressLength();
			for (var i = 0; i < len; i++) {
				var adr = addresses.address(i);
				result.push({
					id: adr.id(),
					lastName: adr.lastName(),
					firstName: adr.firstName(),
					street: adr.street(),
					zip: adr.zip(),
					city: adr.city(),
					country: adr.country(),
					lat: adr.lat(),
					lng: adr.lng(),
					email: adr.email(),
					dob: adr.dob()
				});
			}
			console.log('flatbuffer', (performance.now()-start) + ' ms');

			return result;
		}
		catch (ex) {
			error = this.createReadError(ex.message);
            Ext.Logger.warn('Unable to parse the FlatBuffers returned by the server');
            this.fireEvent('exception', this, response, error);
            return error;
		}
	}
});