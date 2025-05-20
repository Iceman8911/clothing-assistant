import { SignalProps } from "~/code/types";
import GenericModal from "./modal";

export default function ImgPreview(
  props: SignalProps & {
    /** Base 64 string representation */
    img: string;
  },
) {
  return (
    <GenericModal
      stateAccessor={props.stateAccessor}
      stateSetter={props.stateSetter}
    >
      <h2>Preview</h2>
      <img src={props.img} class="w-max h-auto ml-auto mr-auto" />
    </GenericModal>
  );
}
