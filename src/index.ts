import { Comms } from "./comms";
import * as pbjs from "./prebid";
import * as apntag from "./appNexus";
import { AdvertService } from "./advertService";

/**
 * Entry point for this application.
 * This section contains very little code, and mainly just orchestrates the initial load.
 */
(async function (global) {
  let comms = new Comms();
  let adverts = await comms.fetchAdvertsFromAPI();
  adverts.forEach((advert) => advert.renderToDom());
  let adUnits = adverts.map((advert) => advert.toAdUnit());
  let service = new AdvertService(global);

  let pbjs = global.pbjs || {};
  pbjs.que = pbjs.que || [];

  let apntag = global.apntag || {};
  apntag.anq = apntag.anq || [];

  service.requestBids(adUnits);
  service.setPageOptions(adverts);
})(window);
