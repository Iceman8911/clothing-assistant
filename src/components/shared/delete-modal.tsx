import { SignalProps } from "~/code/types";
import GenericModal from "./modal";

export default function DeleteModal(
  props: SignalProps & {
    /**
     * Callback function to run once the delete button is clicked.
     */
    onDelete: () => void;
  },
) {
  return (
    <GenericModal
      stateSetter={props.stateSetter}
      stateAccessor={props.stateAccessor}
    >
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to delete?</p>

      <div class="flex gap-4">
        <button
          class="btn btn-soft btn-primary ml-auto"
          onClick={() => props.stateSetter(false)}
        >
          Cancel
        </button>
        <button
          class="btn btn-soft btn-error"
          onClick={() => {
            props.onDelete();
            props.stateSetter(false);
          }}
        >
          Delete
        </button>
      </div>
    </GenericModal>
  );
}
