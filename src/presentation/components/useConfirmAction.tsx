import { useState } from "react";
import { ConfirmActionDialog, type Confirmation } from "./ConfirmActionDialog";

export function useConfirmAction() {
  const [action, confirm] = useState<Confirmation | null>(null);
  const dialog = action && (
    <ConfirmActionDialog
      {...action}
      onCancel={() => confirm(null)}
      onAccept={() => {
        confirm(null);
        action.onAccept();
      }}
    />
  );

  return { confirm, dialog };
}
