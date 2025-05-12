import { produce } from "solid-js/store";
import { gSetSettings, gSettings } from "~/code/shared";

export default function SettingsPage() {
	return (
		<div class="p-4">
			<h2 class="font-bold">Settings</h2>
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Gemini API Key:</legend>
				<input
					type="text"
					class="input"
					placeholder="Type here"
					value={gSettings.apiKeys.gemini}
					onfocusout={(e) =>
						gSetSettings(
							produce((state) => (state.apiKeys.gemini = e.currentTarget.value))
						)
					}
				/>
				<p class="label inline">
					Required for any <em>AI</em> functionality. Click{" "}
					<a
						href="https://ai.google.dev/gemini-api/docs/api-key"
						class="link-primary"
					>
						here
					</a>{" "}
					to get one.
				</p>
			</fieldset>
		</div>
	);
}
