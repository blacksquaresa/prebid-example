export type ValidPosition = "left" | "right" | "bottom";

export interface IAdvertSize {
  width: number;
  height: number;
}

export type IAdvertRefreshSettings =
  | ISelfRefreshingAdvertRefreshSettings
  | IButtonRefreshingAdvertRefreshSettings;

export interface ISelfRefreshingAdvertRefreshSettings {
  delay: number;
  repeat: number;
}

export interface IButtonRefreshingAdvertRefreshSettings {
  btnClick: "enabled";
}

export interface IAdvertBidder {
  bidder: string;
  placementId: number;
}

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
  ) {}

  public static FromData(element: any): Advert {
    if (
      !element ||
      !element.unit ||
      !element.id ||
      !element.sizes ||
      !Array.isArray(element.sizes) ||
      !element.bids ||
      !Array.isArray(element.bids)
    )
      throw new Error("Invalid advert data");
    return new Advert(
      element.unit.toString(),
      element.id.toString(),
      Advert.ToSizeArray(element.sizes),
      Advert.ToBidArray(element.bids),
      !!element.refresh,
      Advert.ToPosition(element.positon), // Note - the API spells this incorrectly.
      !!element.closeBtn,
      Advert.ToRefreshSettingsObject(element.refreshSettings)
    );
  }

  private static ToPosition(position: string): ValidPosition {
    if (~["left", "right", "bottom"].indexOf(position)) {
      return position as ValidPosition;
    }

    return "bottom";
  }

  private static ToSizeArray(sizes: any[]): IAdvertSize[] {
    var result: IAdvertSize[] = [];
    sizes.forEach((element) => {
      if (!Array.isArray(element) || element.length != 2)
        throw new Error("Invalid advert size data");
      var size: IAdvertSize = {
        width: element[0],
        height: element[1],
      };
      result.push(size);
    });
    return result;
  }

  private static ToRefreshSettingsObject(
    settings: any
  ): IAdvertRefreshSettings | undefined {
    if (!settings) return undefined;
    if (settings.delay || settings.repeat) {
      return {
        delay: settings.delay || 0,
        repeat: settings.repeat || 0,
      };
    }
    if (settings.btnClick && settings.btnClick == "enabled")
      return { btnClick: "enabled" };
    return undefined;
  }

  private static ToBidArray(bids: any[]): IAdvertBidder[] {
    var result: IAdvertBidder[] = [];
    bids.forEach((element) => {
      if (!element.bidder || !element.params?.placementId)
        throw new Error("Invalid advert bidder data");
      var bidder: IAdvertBidder = {
        bidder: element.bidder,
        placementId: element.params.placementId,
      };
      result.push(bidder);
    });
    return result;
  }
}
