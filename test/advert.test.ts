import { IApnTag, IAdUnit, Advert } from "../src/advert";

describe("Advert Factory", () => {
  afterEach(() => {
    // reset JSDom after each test
    document.body.innerHTML = "";
  });
  describe("constructor", () => {
    test("creates a new advert with defaults", () => {
      let advert = new Advert("someid", "divid", [], []);
      expect(advert.unit).toBe("someid");
      expect(advert.id).toBe("divid");
      expect(advert.refresh).toBeFalsy();
      expect(advert.closeBtn).toBeFalsy();
      expect(advert.position).toBe("bottom");
      expect(advert.refreshSettings).toBeUndefined();
    });
  });
  describe("renderToDom method", () => {
    let apntag: any;
    beforeEach(() => {
      apntag = {
        anq: {
          push: jest.fn().mockImplementation((func) => func()),
        },
        showTag: jest.fn(),
      };
      window.apntag = apntag;
    });
    test("adds the correct elements to the DOM", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      expect(document.body.children.length).toBe(1);
      let container: HTMLElement = document.body.children[0] as HTMLElement;
      expect(container.classList).toContain("advert_container");
      expect(container.classList).toContain("advert_container_bottom");
      expect(container.style.display).toBe("none");
      expect(container.children.length).toBe(1);
      let adDiv = container.children[0] as HTMLElement;
      expect(adDiv.id).toBe("divid");
      expect(adDiv.classList).toContain("advert_display");
      expect(adDiv.classList).toContain("advert_display_bottom");
    });
    test("queues the AST to show the tag", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      expect(apntag.anq.push).toHaveBeenCalled();
      expect(apntag.showTag).toHaveBeenCalledWith("divid");
    });
  });
  describe("toAdUnit method", () => {
    test("creates a correct AdUnit", () => {
      let advert = new Advert(
        "someid",
        "divid",
        [
          { width: 123, height: 456 },
          { width: 345, height: 789 },
        ],
        [
          { bidder: "bidder1", params: { placementId: 12345 } },
          { bidder: "bidder2", params: { placementId: 54321 } },
        ]
      );
      let adUnit = advert.toAdUnit();
      expect(adUnit.code).toBe("divid");
      expect(adUnit.mediaTypes.banner.sizes).toEqual(
        expect.arrayContaining([
          [123, 456],
          [345, 789],
        ])
      );
      expect(adUnit.bids).toEqual(
        expect.arrayContaining([
          { bidder: "bidder1", params: { placementId: 12345 } },
          { bidder: "bidder2", params: { placementId: 54321 } },
        ])
      );
    });
  });
  describe("toApnTag method", () => {
    test("creates a correct APN tag", () => {
      let advert = new Advert(
        "someid",
        "divid",
        [
          { width: 123, height: 456 },
          { width: 345, height: 789 },
        ],
        [
          { bidder: "bidder1", params: { placementId: 12345 } },
          { bidder: "bidder2", params: { placementId: 54321 } },
        ]
      );
      let apnTag = advert.toApnTag();
      expect(apnTag.tagId).toBe("someid");
      expect(apnTag.targetId).toBe("divid");
      expect(apnTag.sizes).toEqual(
        expect.arrayContaining([
          [123, 456],
          [345, 789],
        ])
      );
    });
  });
  describe("close method", () => {
    test("removed references to dom objects", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      expect(advert.adContainer).not.toBeUndefined();
      expect(advert.adDiv).not.toBeUndefined();
      expect(document.body.children.length).toBe(1);
      advert.close();
      expect(advert.adContainer).toBeUndefined();
      expect(advert.adDiv).toBeUndefined();
      expect(document.body.children.length).toBe(0);
    });
    test("does not act if the adContainer is already undefined", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      advert.adContainer = undefined;
      advert.close();
      expect(advert.adDiv).not.toBeUndefined();
      expect(document.body.children.length).toBe(1);
    });
    test("clears any waiting timeouts", () => {
      let oldTimeout = window.clearTimeout;
      window.clearTimeout = jest.fn();

      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      advert.refreshTimeout = 13;
      advert.close();
      expect(window.clearTimeout).toHaveBeenCalledWith(13);
      expect(advert.refreshTimeout).toBeUndefined();

      window.clearTimeout = oldTimeout;
    });
  });
  describe("refreshAdvert method", () => {
    let apntag: any;
    beforeEach(() => {
      apntag = {
        anq: {
          push: jest.fn().mockImplementation((func) => func()),
        },
        showTag: jest.fn(),
        refresh: jest.fn(),
      };
      window.apntag = apntag;
    });
    test("adds the correct elements to the DOM", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.renderToDom();
      advert.refreshAdvert();
      expect(apntag.refresh).toHaveBeenCalledWith(
        expect.arrayContaining(["divid"])
      );
    });
    test("does not refresh if the container is not present", () => {
      let advert = new Advert("someid", "divid", [], []);
      advert.refreshAdvert();
      expect(apntag.showTag).not.toHaveBeenCalled();
    });
  });
});
