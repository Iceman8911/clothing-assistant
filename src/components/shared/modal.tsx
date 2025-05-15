import { Accessor, Setter } from "solid-js";
import { JSX } from "solid-js";

export default function GenericModal(props: {
  children: JSX.Element;
  stateAccessor: Accessor<boolean>;
  stateSetter: Setter<boolean>;
}) {
  return (
    <>
      <dialog id="my_modal_2" class="modal" open={props.stateAccessor()}>
        <div class="modal-box">
          <form method="dialog">
            <button
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={(_) => {
                props.stateSetter(false);
              }}
            >
              ✕
            </button>
          </form>

          {props.children}
        </div>
        <form method="dialog" class="modal-backdrop">
          <button
            onClick={(_) => {
              props.stateSetter(false);
            }}
          ></button>
        </form>
      </dialog>
    </>
  );
}
