import { AdvertObserver } from "../src/advertObserver";

describe("Advert Observer", () => {
  let advert: any;
  let closeFunc = jest.fn();
  let refreshFunc = jest.fn();
  let autoFunc = jest.fn();
  let observer: AdvertObserver;
  beforeEach(() => {
    advert = {
      id: "adId",
      unit: "adUnit",
      refresh: false,
      closeBtn: false,
      refreshCounter: 0,
      refreshTimeout: undefined,
      renderToDom: jest.fn(),
      close: jest.fn(),
      refreshAdvert: jest.fn(),
      autoRefresh: jest.fn(),
      adDiv: document.createElement("div"),
    };
    advert.adDiv.id = "adId";
    document.body.appendChild(advert.adDiv);
    observer = new AdvertObserver(advert, closeFunc, refreshFunc, autoFunc);
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });
  describe("addCloseButton method", () => {
    test("add a close button", () => {
      expect(advert.adDiv.children.length).toBe(0);
      observer.addCloseButton();
      expect(advert.adDiv.children.length).toBe(1);
      let child = advert.adDiv.children[0];
      expect(child.id).toBe("advert_close_button_adId");
      expect(child.classList).toContain("advert_close_button");
      expect(child.innerHTML).toBe("X");
    });
    test("does not add a second close button", () => {
      observer.addCloseButton();
      expect(advert.adDiv.children.length).toBe(1);
      observer.addCloseButton();
      expect(advert.adDiv.children.length).toBe(1);
    });
    test("clicking the close button triggers the close function", () => {
      observer.addCloseButton();
      expect(advert.adDiv.children.length).toBe(1);
      let child = advert.adDiv.children[0];
      child.dispatchEvent(new MouseEvent("click"));
      expect(closeFunc).toHaveBeenCalled();
    });
  });
  describe("addRefreshButton method", () => {
    test("add a refresh button", () => {
      expect(advert.adDiv.children.length).toBe(0);
      observer.addRefreshButton();
      expect(advert.adDiv.children.length).toBe(1);
      let child = advert.adDiv.children[0];
      expect(child.id).toBe("advert_refresh_button_adId");
      expect(child.classList).toContain("advert_refresh_button");
      expect(child.innerHTML).toBe("Refresh AD");
    });
    test("does not add a second refresh button", () => {
      observer.addRefreshButton();
      expect(advert.adDiv.children.length).toBe(1);
      observer.addRefreshButton();
      expect(advert.adDiv.children.length).toBe(1);
    });
    test("clicking the refresh button triggers the refresh function", () => {
      observer.addRefreshButton();
      expect(advert.adDiv.children.length).toBe(1);
      let child = advert.adDiv.children[0];
      child.dispatchEvent(new MouseEvent("click"));
      expect(refreshFunc).toHaveBeenCalled();
    });
  });
  describe("initiateAutoRefresh method", () => {
    let oldSetTimeout;
    let oldClearTimeout;
    beforeEach(() => {
      // jest timer mocks do not play nicely with jsdom, so we need to do this manually
      oldSetTimeout = setTimeout;
      oldClearTimeout = clearTimeout;
      window.setTimeout = jest.fn().mockReturnValue(15) as any;
      window.clearTimeout = jest.fn() as any;

      advert.refreshSettings = { delay: 10000, repeat: 5 };
    });
    afterEach(() => {
      window.setTimeout = oldSetTimeout;
      window.clearTimeout = oldClearTimeout;
    });
    test("Clears an existing timeout", () => {
      advert.refreshTimeout = 12;
      advert.refreshCounter = 100; // prevent a new timeout from being created
      observer.initiateAutoRefresh();
      expect(clearTimeout).toHaveBeenCalledWith(12);
      expect(advert.refreshTimeout).toBeUndefined();
    });
    test("Does not attempt to clear a non-existent timeout", () => {
      advert.refreshTimeout = undefined;
      observer.initiateAutoRefresh();
      expect(clearTimeout).not.toHaveBeenCalled();
    });
    test("Creates a fresh timeout", () => {
      advert.refreshTimeout = undefined;
      observer.initiateAutoRefresh();
      expect(setTimeout).toHaveBeenCalledWith(autoFunc, 10000);
      expect(advert.refreshTimeout).toBe(15);
    });
    test("Will not create a timeout if the repeat counter exceeds its limit", () => {
      advert.refreshTimeout = undefined;
      advert.refreshCounter = 5;
      observer.initiateAutoRefresh();
      expect(setTimeout).not.toHaveBeenCalled();
      expect(advert.refreshTimeout).toBeUndefined();
    });
  });
  describe("changeIsNotRefresh method", () => {
    let closeElement;
    let refreshElement;
    let otherElement;
    beforeEach(() => {
      closeElement = document.createElement("span");
      closeElement.id = "advert_close_button_adId";
      refreshElement = document.createElement("span");
      refreshElement.id = "advert_refresh_button_adId";
      otherElement = document.createElement("span");
      otherElement.id = "not_owned_by_us";
    });
    test("returns true if events are empty", () => {
      var result = observer.changeIsNotRefresh([]);
      expect(result).toBeTruthy();
    });
    test("returns true if an event contains only an owned element", () => {
      var event: any = { addedNodes: [closeElement] };
      var result = observer.changeIsNotRefresh([event]);
      expect(result).toBeTruthy();
    });
    test("returns true if an event contains only multiple owned elements", () => {
      var event: any = { addedNodes: [closeElement, refreshElement] };
      var result = observer.changeIsNotRefresh([event]);
      expect(result).toBeTruthy();
    });
    test("returns true if multiple events contains only owned elements", () => {
      var event1: any = { addedNodes: [closeElement] };
      var event2: any = { addedNodes: [refreshElement] };
      var result = observer.changeIsNotRefresh([event1, event2]);
      expect(result).toBeTruthy();
    });
    test("returns false if an event contains only another element", () => {
      var event: any = { addedNodes: [otherElement] };
      var result = observer.changeIsNotRefresh([event]);
      expect(result).toBeFalsy();
    });
    test("returns false if an event contains an owned and another element", () => {
      var event: any = { addedNodes: [closeElement, otherElement] };
      var result = observer.changeIsNotRefresh([event]);
      expect(result).toBeFalsy();
    });
    test("returns false if any event contains only another element", () => {
      var event1: any = { addedNodes: [otherElement] };
      var event2: any = { addedNodes: [refreshElement] };
      var result = observer.changeIsNotRefresh([event1, event2]);
      expect(result).toBeFalsy();
    });
    test("returns false if any event includes another element", () => {
      var event1: any = { addedNodes: [closeElement, otherElement] };
      var event2: any = { addedNodes: [refreshElement] };
      var result = observer.changeIsNotRefresh([event1, event2]);
      expect(result).toBeFalsy();
    });
  });
});
