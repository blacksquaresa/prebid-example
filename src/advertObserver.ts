import { Advert } from "./advert";

/**
 * Watches the associated advert, adds close and refresh buttons, and initiates auto refreshes, as appropriate.
 *
 * Some methods in this class are made public to enable testing,
 * but would otherwise be private. These are marked as such in their comments.
 *
 * @export
 * @class AdvertObserver
 */
export class AdvertObserver {
  private observer: MutationObserver;
  private closeButtonId: string;
  private refreshButtonId: string;

  /**
   * Creates an instance of AdvertObserver.
   * @param advert The advert to be observed.
   * @param closeFunc If supplied, the function to call when the close button is clicked. If not supplied, no close button will be added.
   * @param refreshButtonFunc If supplied, the function to call when the refresh button is clicked. If not supplied, no refresh button will be added.
   * @param autoRefreshFunc If supplied, the function to call when the automated refresh ticks over. If not supplied, no automatic refresh will be initiated.
   */
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

  /**
   * Initiate the observation. This allows the class to be constructed without acting, if necessary
   */
  public observe(): void {
    if (!this?.advert?.adDiv) return;
    this.observer.observe(this.advert.adDiv, { childList: true });
  }

  /**
   * Disconnects the internal observer, to release references when an advert is closed.
   */
  public close(): void {
    this.observer.disconnect();
  }

  /**
   * The event handler for the mutation observer. Adds or re-adds the close button or refresh button,
   * or re-initialises the auto refresh, whenever the contents of the advert div are updated.
   *
   * @param events The array of mutation events returned from the internal mutation observer
   */
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

  /**
   * Adds a close button if appropriate, and if one does not already exist
   *
   * @private
   */
  public addCloseButton() {
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

  /**
   * Adds a refresh button if appropriate, and if one does not already exist
   *
   * @private
   */
  public addRefreshButton() {
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

  /**
   * Initiates an automatic timer to refresh the advert, if appropriate and if required settings exist.
   * Clears any existing timers.
   * This method assumed the existence of certain variables without checking on them. These checks are made in the calling method.
   *
   * @private
   */
  public initiateAutoRefresh() {
    if (this.advert.refreshTimeout != undefined) {
      window.clearTimeout(this.advert.refreshTimeout);
      this.advert.refreshTimeout = undefined;
    }
    if (this.advert.refreshCounter < this.advert.refreshSettings!.repeat) {
      this.advert.refreshTimeout = window.setTimeout(
        this.autoRefreshFunc!,
        this.advert.refreshSettings!.delay
      );
    }
  }

  /**
   * Checks the events that triggered this mutation. We only want to act when:
   * 1: a new element is added to our div. When elements are taken away, we don't care.
   *    We don't need to remove our buttons when elements are removed, because the removal
   *    generally clears all the contents of the div.
   * 2: the new elements being added are not all our own elements. When we add the close or
   *    refresh buttons, that triggers the mutation observer again. We want to ignore those actions.
   *
   * @param events The mutation events that triggered this observed mutation
   * @return boolean Whether or not this change represents a legitimate refresh we should act upon.
   *         False means it should be acted upon, while True means it should not.
   * @private
   */
  public changeIsNotRefresh(events: MutationRecord[]): boolean {
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
