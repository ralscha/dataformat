Ext.define('Df.view.main.AddressGrid', {
	extend: 'Ext.grid.Panel',

	columns: [ {
		text: 'ID',
		dataIndex: 'id',
		width: 50
	}, {
		text: 'Last Name',
		dataIndex: 'lastName',
		width: 100
	}, {
		text: 'First Name',
		dataIndex: 'firstName',
		width: 100
	}, {
		text: 'Street',
		dataIndex: 'street',
		width: 100
	}, {
		text: 'Zip Code',
		dataIndex: 'zip',
		width: 100
	}, {
		text: 'City',
		dataIndex: 'city',
		width: 100
	}, {
		text: 'Country',
		dataIndex: 'country',
		width: 100
	}, {
		text: 'Latitude',
		dataIndex: 'lat',
		width: 100
	}, {
		text: 'Longitude',
		dataIndex: 'lng',
		width: 100
	}, {
		text: 'Email',
		dataIndex: 'email',
		width: 100
	}, {
		text: 'Date of Birth',
		dataIndex: 'dob',
		width: 100,
		xtype: 'datecolumn',
		format: 'Y-m-d'
	} ]

});
