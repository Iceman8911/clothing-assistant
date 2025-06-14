import { produce } from "solid-js/store";
import { generateRandomId } from "~/code/functions";
import { UUID } from "~/code/types";
import { gSetSettings, gSettings } from "~/code/variables";

export default function SettingsPage() {
  let syncIdInput!: HTMLInputElement;

  return (
    <div class="p-4 prose">
      <h2 class="font-bold">Settings</h2>

      <section>
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend class="fieldset-legend">Sync Id</legend>
          <div class="flex gap-2">
            <input
              type="text"
              class="input"
              placeholder="Click 'Generate'"
              disabled={gSettings.syncId ? true : false}
              value={gSettings.syncId}
              ref={syncIdInput}
            />

            <button
              class="btn btn-soft btn-primary w-20"
              onClick={(_) => {
                gSetSettings(
                  produce(
                    (settings) =>
                      (settings.syncId =
                        (syncIdInput.value as UUID) ?? generateRandomId()),
                  ),
                );
              }}
              disabled={gSettings.syncId ? true : false}
            >
              Generate
            </button>

            <button
              class="btn btn-soft btn-secondary w-14"
              onClick={(_) => {
                navigator.clipboard.writeText(gSettings.syncId);
              }}
              disabled={!gSettings.syncId ? true : false}
            >
              Copy
            </button>
          </div>
          <span class="label text-warning inline-block whitespace-break-spaces">
            Required for syncing. You can generate this only{" "}
            <b class="italic">once</b>!
            <br />
            If you want to use the data here on another device, <b>copy</b> this
            id and paste it into this field on the other device.
          </span>
        </fieldset>
      </section>

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
                    (state) => (state.apiKeys.persist = !state.apiKeys.persist),
                  ),
                );
              }}
            />
            Persist API Keys?
          </label>
          <p class="label inline-block max-w-72 whitespace-break-spaces">
            <span class="text-warning font-bold">WARNING: </span> API Keys would
            be stored client-side and thus be{" "}
            <em class="text-warning">at risk</em> to any malicious extensions or
            cross site attacks.
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
                  (state) => (state.apiKeys.gemini = e.currentTarget.value),
                ),
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
