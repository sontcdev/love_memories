// Barrel của khu edit. Cố ý KHÔNG byte-identical với deploy: nó phải export cả
// hai thế hệ component.
//
// - Tên không hậu tố  → code đã rollback về đúng nhánh deploy, phục vụ 7 LinkType
//   đã có trên deploy (LOVE, LOVE2, EVERY, IDOL, GRAD_PERSONAL, GRAD_CLASS,
//   GRAD_GROUP) qua `src/app/[slug]/edit/edit-client.tsx`.
// - Tên `*V2`         → implementation mới (toast, auto-save, undo/redo, dnd),
//   phục vụ WEDDING/TRAVEL/FRIENDSHIP qua `TemplateEditShell`.
//
// Đừng "dọn" nhóm thứ nhất về dùng hook mới: thế là phá parity với deploy.

// ---- deploy parity ----------------------------------------------------------
export { EditProfileForm } from "./EditProfileForm";
export { EditConfigForm } from "./EditConfigForm";
export { EditIdolProfileForm } from "./EditIdolProfileForm";
export { EditIdolConfigForm } from "./EditIdolConfigForm";
export { EditGradProfileForm } from "./EditGradProfileForm";
export { EditGradGroupProfileForm } from "./EditGradGroupProfileForm";
export { EditFamilyProfileForm } from "./EditFamilyProfileForm";
export { GalleryManager } from "./GalleryManager";
export { TimelineManager } from "./TimelineManager";
export { CareerPathManager } from "./CareerPathManager";
export { MomentsManager } from "./MomentsManager";

// ---- implementation mới (V2) ------------------------------------------------
export { EditProfileFormV2 } from "./EditProfileFormV2";
export { EditConfigFormV2 } from "./EditConfigFormV2";
export { EditIdolProfileFormV2 } from "./EditIdolProfileFormV2";
export { EditIdolConfigFormV2 } from "./EditIdolConfigFormV2";
export { EditGradProfileFormV2 } from "./EditGradProfileFormV2";
export { EditGradGroupProfileFormV2 } from "./EditGradGroupProfileFormV2";
export { GalleryManagerV2 } from "./GalleryManagerV2";
export { TimelineManagerV2 } from "./TimelineManagerV2";
export { CareerPathManagerV2 } from "./CareerPathManagerV2";
export { MomentsManagerV2 } from "./MomentsManagerV2";

// ---- chỉ có ở bản mới (không tồn tại trên deploy) ---------------------------
export { EditWeddingProfileForm } from "./EditWeddingProfileForm";
export { EditTravelProfileForm } from "./EditTravelProfileForm";
export { EditFriendshipProfileForm } from "./EditFriendshipProfileForm";
export { GameTemplateSelector } from "./GameTemplateSelector";
export { SaveStatusIndicator } from "./SaveStatusIndicator";
export { useAutoSave, useFormAutoSave } from "./useAutoSave";
export type { SaveStatus, UseAutoSaveOptions, UseAutoSaveResult } from "./useAutoSave";
export { useUndoRedo } from "./useUndoRedo";
export type { UseUndoRedoOptions, UseUndoRedoResult } from "./useUndoRedo";
