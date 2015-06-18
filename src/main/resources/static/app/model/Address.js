Ext.define("DF.model.Address", {
	extend: "Ext.data.Model",

	fields: [ {
		name: "id"
	}, {
		name: "lastName"
	}, {
		name: "firstName"
	}, {
		name: "street"
	}, {
		name: "zip"
	}, {
		name: "city"
	}, {
		name: "country"
	}, {
		name: "lat"
	}, {
		name: "lng"
	}, {
		name: "email"
	}, {
		name: "dob",
		convert: function(v) {
			return new Date(v * 86400000);
		}
	} ]
});