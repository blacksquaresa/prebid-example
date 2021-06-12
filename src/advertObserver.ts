import { Advert } from "./advert";

export class AdvertObserver {
  private observer: MutationObserver;
  private closeButtonId: string;
  private refreshButtonId: string;

  constructor(
    private advert: Advert,
    private closeFunc?: () => void,
    private refreshButtonFunc?: () => void,
    private autoRefreshFunc?: () => void
  ) {
    this.observer = new MutationObserver(this.advertChanged);
    this.closeButtonId = `advert_close_button_${this.advert.id}`;
    this.refreshButtonId = `advert_refresh_button_${this.advert.id}`;
  }

  public observe() {
    if (!this?.advert?.adDiv) return;
    this.observer.observe(this.advert.adDiv, { childList: true });
  }

  private advertChanged = (events: MutationRecord[]): void => {
    if (!this.advert.adDiv || this.changeIsNotRefresh(events)) return;

    if (this.closeFunc) {
      this.addCloseButton();
    }

    if (this.refreshButtonFunc) {
      this.addRefreshButton();
    }

    if (this.autoRefreshFunc && this.advert.refreshSettings) {
      this.initiateAutoRefresh();
    }
  };

  private initiateAutoRefresh() {
    if (this.advert.refreshTimeout != undefined) {
      window.clearTimeout(this.advert.refreshTimeout);
    }
    if (this.advert.refreshCounter < this.advert.refreshSettings!.repeat) {
      this.advert.refreshTimeout = window.setTimeout(
        this.autoRefreshFunc!,
        this.advert.refreshSettings!.delay
      );
    }
  }

  private addRefreshButton() {
    let refreshButton = document.getElementById(
      `advert_refresh_button_${this.advert.id}`
    );
    if (!refreshButton) {
      refreshButton = document.createElement("span");
      refreshButton.id = this.refreshButtonId;
      refreshButton.classList.add("advert_refresh_button");
      refreshButton.innerHTML = "Refresh AD";
      refreshButton.addEventListener("click", this.refreshButtonFunc!);
      this.advert.adDiv!.prepend(refreshButton);
    }
  }

  private addCloseButton() {
    let closeButton = document.getElementById(
      `advert_close_button_${this.advert.id}`
    );
    if (!closeButton) {
      closeButton = document.createElement("span");
      closeButton.id = this.closeButtonId;
      closeButton.classList.add("advert_close_button");
      closeButton.innerHTML = "X";
      closeButton.addEventListener("click", this.closeFunc!);
      this.advert.adDiv!.prepend(closeButton);
    }
  }

  private changeIsNotRefresh(events: MutationRecord[]): boolean {
    return events
      .map((event) => {
        // We are only interested in changes that add new nodes
        if (!event.addedNodes.length) {
          return true;
        }

        // Look through the list of added nodes for any that aren't the two we control
        for (let index = 0; index < event.addedNodes.length; index++) {
          const element = event.addedNodes[index];
          if (
            !(element instanceof HTMLElement) ||
            !~[this.closeButtonId, this.refreshButtonId].indexOf(
              (element as HTMLElement).id
            )
          ) {
            return false;
          }
        }

        // We didn't find any that we don't control, so this event is all us - this is not a refresh
        return true;
      })
      .reduce((check, current) => check && current, true);
  }
}
