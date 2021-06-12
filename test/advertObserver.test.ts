import { Advert } from "../src/advert";
import { AdvertObserver } from "../src/advertObserver";

class FakeMutationObserver {
  public static instances: FakeMutationObserver[] = [];
  constructor(public callback: Function) {
    FakeMutationObserver.instances.push(this);
  }

  public observe = jest.fn();
  public disconnect = jest.fn();
  public takeRecords = jest.fn();

  public static clear() {
    FakeMutationObserver.instances = [];
  }
}

window.MutationObserver = FakeMutationObserver;

describe("Advert Observer", () => {
  let apntag: any;
  let closeFunc = jest.fn();
  let refreshFunc = jest.fn();
  let autoFunc = jest.fn();
  beforeEach(() => {
    apntag = {
      anq: {
        push: jest.fn().mockImplementation((func) => func()),
      },
      showTag: jest.fn(),
    };
    window.apntag = apntag;
  });
  afterEach(() => {
    FakeMutationObserver.clear();
    document.body.innerHTML = "";
  });
  describe("close button", () => {
    test("does nothing if no mutation events are provided", () => {
      let advert = new Advert("someid", "divid", [], [], false, "left", true);
      advert.renderToDom();
      var mutationObserver = FakeMutationObserver.instances[0];
      mutationObserver.callback([{ addedNodes: [] }]);
      expect(advert.adDiv.children.length).toBe(0);
    });
    test("adds a close div when a change happens to the div", () => {
      let advert = new Advert("someid", "divid", [], [], false, "left", true);
      advert.renderToDom();
      var mutationObserver = FakeMutationObserver.instances[0];
      mutationObserver.callback([
        { addedNodes: [document.createElement("div")] },
      ]);
      expect(advert.adDiv.children.length).toBe(1);
      let child = advert.adDiv.children[0];
      expect(child.id).toBe("advert_close_button_divid");
      expect(child.classList).toContain("advert_close_button");
      expect(child.innerHTML).toBe("X");
    });
  });
});
