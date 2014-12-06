Ext.define('DF.view.main.MainController', {
	extend: 'Ext.app.ViewController',
		
	onBeforeTabChange: function( tabPanel, newCard) {
		if (newCard.xclass !== 'DF.view.main.ResultPanel') {
			newCard.getStore().load();
		}
	}
});
