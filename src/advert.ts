import * as apntag from "./appNexus";
import { AdvertObserver } from "./advertObserver";

export class Advert {
  constructor(
    public unit: string,
    public id: string,
    public sizes: IAdvertSize[],
    public bids: IAdvertBidder[],
    public refresh: boolean = false,
    public position: ValidPosition = "bottom",
    public closeBtn: boolean = false,
    public refreshSettings?: IAdvertRefreshSettings
  ) {
    let closeFunc = this.closeBtn ? this.close : undefined;
    let refreshFunc =
      this.refresh && this.refreshSettings?.btnClick == "enabled"
        ? this.refreshAdvert
        : undefined;
    let autoRefreshFunc =
      this.refresh &&
      this.refreshSettings?.delay &&
      this.refreshSettings?.repeat
        ? this.autoRefresh
        : undefined;
    this.observer = new AdvertObserver(
      this,
      closeFunc,
      refreshFunc,
      autoRefreshFunc
    );
  }

  public adDiv?: HTMLDivElement;
  public adContainer?: HTMLDivElement;
  public refreshTimeout?: number;
  public refreshCounter: number = 0;

  private observer: AdvertObserver;

  public renderToDom(): void {
    this.adContainer = document.createElement("div");
    this.adContainer.classList.add("advert_container");
    this.adContainer.classList.add(`advert_container_${this.position}`);
    this.adContainer.style.display = "none";
    this.adDiv = document.createElement("div");
    this.adDiv.id = this.id;
    this.adDiv.classList.add("advert_display");
    this.adDiv.classList.add(`advert_display_${this.position}`);
    this.adContainer.appendChild(this.adDiv);
    document.body.prepend(this.adContainer);
    this.observer.observe();

    window.apntag.anq.push(() => {
      window.apntag.showTag(this.id);
    });
  }

  public toAdUnit(): IAdUnit {
    return {
      code: this.id,
      mediaTypes: {
        banner: {
          sizes: this.sizes.map((size) => [size.width, size.height]),
        },
      },
      bids: this.bids,
    };
  }

  public toApnTag(): IApnTag {
    return {
      tagId: this.unit,
      sizes: this.sizes.map((size) => [size.width, size.height]),
      targetId: this.id,
    };
  }

  public close = (): void => {
    if (!this.adContainer) return;
    this.adContainer.parentNode?.removeChild(this.adContainer);
    this.adDiv = undefined;
    this.adContainer = undefined;
    if (this.refreshTimeout != undefined) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
  };

  public refreshAdvert = (): void => {
    if (!this.adContainer) return;
    window.apntag.refresh([this.id]);
  };

  private autoRefresh = (): void => {
    this.refreshCounter++;
    this.refreshTimeout = undefined;
    this.refreshAdvert();
  };
}

export type ValidPosition = "left" | "right" | "bottom";

export interface IAdvertSize {
  width: number;
  height: number;
}

export interface IAdvertRefreshSettings {
  delay: number;
  repeat: number;
  btnClick: "enabled" | "disabled";
}

export interface IAdvertBidder {
  bidder: string;
  params: {
    placementId: number;
  };
}

export interface IAdUnit {
  code: string;
  mediaTypes: {
    banner: {
      sizes: number[][];
    };
  };
  bids: IAdvertBidder[];
}

export interface IApnTag {
  tagId: string;
  sizes: number[][];
  targetId: string;
}
