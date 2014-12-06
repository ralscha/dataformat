Ext.define('DF.view.main.AddressGrid', {
	extend: 'Ext.grid.Panel',

	columns: [ {
		text: 'ID',
		dataIndex: 'id'
	}, {
		text: 'Last Name',
		dataIndex: 'lastName'		
	}, {
		text: 'First Name',
		dataIndex: 'firstName'		
	}, {
		text: 'Street',
		dataIndex: 'street'		
	}, {
		text: 'Zip Code',
		dataIndex: 'zip'		
	}, {
		text: 'City',
		dataIndex: 'city'		
	}, {
		text: 'Country',
		dataIndex: 'country'		
	}, {
		text: 'Latitude',
		dataIndex: 'lat'		
	}, {
		text: 'Longitude',
		dataIndex: 'lng'		
	}, {
		text: 'Email',
		dataIndex: 'email'		
	}, {
		text: 'Date of Birth',
		dataIndex: 'dob'		
	} ]

});
