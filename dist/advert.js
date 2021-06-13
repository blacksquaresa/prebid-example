/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/advert.ts":
/*!***********************!*\
  !*** ./src/advert.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Advert = void 0;
var advertObserver_1 = __webpack_require__(/*! ./advertObserver */ "./src/advertObserver.ts");
/**
 * Represents a single advert. Contains all the information about the advert,
 * and also all the DOM elements and observers associated with the advert.
 *
 * @export
 * @class Advert
 */
var Advert = /** @class */ (function () {
    /**
     * Creates an instance of the advert from the given data, and initialises an observer.
     * @param unit The unit value to use for Apn tags.
     * @param id The ID of the div containing this advert.
     * @param sizes An array of allowed advert sizes.
     * @param bids An array of bidders.
     * @param refresh Whether or not to refresh the advert (using the refreshSettings data). Defaults to false.
     * @param position The position of the advert on the page. Valid values are "left", "right" and the default "bottom".
     * @param closeBtn Whether or not to include a close button with the advert. Defaults to false.
     * @param refreshSettings The settings to use when determining how the advert should be refreshed.
     */
    function Advert(unit, id, sizes, bids, refresh, position, closeBtn, refreshSettings) {
        var _this = this;
        if (refresh === void 0) { refresh = false; }
        if (position === void 0) { position = "bottom"; }
        if (closeBtn === void 0) { closeBtn = false; }
        var _a, _b, _c;
        this.unit = unit;
        this.id = id;
        this.sizes = sizes;
        this.bids = bids;
        this.refresh = refresh;
        this.position = position;
        this.closeBtn = closeBtn;
        this.refreshSettings = refreshSettings;
        this.refreshCounter = 0;
        /**
         * Closes this advert
         * All DOM elements are removed from the DOM, and references are removed
         * Timers are cancelled
         */
        this.close = function () {
            var _a;
            if (!_this.adContainer)
                return;
            _this.observer.close();
            (_a = _this.adContainer.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(_this.adContainer);
            _this.adDiv = undefined;
            _this.adContainer = undefined;
            if (_this.refreshTimeout != undefined) {
                window.clearTimeout(_this.refreshTimeout);
                _this.refreshTimeout = undefined;
            }
        };
        /**
         * Refreshes this advert.
         * Calls the AST service for another advert.
         */
        this.refreshAdvert = function () {
            if (!_this.adContainer)
                return;
            window.apntag.refresh([_this.id]);
        };
        /**
         * Initiate another automatic refresh.
         * This will increment the refresh counter, then refresh the advert.
         * This method will not initiate the next refresh timer
         */
        this.autoRefresh = function () {
            _this.refreshCounter++;
            _this.refreshTimeout = undefined;
            _this.refreshAdvert();
        };
        var closeFunc = this.closeBtn ? this.close : undefined;
        var refreshFunc = this.refresh && ((_a = this.refreshSettings) === null || _a === void 0 ? void 0 : _a.btnClick) == "enabled"
            ? this.refreshAdvert
            : undefined;
        var autoRefreshFunc = this.refresh &&
            ((_b = this.refreshSettings) === null || _b === void 0 ? void 0 : _b.delay) &&
            ((_c = this.refreshSettings) === null || _c === void 0 ? void 0 : _c.repeat)
            ? this.autoRefresh
            : undefined;
        this.observer = new advertObserver_1.AdvertObserver(this, closeFunc, refreshFunc, autoRefreshFunc);
    }
    /**
     * Renders the DOM elements for this advert.
     * There are two elements for the actual advert - the container that
     * centers it and the div itself that contains the advert.
     * Also initiates the observer, and requests that the AST service show the tag
     */
    Advert.prototype.renderToDom = function () {
        var _this = this;
        var containerId = "container-for-" + this.id;
        var container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.classList.add("advert_container");
            container.classList.add("advert_container_" + this.position);
            container.style.display = "none";
            document.body.prepend(container);
        }
        this.adContainer = container;
        this.adDiv = document.createElement("div");
        this.adDiv.id = this.id;
        this.adDiv.classList.add("advert_display");
        this.adDiv.classList.add("advert_display_" + this.position);
        this.adContainer.appendChild(this.adDiv);
        this.observer.observe();
        window.apntag.anq.push(function () {
            window.apntag.showTag(_this.id);
        });
    };
    /**
     * Converts this advert into an adUnit object, used for the PreBid service
     *
     * @return The ad unit
     */
    Advert.prototype.toAdUnit = function () {
        return {
            code: this.id,
            mediaTypes: {
                banner: {
                    sizes: this.sizes.map(function (size) { return [size.width, size.height]; }),
                },
            },
            bids: this.bids,
        };
    };
    /**
     * Converts this advert into an APN tag, used for the AST service
     *
     * @return The APN tag
     */
    Advert.prototype.toApnTag = function () {
        return {
            tagId: this.unit,
            sizes: this.sizes.map(function (size) { return [size.width, size.height]; }),
            targetId: this.id,
        };
    };
    return Advert;
}());
exports.Advert = Advert;


