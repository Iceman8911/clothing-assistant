import { JSX } from "solid-js";
import { SignalProps } from "~/code/shared";

export default function GenericModal(
  props: SignalProps & {
    children: JSX.Element;
  },
) {
  return (
    <dialog
      class="modal modal-bottom sm:modal-middle"
      open={props.stateAccessor()}
      onClose={(_) => {
        props.stateSetter(false);
      }}
    >
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <div class="prose">{props.children}</div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button></button>
      </form>
    </dialog>
  );
}
