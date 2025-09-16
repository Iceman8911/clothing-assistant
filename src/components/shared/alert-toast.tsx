import { ReactiveMap } from "@solid-primitives/map";
import WarningIcon from "lucide-solid/icons/circle-alert";
import SuccessIcon from "lucide-solid/icons/circle-check";
import ErrorIcon from "lucide-solid/icons/circle-x";
import CopyIcon from "lucide-solid/icons/copy";
import InfoIcon from "lucide-solid/icons/info";
import { For, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { gEnumStatus } from "~/code/enums";
import { generateRandomId } from "~/code/functions";
import type { UUID } from "~/code/types";

interface Alert {
	id: UUID;
	status: gEnumStatus;
	message: string;
	duration?: number;
}

const alerts = new ReactiveMap<UUID, Alert>();

/**
 * Please don't call this any where else, bar the main `app.tsx`
 */
export function AlertToast() {
	return (
		<Show when={alerts.size}>
			<Portal>
				<section class="toast toast-top z-[1999]">
					<For each={Array.from(alerts)}>
						{([_, alert]) => {
							const dismissAlert = () => alerts.delete(alert.id);

							return (
								<div
									role="alertdialog"
									aria-live="polite"
									class={
										`alert alert-soft ` +
										(alert.status === gEnumStatus.SUCCESS
											? "alert-success"
											: alert.status === gEnumStatus.INFO
												? "alert-info"
												: alert.status === gEnumStatus.WARNING
													? "alert-warning"
													: "alert-error")
									}
									ref={(el) => {
										// Remove the alert after a while
										if (el) {
											const timer = setTimeout(() => {
												dismissAlert();
												clearTimeout(timer);
											}, alert.duration);
										}
									}}
									onClick={dismissAlert}
									onKeyUp={dismissAlert}
								>
									<Switch>
										<Match when={alert.status === gEnumStatus.SUCCESS}>
											<SuccessIcon />
										</Match>
										<Match when={alert.status === gEnumStatus.INFO}>
											<InfoIcon />
										</Match>
										<Match when={alert.status === gEnumStatus.WARNING}>
											<WarningIcon />
										</Match>
										<Match when={alert.status === gEnumStatus.ERROR}>
											<ErrorIcon />
										</Match>
									</Switch>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										{alert.message}{" "}
										<CopyIcon
											class="inline-block cursor-pointer"
											onClick={() =>
												navigator.clipboard.writeText(alert.message)
											}
										/>
									</button>
								</div>
							);
						}}
					</For>
				</section>
			</Portal>
		</Show>
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
	duration = 33333,
) {
	const id = generateRandomId();
	alerts.set(id, {
		id,
		status,
		message,
		duration: status === gEnumStatus.ERROR ? duration * 1.5 : duration,
	});
	return id;
}
