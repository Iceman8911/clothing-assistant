import { JSX } from "solid-js";

/**
 * Note that this modal is *constantly* open. Use a conditional statement to control its visibility. like:
 *
 * ```
 * <Show>
 *   <Match when={varName}>
 *     <Modal>
 *       <p>Hello World!</p>
 *     </Modal>
 *   </Match>
 * </Show>
 */
export default function Modal(props: { children: JSX.Element }) {
  return (
    <>
      <dialog id="my_modal_2" class="modal" open={true}>
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          {props.children}
        </div>
        <form method="dialog" class="modal-backdrop">
          <button></button>
        </form>
      </dialog>
    </>
  );
}
