export declare type ValidPosition = "left" | "right" | "bottom";
export interface IAdvertSize {
    width: number;
    height: number;
}
export declare type IAdvertRefreshSettings = ISelfRefreshingAdvertRefreshSettings | IButtonRefreshingAdvertRefreshSettings;
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
export declare class Advert {
    unit: string;
    id: string;
    sizes: IAdvertSize[];
    bids: IAdvertBidder[];
    refresh: boolean;
    position: ValidPosition;
    closeBtn: boolean;
    refreshSettings?: IAdvertRefreshSettings | undefined;
    constructor(unit: string, id: string, sizes: IAdvertSize[], bids: IAdvertBidder[], refresh?: boolean, position?: ValidPosition, closeBtn?: boolean, refreshSettings?: IAdvertRefreshSettings | undefined);
    static FromData(element: any): Advert;
    private static ToPosition;
    private static ToSizeArray;
    private static ToRefreshSettingsObject;
    private static ToBidArray;
}