/***/ }),

/***/ "./src/advertFactory.ts":
/*!******************************!*\
  !*** ./src/advertFactory.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdvertFactory = void 0;
var advert_1 = __webpack_require__(/*! ./advert */ "./src/advert.ts");
/**
 * Generates an advert from a data object provided.
 * This is primarily used in the Comms class to create an advert from the data fetched from the API.
 *
 * @export
 * @class AdvertFactory
 */
var AdvertFactory = /** @class */ (function () {
    function AdvertFactory() {
        var _this = this;
        /**
         * Construct a new Advert from a data object
         * We know the object has come from an external source, so we need to be very careful about constructing the Advert,
         * so we can trust the structure inside our system. Invalid data will throw an error if we cannot use a reasonable default.
         * The method is created as a function property to ensure binding with the class, to allow it to be easily used in a map function.
         *
         * @param element The data object to convert into an Advert
         * @return The generated advert.
         */
        this.fromData = function (element) {
            if (!element ||
                !element.unit ||
                !element.id ||
                !element.sizes ||
                !Array.isArray(element.sizes) ||
                !element.bids ||
                !Array.isArray(element.bids))
                throw new Error("Invalid advert data");
            return new advert_1.Advert(element.unit.toString(), element.id.toString(), _this.toSizeArray(element.sizes), _this.toBidArray(element.bids), !!element.refresh, _this.toPosition(element.position || element.positon), // Note - the API spells this incorrectly.
            !!element.closeBtn, _this.toRefreshSettingsObject(element.refreshSettings));
        };
    }
    /**
     * Converts an array of size arrays (arrays with two number members) into an array of size objects
     *
     * @private
     * @param sizes an array of size arrays
     * @return an array of size objects
     */
    AdvertFactory.prototype.toSizeArray = function (sizes) {
        var result = [];
        sizes.forEach(function (element) {
            if (!Array.isArray(element) || element.length != 2)
                throw new Error("Invalid advert size data");
            var size = {
                width: element[0],
                height: element[1],
            };
            result.push(size);
        });
        return result;
    };
    /**
     * Creates a set of bidder objects, if the input data is well formed. Otherwise, throws an error.
     *
     * @private
     * @param bids the bidder data
     * @return an array of bidder objects
     */
    AdvertFactory.prototype.toBidArray = function (bids) {
        var result = [];
        bids.forEach(function (element) {
            var _a;
            if (!element.bidder || !((_a = element.params) === null || _a === void 0 ? void 0 : _a.placementId))
                throw new Error("Invalid advert bidder data");
            var bidder = {
                bidder: element.bidder,
                params: {
                    placementId: element.params.placementId,
                },
            };
            result.push(bidder);
        });
        return result;
    };
    /**
     * Returns the provided position if it is a valid value, or a default
     *
     * @private
     * @param position the position to check
     * @return the position if valid, or a default to use
     */
    AdvertFactory.prototype.toPosition = function (position) {
        if (~["left", "right", "bottom"].indexOf(position)) {
            return position;
        }
        return "bottom";
    };
    /**
     * Generates a unified refresh settings object from the data. This could represent
     * either a refresh button or the delay and repeat details for an automated refresh.
     *
     * @private
     * @param settings the source data
     * @return the constructed refresh settings, or undefined if no settings could (or should) be generated
     */
    AdvertFactory.prototype.toRefreshSettingsObject = function (settings) {
        if (!settings)
            return undefined;
        if (settings.delay || settings.repeat) {
            return {
                delay: settings.delay || 0,
                repeat: settings.repeat || 0,
                btnClick: "disabled",
            };
        }
        if (settings.btnClick && settings.btnClick == "enabled")
            return { delay: 0, repeat: 0, btnClick: "enabled" };
        return undefined;
    };
    return AdvertFactory;
}());
exports.AdvertFactory = AdvertFactory;


