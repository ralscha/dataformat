Ext.define('Df.overrides.Ajax', {
	override: 'Ext.data.request.Ajax',

    statics: {
        parseStatus: function(status, response) {
            // see: https://prototype.lighthouseapp.com/projects/8886/tickets/129-ie-mangles-http-response-status-code-204-to-1223
            status = status == 1223 ? 204 : status;

            var success = (status >= 200 && status < 300) || status == 304,
                isException = false;

            if (!success) {
                switch (status) {
                    case 12002:
                    case 12029:
                    case 12030:
                    case 12031:
                    case 12152:
                    case 13030:
                        isException = true;
                        break;
                }
            }

            return {
                success: success,
                isException: isException
            };
        }
    }
});