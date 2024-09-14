import React from "react";
import { Quill } from "react-quill";
import "../QuillEditor/QuillEditor.css";
import { Tooltip } from "react-tooltip";
import { t } from "i18next";

// Custom Undo button icon component for Quill editor. You can import it directly
// from 'quill/assets/icons/undo.svg' but I found that a number of loaders do not
// handle them correctly
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
);

// Undo and redo functions for Custom Toolbar
function undoChange() {
  this.quill.history.undo();
}
function redoChange() {
  this.quill.history.redo();
}

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "comic-sans",
  "courier-new",
  "georgia",
  "helvetica",
  "Inter",
  "lucida",
];
Quill.register(Font, true);

// Modules object for setting up the Quill editor
export const modules = (props) => ({
  toolbar: {
    container: "#" + props,
    handlers: {
      undo: undoChange,
      redo: redoChange,
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
});

// Formats objects for setting up the Quill editor
export const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "code-block",
];

// Quill Toolbar component
export const QuillToolbar = (props) => {
  return (
    <>
      {props.toolbarId !== undefined && (
        <div id={props.toolbarId} className="quill_tool_bar">
          <span className="ql-formats">
            <button className="ql-bold" id="ql-bold-id" />
            <Tooltip
              anchorSelect="#ql-bold-id"
              place="top"
              className="toolTip_style"
            >
              {t("bold")}
            </Tooltip>
            <button className="ql-italic" id="ql-italic-id" />
            <Tooltip
              anchorSelect="#ql-italic-id"
              place="top"
              className="toolTip_style"
            >
              {t("italic")}
            </Tooltip>
            <button className="ql-underline" id="ql-underline-id" />
            <Tooltip
              anchorSelect="#ql-underline-id"
              place="top"
              className="toolTip_style"
            >
              {t("underline")}
            </Tooltip>
            <button className="ql-strike" id="ql-strike-id" />
            <Tooltip
              anchorSelect="#ql-strike-id"
              place="top"
              className="toolTip_style"
            >
              {t("strike")}
            </Tooltip>
          </span>
          <span className="ql-formats">
            <select className="ql-font" id="ql-font-id">
              <option value="arial"> Arial </option>
              <option value="comic-sans">Comic Sans</option>
              <option value="courier-new">Courier New</option>
              <option value="georgia">Georgia</option>
              <option value="helvetica">Helvetica</option>
              <option value="Inter" selected>
                Inter
              </option>
              <option value="lucida">Lucida</option>
            </select>
            <Tooltip
              anchorSelect="#ql-font-id"
              place="top"
              className="toolTip_style"
            >
              {t("fontType")}
            </Tooltip>
            <select className="ql-size" id="ql-size-id">
              <option value="extra-small">Extra Small</option>
              <option value="small">Small</option>
              <option value="medium" selected>
                Medium
              </option>
              <option value="large">Large</option>
            </select>
            <Tooltip
              anchorSelect="#ql-size-id"
              place="top"
              className="toolTip_style"
            >
              {t("size")}
            </Tooltip>
            <select className="ql-header" id="ql-header-id">
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
              <option value="5">Heading 5</option>
              <option value="6">Heading 6</option>
              <option value="" selected>
                Normal
              </option>
            </select>
            <Tooltip
              anchorSelect="#ql-header-id"
              place="top"
              className="toolTip_style"
            >
              {t("fontSize")}
            </Tooltip>
          </span>
          <span className="ql-formats">
            <button
              className="ql-list"
              value="ordered"
              id="ql-list-ordered-id"
            />
            <Tooltip
              anchorSelect="#ql-list-ordered-id"
              place="top"
              className="toolTip_style"
            >
              {t("list")}
            </Tooltip>
            <button className="ql-list" value="bullet" id="ql-list-bullet-id" />
            <Tooltip
              anchorSelect="#ql-list-bullet-id"
              place="top"
              className="toolTip_style"
            >
              {t("bullet")}
            </Tooltip>
            <button className="ql-indent" value="-1" id="ql-list-indent-i-id" />
            <Tooltip
              anchorSelect="#ql-list-indent-i-id"
              place="top"
              className="toolTip_style"
            >
              {t("increaseIndent")}
            </Tooltip>
            <button
              className="ql-indent"
              value="+1"
              id="ql-list-ordered-d-id"
            />
            <Tooltip
              anchorSelect="#ql-list-ordered-d-id"
              place="top"
              className="toolTip_style"
            >
              {t("decreaseIndent")}
            </Tooltip>
          </span>

          <span className="ql-formats">
            <button className="ql-script" value="super" id="ql-super-id" />
            <Tooltip
              anchorSelect="#ql-super-id"
              place="top"
              className="toolTip_style"
            >
              {t("supText")}
            </Tooltip>
            <button className="ql-script" value="sub" id="ql-sub-id" />
            <Tooltip
              anchorSelect="#ql-sub-id"
              place="top"
              className="toolTip_style"
            >
              {t("subText")}
            </Tooltip>
            <button className="ql-blockquote" id="ql-blockquote-id" />
            <Tooltip
              anchorSelect="#ql-blockquote-id"
              place="top"
              className="toolTip_style"
            >
              {t("blockquote")}
            </Tooltip>
            <button className="ql-direction" id="ql-direction-id" />
            <Tooltip
              anchorSelect="#ql-direction-id"
              place="top"
              className="toolTip_style"
            >
              {t("direction")}
            </Tooltip>
          </span>

          <span className="ql-formats">
            <select className="ql-align" id="ql-align-id" />
            <Tooltip
              anchorSelect="#ql-align-id"
              place="top"
              className="toolTip_style"
            >
              {t("align")}
            </Tooltip>
            <select className="ql-color" id="ql-color-id" />
            <Tooltip
              anchorSelect="#ql-color-id"
              place="top"
              className="toolTip_style"
            >
              {t("color")}
            </Tooltip>
            <select className="ql-background" id="ql-background-id" />
            <Tooltip
              anchorSelect="#ql-background-id"
              place="top"
              className="toolTip_style"
            >
              {t("background")}
            </Tooltip>
          </span>

          <span className="ql-formats">
            <button className="ql-link" id="ql-link-id" />
            <Tooltip
              anchorSelect="#ql-link-id"
              place="top"
              className="toolTip_style"
            >
              {t("link")}
            </Tooltip>
            <button className="ql-image" id="ql-image-id" />
            <Tooltip
              anchorSelect="#ql-image-id"
              place="top"
              className="toolTip_style"
            >
              {t("image")}
            </Tooltip>
            <button className="ql-video" id="ql-video-id" />
            <Tooltip
              anchorSelect="#ql-video-id"
              place="top"
              className="toolTip_style"
            >
              {t("video")}
            </Tooltip>
          </span>

          <span className="ql-formats">
            <button className="ql-formula" id="ql-formula-id" />
            <Tooltip
              anchorSelect="#ql-formula-id"
              place="top"
              className="toolTip_style"
            >
              {t("formula")}
            </Tooltip>
            <button className="ql-code-block" id="ql-code-block-id" />
            <Tooltip
              anchorSelect="#ql-code-block-id"
              place="top"
              className="toolTip_style"
            >
              {t("codeBlock")}
            </Tooltip>
            <button className="ql-clean" id="ql-clean-id" />
            <Tooltip
              anchorSelect="#ql-clean-id"
              place="top"
              className="toolTip_style"
            >
              {t("clean")}
            </Tooltip>
          </span>

          <span className="ql-formats">
            <button className="ql-undo" id="ql-undo-id">
              <CustomUndo />
            </button>
            <Tooltip
              anchorSelect="#ql-undo-id"
              place="top"
              className="toolTip_style"
            >
              {t("undo")}
            </Tooltip>
            <button className="ql-redo" id="ql-redo-id">
              <CustomRedo />
            </button>
            <Tooltip
              anchorSelect="#ql-redo-id"
              place="top"
              className="toolTip_style"
            >
              {t("redo")}
            </Tooltip>
          </span>
        </div>
      )}
    </>
  );
};
export default QuillToolbar;
