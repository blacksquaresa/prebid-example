import * as pbjs from "./prebid";
import * as apntag from "./appNexus";
import { IAdUnit, Advert } from "./advert";

const PrebidTimeout = 1000;

/**
 * This service prepares the Prebid and AppNexus AST systems and loads the initial adverts from those systems
 *
 * @export
 * @class AdvertService
 */
export class AdvertService {
  constructor(private global: any) {}

  /**
   * Request bids from the PreBid service based on the advert details provided
   * The method will add the request to the PreBid queue to wait for that service to be ready
   *
   * @param adUnits An array of IAdUnit objects generated from the adverts
   */
  public requestBids = (adUnits: IAdUnit[]) => {
    this.global.pbjs.que.push(() => {
      this.global.pbjs.addAdUnits(adUnits);
      this.global.pbjs.requestBids({
        bidsBackHandler: this.initAdServer,
        timeout: PrebidTimeout,
      });
    });
  };

  /**
   * Once the requested bids have been returned, this method is called.
   * It will use both the PreBid and aPN queues to ensure both services have been loaded
   * It then links the Prebid service to the AST, and loads tags in the AST
   */
  public initAdServer = () => {
    if (this.global.pbjs.requestSent) {
      return;
    }
    this.global.pbjs.requestSent = true;
    this.global.pbjs.que.push(() => {
      this.global.apntag.anq.push(() => {
        this.global.pbjs.setTargetingForAst();
        this.global.apntag.loadTags();
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
  public setPageOptions = (adverts: Advert[]) => {
    this.global.apntag.anq.push(() => {
      this.global.apntag.setPageOpts({
        member: 1543,
      });
      adverts
        .map((advert) => advert.toApnTag())
        .forEach((tag) => this.global.apntag.defineTag(tag));
    });
  };
}