/***/ }),

/***/ "./src/advertObserver.ts":
/*!*******************************!*\
  !*** ./src/advertObserver.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdvertObserver = void 0;
/**
 * Watches the associated advert, adds close and refresh buttons, and initiates auto refreshes, as appropriate.
 *
 * Some methods in this class are made public to enable testing,
 * but would otherwise be private. These are marked as such in their comments.
 *
 * @export
 * @class AdvertObserver
 */
var AdvertObserver = /** @class */ (function () {
    /**
     * Creates an instance of AdvertObserver.
     * @param advert The advert to be observed.
     * @param closeFunc If supplied, the function to call when the close button is clicked. If not supplied, no close button will be added.
     * @param refreshButtonFunc If supplied, the function to call when the refresh button is clicked. If not supplied, no refresh button will be added.
     * @param autoRefreshFunc If supplied, the function to call when the automated refresh ticks over. If not supplied, no automatic refresh will be initiated.
     */
    function AdvertObserver(advert, closeFunc, refreshButtonFunc, autoRefreshFunc) {
        var _this = this;
        this.advert = advert;
        this.closeFunc = closeFunc;
        this.refreshButtonFunc = refreshButtonFunc;
        this.autoRefreshFunc = autoRefreshFunc;
        /**
         * The event handler for the mutation observer. Adds or re-adds the close button or refresh button,
         * or re-initialises the auto refresh, whenever the contents of the advert div are updated.
         *
         * @param events The array of mutation events returned from the internal mutation observer
         */
        this.advertChanged = function (events) {
            if (!_this.advert.adDiv || _this.changeIsNotRefresh(events))
                return;
            if (_this.closeFunc) {
                _this.addCloseButton();
            }
            if (_this.refreshButtonFunc) {
                _this.addRefreshButton();
            }
            if (_this.autoRefreshFunc && _this.advert.refreshSettings) {
                _this.initiateAutoRefresh();
            }
        };
        this.observer = new MutationObserver(this.advertChanged);
        this.closeButtonId = "advert_close_button_" + this.advert.id;
        this.refreshButtonId = "advert_refresh_button_" + this.advert.id;
    }
    /**
     * Initiate the observation. This allows the class to be constructed without acting, if necessary
     */
    AdvertObserver.prototype.observe = function () {
        var _a;
        if (!((_a = this === null || this === void 0 ? void 0 : this.advert) === null || _a === void 0 ? void 0 : _a.adDiv))
            return;
        this.observer.observe(this.advert.adDiv, { childList: true });
    };
    /**
     * Disconnects the internal observer, to release references when an advert is closed.
     */
    AdvertObserver.prototype.close = function () {
        this.observer.disconnect();
    };
    /**
     * Adds a close button if appropriate, and if one does not already exist
     *
     * @private
     */
    AdvertObserver.prototype.addCloseButton = function () {
        var closeButton = document.getElementById("advert_close_button_" + this.advert.id);
        if (!closeButton) {
            closeButton = document.createElement("span");
            closeButton.id = this.closeButtonId;
            closeButton.classList.add("advert_close_button");
            closeButton.innerHTML = "X";
            closeButton.addEventListener("click", this.closeFunc);
            this.advert.adDiv.prepend(closeButton);
        }
    };
    /**
     * Adds a refresh button if appropriate, and if one does not already exist
     *
     * @private
     */
    AdvertObserver.prototype.addRefreshButton = function () {
        var refreshButton = document.getElementById("advert_refresh_button_" + this.advert.id);
        if (!refreshButton) {
            refreshButton = document.createElement("span");
            refreshButton.id = this.refreshButtonId;
            refreshButton.classList.add("advert_refresh_button");
            refreshButton.innerHTML = "Refresh AD";
            refreshButton.addEventListener("click", this.refreshButtonFunc);
            this.advert.adDiv.prepend(refreshButton);
        }
    };
    /**
     * Initiates an automatic timer to refresh the advert, if appropriate and if required settings exist.
     * Clears any existing timers.
     * This method assumed the existence of certain variables without checking on them. These checks are made in the calling method.
     *
     * @private
     */
    AdvertObserver.prototype.initiateAutoRefresh = function () {
        if (this.advert.refreshTimeout != undefined) {
            window.clearTimeout(this.advert.refreshTimeout);
            this.advert.refreshTimeout = undefined;
        }
        if (this.advert.refreshCounter < this.advert.refreshSettings.repeat) {
            this.advert.refreshTimeout = window.setTimeout(this.autoRefreshFunc, this.advert.refreshSettings.delay);
        }
    };
    /**
     * Checks the events that triggered this mutation. We only want to act when:
     * 1: a new element is added to our div. When elements are taken away, we don't care.
     *    We don't need to remove our buttons when elements are removed, because the removal
     *    generally clears all the contents of the div.
     * 2: the new elements being added are not all our own elements. When we add the close or
     *    refresh buttons, that triggers the mutation observer again. We want to ignore those actions.
     *
     * @param events The mutation events that triggered this observed mutation
     * @return boolean Whether or not this change represents a legitimate refresh we should act upon.
     *         False means it should be acted upon, while True means it should not.
     * @private
     */
    AdvertObserver.prototype.changeIsNotRefresh = function (events) {
        var _this = this;
        return events
            .map(function (event) {
            // We are only interested in changes that add new nodes
            if (!event.addedNodes.length) {
                return true;
            }
            // Look through the list of added nodes for any that aren't the two we control
            for (var index = 0; index < event.addedNodes.length; index++) {
                var element = event.addedNodes[index];
                if (!(element instanceof HTMLElement) ||
                    !~[_this.closeButtonId, _this.refreshButtonId].indexOf(element.id)) {
                    return false;
                }
            }
            // We didn't find any that we don't control, so this event is all us - this is not a refresh
            return true;
        })
            .reduce(function (check, current) { return check && current; }, true);
    };
    return AdvertObserver;
}());
exports.AdvertObserver = AdvertObserver;


