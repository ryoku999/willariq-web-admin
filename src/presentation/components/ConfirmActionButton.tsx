import type { ComponentProps } from "react";
import type { Confirmation } from "./ConfirmActionDialog";
import { useConfirmAction } from "./useConfirmAction";

export function ConfirmActionButton({
  confirmation,
  ...buttonProps
}: Omit<ComponentProps<"button">, "onClick"> & { confirmation: Confirmation }) {
  const { confirm, dialog } = useConfirmAction();

  return (
    <>
      <button
        {...buttonProps}
        type="button"
        onClick={() => confirm(confirmation)}
      />
      {dialog}
    </>
  );
}
