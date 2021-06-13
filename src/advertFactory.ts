import {
  Advert,
  ValidPosition,
  IAdvertSize,
  IAdvertRefreshSettings,
  IAdvertBidder,
} from "./advert";

/**
 * Generates an advert from a data object provided.
 * This is primarily used in the Comms class to create an advert from the data fetched from the API.
 *
 * @export
 * @class AdvertFactory
 */
export class AdvertFactory {
  /**
   * Construct a new Advert from a data object
   * We know the object has come from an external source, so we need to be very careful about constructing the Advert,
   * so we can trust the structure inside our system. Invalid data will throw an error if we cannot use a reasonable default.
   * The method is created as a function property to ensure binding with the class, to allow it to be easily used in a map function.
   *
   * @param element The data object to convert into an Advert
   * @return The generated advert.
   */
  public fromData = (element: any): Advert => {
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
      this.toSizeArray(element.sizes),
      this.toBidArray(element.bids),
      !!element.refresh,
      this.toPosition(element.position || element.positon), // Note - the API spells this incorrectly.
      !!element.closeBtn,
      this.toRefreshSettingsObject(element.refreshSettings)
    );
  };

  /**
   * Converts an array of size arrays (arrays with two number members) into an array of size objects
   *
   * @private
   * @param sizes an array of size arrays
   * @return an array of size objects
   */
  private toSizeArray(sizes: any[]): IAdvertSize[] {
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

  /**
   * Creates a set of bidder objects, if the input data is well formed. Otherwise, throws an error.
   *
   * @private
   * @param bids the bidder data
   * @return an array of bidder objects
   */
  private toBidArray(bids: any[]): IAdvertBidder[] {
    var result: IAdvertBidder[] = [];
    bids.forEach((element) => {
      if (!element.bidder || !element.params?.placementId)
        throw new Error("Invalid advert bidder data");
      var bidder: IAdvertBidder = {
        bidder: element.bidder,
        params: {
          placementId: element.params.placementId,
        },
      };
      result.push(bidder);
    });
    return result;
  }

  /**
   * Returns the provided position if it is a valid value, or a default
   *
   * @private
   * @param position the position to check
   * @return the position if valid, or a default to use
   */
  private toPosition(position: string): ValidPosition {
    if (~["left", "right", "bottom"].indexOf(position)) {
      return position as ValidPosition;
    }

    return "bottom";
  }

  /**
   * Generates a unified refresh settings object from the data. This could represent
   * either a refresh button or the delay and repeat details for an automated refresh.
   *
   * @private
   * @param settings the source data
   * @return the constructed refresh settings, or undefined if no settings could (or should) be generated
   */
  private toRefreshSettingsObject(
    settings: any
  ): IAdvertRefreshSettings | undefined {
    if (!settings) return undefined;
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
  }
}
