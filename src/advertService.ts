import * as pbjs from "./prebid";
import * as apntag from "./appNexus";
import { IAdUnit, Advert } from "./advert";

const PrebidTimeout = 1000;

export class AdvertService {
  constructor(private global: any) {}

  public requestBids = (adUnits: IAdUnit[]) => {
    this.global.pbjs.que.push(() => {
      this.global.pbjs.addAdUnits(adUnits);
      this.global.pbjs.requestBids({
        bidsBackHandler: this.initAdServer,
        timeout: PrebidTimeout,
      });
    });
  };

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
