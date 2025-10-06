"use strict";
exports.__esModule = true;
exports.LocationsApi = void 0;
const tslib_1 = require("tslib");
const createLocationRequest_1 = require("../models/createLocationRequest");
const createLocationResponse_1 = require("../models/createLocationResponse");
const listLocationsResponse_1 = require("../models/listLocationsResponse");
const retrieveLocationResponse_1 = require("../models/retrieveLocationResponse");
const updateLocationRequest_1 = require("../models/updateLocationRequest");
const updateLocationResponse_1 = require("../models/updateLocationResponse");
const schema_1 = require("../schema");
const baseApi_1 = require("./baseApi");
const LocationsApi = /** @class */ (function (_super) {
    tslib_1.__extends(LocationsApi, _super);
    function LocationsApi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Provides details about all of the seller's [locations](https://developer.squareup.com/docs/locations-
     * api),
     * including those with an inactive status. Locations are listed alphabetically by `name`.
     *
     * @return Response from the API call
     */
    LocationsApi.prototype.listLocations = function (requestOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            let req;
            return tslib_1.__generator(this, function (_a) {
                req = this.createRequest('GET', '/v2/locations');
                req.authenticate([{ global: true }]);
                return [2 /*return*/, req.callAsJson(listLocationsResponse_1.listLocationsResponseSchema, requestOptions)];
            });
        });
    };
    /**
     * Creates a [location](https://developer.squareup.com/docs/locations-api).
     * Creating new locations allows for separate configuration of receipt layouts, item prices,
     * and sales reports. Developers can use locations to separate sales activity through applications
     * that integrate with Square from sales activity elsewhere in a seller's account.
     * Locations created programmatically with the Locations API last forever and
     * are visible to the seller for their own management. Therefore, ensure that
     * each location has a sensible and unique name.
     *
     * @param body         An object containing the fields to POST for the request.  See
     *                                                     the corresponding object definition for field details.
     * @return Response from the API call
     */
    LocationsApi.prototype.createLocation = function (body, requestOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            let req, mapped;
            return tslib_1.__generator(this, function (_a) {
                req = this.createRequest('POST', '/v2/locations');
                mapped = req.prepareArgs({
                    body: [body, createLocationRequest_1.createLocationRequestSchema]
                });
                req.header('Content-Type', 'application/json');
                req.json(mapped.body);
                req.authenticate([{ global: true }]);
                return [2 /*return*/, req.callAsJson(createLocationResponse_1.createLocationResponseSchema, requestOptions)];
            });
        });
    };
    /**
     * Retrieves details of a single location. Specify "main"
     * as the location ID to retrieve details of the [main location](https://developer.squareup.
     * com/docs/locations-api#about-the-main-location).
     *
     * @param locationId  The ID of the location to retrieve. Specify the string "main" to return the main
     *                              location.
     * @return Response from the API call
     */
    LocationsApi.prototype.retrieveLocation = function (locationId, requestOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            let req, mapped;
            return tslib_1.__generator(this, function (_a) {
                req = this.createRequest('GET');
                mapped = req.prepareArgs({ locationId: [locationId, (0, schema_1.string)()] });
                req.appendTemplatePath(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["/v2/locations/", ""], ["/v2/locations/", ""])), mapped.locationId);
                req.authenticate([{ global: true }]);
                return [2 /*return*/, req.callAsJson(retrieveLocationResponse_1.retrieveLocationResponseSchema, requestOptions)];
            });
        });
    };
    /**
     * Updates a [location](https://developer.squareup.com/docs/locations-api).
     *
     * @param locationId   The ID of the location to update.
     * @param body         An object containing the fields to POST for the request.  See
     *                                                     the corresponding object definition for field details.
     * @return Response from the API call
     */
    LocationsApi.prototype.updateLocation = function (locationId, body, requestOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            let req, mapped;
            return tslib_1.__generator(this, function (_a) {
                req = this.createRequest('PUT');
                mapped = req.prepareArgs({
                    locationId: [locationId, (0, schema_1.string)()],
                    body: [body, updateLocationRequest_1.updateLocationRequestSchema]
                });
                req.header('Content-Type', 'application/json');
                req.json(mapped.body);
                req.appendTemplatePath(templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["/v2/locations/", ""], ["/v2/locations/", ""])), mapped.locationId);
                req.authenticate([{ global: true }]);
                return [2 /*return*/, req.callAsJson(updateLocationResponse_1.updateLocationResponseSchema, requestOptions)];
            });
        });
    };
    return LocationsApi;
}(baseApi_1.BaseApi));
exports.LocationsApi = LocationsApi;
let templateObject_1, templateObject_2;
//# sourceMappingURL=locationsApi.js.map