Ext.define('Df.overrides.Ajax', {
   override: 'Ext.data.request.Ajax',

    createResponse: function(xhr) {
        var me = this,
            isXdr = me.isXdr,
            headers = {},
            lines = isXdr ? [] : xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, response;

        while (count--) {
            line = lines[count];
            index = line.indexOf(':');

            if (index >= 0) {
                key = line.substr(0, index).toLowerCase();

                if (line.charAt(index + 1) === ' ') {
                    ++index;
                }

                headers[key] = line.substr(index + 1);
            }
        }

        response = {
            request: me,
            requestId: me.id,
            status: xhr.status,
            statusText: xhr.statusText,
            getResponseHeader: function(header) {
                return headers[header.toLowerCase()];
            },
            getAllResponseHeaders: function() {
                return headers;
            }
        };

        if (isXdr) {
            me.processXdrResponse(response, xhr);
        }

        if (me.binary) {
            response.responseBytes = me.getByteArray(xhr);
        }
        else {
            if (xhr.responseType) {
                response.responseType = xhr.responseType;
            }

            if (xhr.responseType === 'blob') {
                response.responseBlob = xhr.response;
            }
            else if (xhr.responseType === 'json') {
                response.responseJson = xhr.response;
            }
            else if (xhr.responseType === 'document') {
                response.responseXML = xhr.response;
            } 
            else if (xhr.responseType === 'text') {
            	response.responseText = xhr.response;
            }
            else {
                // an error is thrown when trying to access responseText or responseXML
                // on an xhr object with responseType with any value but "text" or "",
                // so only attempt to set these properties in the response if we're not
                // dealing with other specified response types
                response.responseText = xhr.responseText;
                response.responseXML = xhr.responseXML;
            }
        }

        return response;
    }
});