/***/ }),

/***/ "./src/advertService.ts":
/*!******************************!*\
  !*** ./src/advertService.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdvertService = void 0;
var PrebidTimeout = 1000;
/**
 * This service prepares the Prebid and AppNexus AST systems and loads the initial adverts from those systems
 *
 * @export
 * @class AdvertService
 */
var AdvertService = /** @class */ (function () {
    function AdvertService(global) {
        var _this = this;
        this.global = global;
        /**
         * Request bids from the PreBid service based on the advert details provided
         * The method will add the request to the PreBid queue to wait for that service to be ready
         *
         * @param adUnits An array of IAdUnit objects generated from the adverts
         */
        this.requestBids = function (adUnits) {
            _this.global.pbjs.que.push(function () {
                _this.global.pbjs.addAdUnits(adUnits);
                _this.global.pbjs.requestBids({
                    bidsBackHandler: _this.initAdServer,
                    timeout: PrebidTimeout,
                });
            });
        };
        /**
         * Once the requested bids have been returned, this method is called.
         * It will use both the PreBid and aPN queues to ensure both services have been loaded
         * It then links the Prebid service to the AST, and loads tags in the AST
         */
        this.initAdServer = function () {
            if (_this.global.pbjs.requestSent) {
                return;
            }
            _this.global.pbjs.requestSent = true;
            _this.global.pbjs.que.push(function () {
                _this.global.apntag.anq.push(function () {
                    _this.global.pbjs.setTargetingForAst();
                    _this.global.apntag.loadTags();
                });
            });
        };
        /**
         * Sets up page options for the AST service.
         * It uses the AST queue to ensure that service has been loaded
         * It sets up page options for the AST, and defines each advert as a tag
         *
         * @param adverts The adverts to use to define tags
         */
        this.setPageOptions = function (adverts) {
            _this.global.apntag.anq.push(function () {
                _this.global.apntag.setPageOpts({
                    member: 1543,
                });
                adverts
                    .map(function (advert) { return advert.toApnTag(); })
                    .forEach(function (tag) { return _this.global.apntag.defineTag(tag); });
            });
        };
    }
    return AdvertService;
}());
exports.AdvertService = AdvertService;


