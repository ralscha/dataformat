Ext.define('DF.data.reader.ProtoBuf', {
	extend: 'Ext.data.reader.Json',
	alias: 'reader.protobuf',

	constructor: function () {
        this.callParent(arguments);         
        var builder = dcodeIO.ProtoBuf.loadProtoFile("address.proto");
		this.root = builder.build();
    },
	
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
		try {
			var start = performance.now();
			var result = this.root.Addresses.decode(response.responseBytes).address;
			console.log('protobuf', (performance.now()-start) + ' ms');
			return result;
			
		}
		catch (ex) {
			Ext.Logger.warn('Unable to parse the ProtoBuffer returned by the server');
			return this.createReadError(ex.message);
		}
	}
});