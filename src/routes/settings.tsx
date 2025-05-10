import { produce } from "solid-js/store";
import { gApiKeys, gSetApiKeys } from "~/code/shared";

export default function SettingsPage() {
	return (
		<div class="p-4">
			<h2 class="font-bold">Settings</h2>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Cloudmersive API Key:</legend>
				<input
					type="text"
					class="input"
					placeholder="Type here"
					value={gApiKeys.cloudmersive}
					onfocusout={(e) =>
						gSetApiKeys(
							produce((state) => (state.cloudmersive = e.currentTarget.value))
						)
					}
				/>
				<p class="label">Optional</p>
			</fieldset>
		</div>
	);
}
