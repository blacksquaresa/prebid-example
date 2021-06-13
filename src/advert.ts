import * as apntag from "./appNexus";
import { AdvertObserver } from "./advertObserver";

/**
 * Represents a single advert. Contains all the information about the advert,
 * and also all the DOM elements and observers associated with the advert.
 *
 * @export
 * @class Advert
 */
export class Advert {
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

  /**
   * Renders the DOM elements for this advert.
   * There are two elements for the actual advert - the container that
   * centers it and the div itself that contains the advert.
   * Also initiates the observer, and requests that the AST service show the tag
   */
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

  /**
   * Converts this advert into an adUnit object, used for the PreBid service
   *
   * @return The ad unit
   */
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

  /**
   * Converts this advert into an APN tag, used for the AST service
   *
   * @return The APN tag
   */
  public toApnTag(): IApnTag {
    return {
      tagId: this.unit,
      sizes: this.sizes.map((size) => [size.width, size.height]),
      targetId: this.id,
    };
  }

  /**
   * Closes this advert
   * All DOM elements are removed from the DOM, and references are removed
   * Timers are cancelled
   */
  public close = (): void => {
    if (!this.adContainer) return;
    this.observer.close();
    this.adContainer.parentNode?.removeChild(this.adContainer);
    this.adDiv = undefined;
    this.adContainer = undefined;
    if (this.refreshTimeout != undefined) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
  };

  /**
   * Refreshes this advert.
   * Calls the AST service for another advert.
   */
  public refreshAdvert = (): void => {
    if (!this.adContainer) return;
    window.apntag.refresh([this.id]);
  };

  /**
   * Initiate another automatic refresh.
   * This will increment the refresh counter, then refresh the advert.
   * This method will not initiate the next refresh timer
   */
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
