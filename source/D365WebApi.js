let superagent = require("superagent");
let Q = require("q");

export function context() {
    if (typeof Xrm != "undefined") { // Form
        return Xrm.Page.context;
    }
    else if (typeof GetGlobalContext != 'undefined') { // Web resource
        return GetGlobalContext();
    }
    else {
        throw new Error('Context is not available.');
    }
};

export function clientUrl() {
    return context().getClientUrl();
};
export function webAPIPath() {
    return clientUrl() + "/api/data/v8.0/";
};

export function defaultHeaders(extraHeaders) {
    var defaultHeaders = {
        "Accept": "application/json",
        "OData-Version": "4.0",
        "OData-MaxVersion": "4.0"
    };

    if (extraHeaders) {
        for (var att in extraHeaders) {
            defaultHeaders[att] = extraHeaders[att];
        }
    }

    return defaultHeaders;
};

export function executeBoundAction(type, id, actionName, actionParameters, extraHeaders) {

    var deferred = Q.defer();

    id = id ? '(' + id + ')' : '';

    var url = webAPIPath() + type + id + '/' + 'Microsoft.Dynamics.CRM.' + actionName;

    var request = superagent.post(url);

    var headers = defaultHeaders(extraHeaders)

    if (actionParameters) {
        data = JSON.stringify(actionParameters);
        headers["Content-Type"] = "application/json";
        request.send(data);
    }

    request.set(headers);

    request.end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function executeUnboundAction(actionName, actionParameters, extraHeaders) {

    var deferred = Q.defer();

    var url = webAPIPath() + actionName;

    var request = superagent.post(url);

    var headers = defaultHeaders(extraHeaders);

    if (actionParameters) {
        data = JSON.stringify(actionParameters);
        headers["Content-Type"] = "application/json";
        request.send(data);
    }

    request.set(headers);

    request.end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function executeBoundFunction(type, id, functionString, extraHeaders) {

    var deferred = Q.defer();

    id = id ? '(' + id + ')' : '';

    var url = webAPIPath() + type + id + '/' + 'Microsoft.Dynamics.CRM.' + functionString;

    var headers = defaultHeaders(extraHeaders);

    superagent.get(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function executeUnboundFunction(functionString, extraHeaders) {

    var deferred = Q.defer();

    var url = webAPIPath() + functionString;

    var headers = defaultHeaders(extraHeaders);

    superagent.get(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

//
// It is also poosible to create related entities and associate entities in one CREATE-operation
// https://msdn.microsoft.com/en-us/library/gg328090.aspx#bkmk_CreateRelated
//
export function createEntity(type, entity, extraHeaders) {

    var deferred = Q.defer();

    var data = JSON.stringify(entity);

    var url = webAPIPath() + type;

    var headers = defaultHeaders(extraHeaders);

    headers["Content-Type"] = "application/json";

    superagent.post(url).set(headers).send(data).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function deleteEntity(type, id, extraHeaders) {

    var deferred = Q.defer();

    var url = webAPIPath() + type + '(' + id + ')';

    var headers = defaultHeaders(extraHeaders);

    headers["Content-Type"] = "application/json";

    superagent.del(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function updateEntity(type, id, entity, extraHeaders) {

    var deferred = Q.defer();

    var data = JSON.stringify(entity);

    var url = webAPIPath() + type + '(' + id + ')';

    var headers = defaultHeaders(extraHeaders);

    headers["Content-Type"] = "application/json";

    superagent.patch(url).set(headers).send(data).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function retrieveEntity(type, id, options, extraHeaders) {

    var deferred = Q.defer();

    var url = webAPIPath() + type + '(' + id + ')';

    url += options ? options : '';

    var headers = defaultHeaders(extraHeaders);

    superagent.get(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function retrieveMultiple(type, options, extraHeaders, _nextLink) {

    var deferred = Q.defer();

    var url = "";

    if (!_nextLink) {
        url = webAPIPath() + type;

        url += options ? options : '';
    }
    else {
        url = _nextLink;
    }

    var headers = defaultHeaders(extraHeaders);

    superagent.get(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (res.body.hasOwnProperty("@odata.nextLink")) {
                retrieveMultiple(null, null, null, res.body["@odata.nextLink"]).then(function (innerRes) {
                    delete res.body["@odata.nextLink"];
                    res.body.value = res.body.value.concat(innerRes.body.value);
                    deferred.resolve(res);
                }).catch(function (innerErr) {
                    deferred.reject(err);
                });
            }
            else {
                deferred.resolve(res);
            }
        }
    });

    return deferred.promise;
};

export function executeFetchXml(type, fetchXml, extraHeaders) {
    var deferred = Q.defer();

    var url = webAPIPath() + type + "?fetchXml=" + fetchXml;

    var headers = defaultHeaders(extraHeaders);

    superagent.get(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function associateEntities(parentType, parentId, childType, childId, relationshipName) {

    var deferred = Q.defer();

    var url = webAPIPath() + parentType + '(' + parentId + ')/' + relationshipName + '/$ref';

    var data = {};
    data['@odata.id'] = webAPIPath() + childType + 's' + '(' + childId + ')';
    data = JSON.stringify(data);

    var headers = defaultHeaders({ "Content-Type": "application/json" })

    superagent.post(url).set(headers).send(data).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};

export function diassociateEntities(parentType, parentId, childId, relationshipName) {

    var deferred = Q.defer();

    var url = webAPIPath() + parentType + '(' + parentId + ')/' + relationshipName + '(' + childId + ')/$ref';

    var headers = defaultHeaders();

    superagent.del(url).set(headers).end(function (err, res) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
};