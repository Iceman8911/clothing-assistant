import { trackStore } from "@solid-primitives/deep";
import { createEffect, on, onMount } from "solid-js";
import { produce, unwrap } from "solid-js/store";
import { gDefaultSettings, gSetSettings, gSettings } from "~/code/shared";

export default function SettingsPage() {
	const localStorageKey = "settings";

	function saveSettings(settings: typeof gSettings) {
		try {
			localStorage.setItem(localStorageKey, JSON.stringify(settings));
		} catch (error) {
			console.error(error);
		}
	}

	function loadSettings(): typeof gSettings {
		try {
			const data = localStorage.getItem(localStorageKey);

			if (!data) throw new Error();

			return JSON.parse(data);
		} catch (_) {
			console.error(
				"Error parsing local storage data, falling back to defaults"
			);

			// Fallback to defaults
			return structuredClone(gDefaultSettings);
		}
	}

	onMount(() => {
		gSetSettings(loadSettings());
	});

	createEffect(() => {
		trackStore(gSettings);
		const settings = structuredClone(unwrap(gSettings));

		if (!settings.apiKeys.persist) {
			// Clear the API Keys
			settings.apiKeys.gemini = "";
		}

		saveSettings(settings);
	});

	return (
		<div class="p-4 prose">
			<h2 class="font-bold">Settings</h2>

			<section>
				<h3>API Keys</h3>

				<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
					<legend class="fieldset-legend">General Toggles</legend>
					<label class="label font-bold text-primary-content">
						<input
							type="checkbox"
							checked={gSettings.apiKeys.persist}
							class="toggle toggle-warning"
							onChange={(_) => {
								gSetSettings(
									produce(
										(state) => (state.apiKeys.persist = !state.apiKeys.persist)
									)
								);
							}}
						/>
						Persist API Keys?
					</label>
					<p class="label inline-block max-w-72 whitespace-break-spaces">
						<span class="text-warning font-bold">WARNING: </span> API Keys would
						be stored client-side and thus be at risk to any malicious
						extensions or cross site attacks, otherwise, they're cleared upon
						loading the app.
					</p>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Gemini API Key:</legend>
					<input
						type="text"
						class="input"
						placeholder="Type here"
						value={gSettings.apiKeys.gemini}
						onfocusout={(e) =>
							gSetSettings(
								produce(
									(state) => (state.apiKeys.gemini = e.currentTarget.value)
								)
							)
						}
					/>
					<p class="label inline">
						Required for any <em>AI</em> functionality. Click{" "}
						<a
							href="https://ai.google.dev/gemini-api/docs/api-key"
							class="link-primary"
							target="_blank"
						>
							here
						</a>{" "}
						to get one.
					</p>
				</fieldset>
			</section>
		</div>
	);
}