/***/ }),

/***/ "./src/comms.ts":
/*!**********************!*\
  !*** ./src/comms.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Comms = void 0;
var advertFactory_1 = __webpack_require__(/*! ./advertFactory */ "./src/advertFactory.ts");
var APIURL = "https://60bcfd7fb8ab3700175a005b.mockapi.io/eg/ads";
/**
 * The Comms class is used exclusively for communicating to APIs
 * In this case, there is just one method representing one call
 *
 * @export
 * @class Comms
 */
var Comms = /** @class */ (function () {
    function Comms() {
    }
    /**
     * Representing a call to the Adverts API provided for this project.
     * If the call is successful, this method will return an array of Advert objects
     *
     * @return An array of advert objects
     */
    Comms.prototype.fetchAdvertsFromAPI = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, factory, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(APIURL)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Response from the API failed with " + response.status + " " + response.statusText);
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!Array.isArray(data)) {
                            throw new Error("Data is not an array");
                        }
                        factory = new advertFactory_1.AdvertFactory();
                        result = data.map(factory.fromData);
                        return [2 /*return*/, result];
                    case 3:
                        err_1 = _a.sent();
                        console.log("Failed to download data from the API. Errors will be swallowed so as not to interupt users' experience");
                        console.error(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, []];
                }
            });
        });
    };
    return Comms;
}());
exports.Comms = Comms;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var comms_1 = __webpack_require__(/*! ./comms */ "./src/comms.ts");
var advertService_1 = __webpack_require__(/*! ./advertService */ "./src/advertService.ts");
/**
 * Entry point for this application.
 * This section contains very little code, and mainly just orchestrates the initial load.
 */
(function (global) {
    return __awaiter(this, void 0, void 0, function () {
        var comms, adverts, adUnits, service, pbjs, apntag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    comms = new comms_1.Comms();
                    return [4 /*yield*/, comms.fetchAdvertsFromAPI()];
                case 1:
                    adverts = _a.sent();
                    adverts.forEach(function (advert) { return advert.renderToDom(); });
                    adUnits = adverts.map(function (advert) { return advert.toAdUnit(); });
                    service = new advertService_1.AdvertService(global);
                    pbjs = global.pbjs || {};
                    pbjs.que = pbjs.que || [];
                    apntag = global.apntag || {};
                    apntag.anq = apntag.anq || [];
                    service.requestBids(adUnits);
                    service.setPageOptions(adverts);
                    return [2 /*return*/];
            }
        });
    });
})(window);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=advert.js.map