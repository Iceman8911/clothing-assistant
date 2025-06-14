import { ReactiveMap } from "@solid-primitives/map";
import { createRoot, For, Match, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import InfoIcon from "lucide-solid/icons/info";
import SuccessIcon from "lucide-solid/icons/circle-check";
import WarningIcon from "lucide-solid/icons/circle-alert";
import ErrorIcon from "lucide-solid/icons/circle-x";
import CopyIcon from "lucide-solid/icons/copy";
import { generateRandomId } from "~/code/functions";
import { gEnumStatus } from "~/code/enums";

interface Alert {
  id: string;
  status: gEnumStatus;
  message: string;
  duration?: number;
}

const alerts = new ReactiveMap<string, Alert>();

/**
 * Please don't call this any where else, bar the main `app.tsx`
 */
export function AlertToast() {
  return (
    <Portal>
      <div class="toast toast-top z-[1999]">
        <For each={[...alerts.values()]}>
          {(alert) => (
            <div
              class={
                `alert alert-soft ` +
                (alert.status == gEnumStatus.SUCCESS
                  ? "alert-success"
                  : alert.status == gEnumStatus.INFO
                    ? "alert-info"
                    : alert.status == gEnumStatus.WARNING
                      ? "alert-warning"
                      : "alert-error")
              }
              ref={(el) => {
                // Remove the alert after a while
                if (el) {
                  const timer = setTimeout(() => {
                    alerts.delete(alert.id);
                    clearTimeout(timer);
                  }, alert.duration);
                }
              }}
              onClick={() => alerts.delete(alert.id)}
            >
              <Switch>
                <Match when={alert.status == gEnumStatus.SUCCESS}>
                  <SuccessIcon />
                </Match>
                <Match when={alert.status == gEnumStatus.INFO}>
                  <InfoIcon />
                </Match>
                <Match when={alert.status == gEnumStatus.WARNING}>
                  <WarningIcon />
                </Match>
                <Match when={alert.status == gEnumStatus.ERROR}>
                  <ErrorIcon />
                </Match>
              </Switch>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {alert.message}{" "}
                <CopyIcon
                  class="inline-block cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(alert.message)}
                />
              </span>
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
}

/**
 * Used for displaying success/warning/error/etc alerts.
 *
 * @returns The ID of the alert
 */
export function gTriggerAlert(
  status: gEnumStatus,
  message: string,
  /**
   * Defaults to ~3 seconds
   */
  duration = 3333,
) {
  const id = generateRandomId();
  alerts.set(id, {
    id,
    status,
    message,
    duration: status == gEnumStatus.ERROR ? duration * 1.5 : duration,
  });
  return id;
}
