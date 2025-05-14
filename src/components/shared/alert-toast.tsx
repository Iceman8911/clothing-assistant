import { ReactiveMap } from "@solid-primitives/map";
import { createRoot, For, Match, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import InfoIcon from "lucide-solid/icons/info";
import SuccessIcon from "lucide-solid/icons/circle-check";
import WarningIcon from "lucide-solid/icons/circle-alert";
import ErrorIcon from "lucide-solid/icons/circle-x";
import CopyIcon from "lucide-solid/icons/copy";
import { generateRandomId } from "~/code/shared";

interface Alert {
	id: string;
	status: "success" | "info" | "warning" | "error";
	message: string;
	duration?: number;
}

const alerts = new ReactiveMap<string, Alert>();

export function AlertToast() {
	return (
		<Portal>
			<Switch>
				<Match when={alerts.size}>
					<div class="toast toast-top z-[999]">
						<For each={[...alerts.values()]}>
							{(alert) => (
								<div
									class={
										`alert ` +
										(alert.status == "success"
											? "alert-success"
											: alert.status == "info"
											? "alert-info"
											: alert.status == "warning"
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
										<Match when={alert.status == "success"}>
											<SuccessIcon />
										</Match>
										<Match when={alert.status == "info"}>
											<InfoIcon />
										</Match>
										<Match when={alert.status == "warning"}>
											<WarningIcon />
										</Match>
										<Match when={alert.status == "error"}>
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
											onClick={() =>
												navigator.clipboard.writeText(alert.message)
											}
										/>
									</span>
								</div>
							)}
						</For>
					</div>
				</Match>
			</Switch>
		</Portal>
	);
}

/**
 * Used for displaying success/warning/error/etc alerts.
 *
 * @returns The ID of the alert
 */
export function gTriggerAlert(
	status: "success" | "info" | "warning" | "error",
	message: string,
	/**
	 * Defaults to ~3 seconds
	 */
	duration = 3333
) {
	const id = generateRandomId();
	alerts.set(id, {
		id,
		status,
		message,
		duration: status == "error" ? duration * 1.5 : duration,
	});
	return id;
}
