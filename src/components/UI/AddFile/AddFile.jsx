import { t } from "i18next";
import Button from "../Button/Button";
import ICONS from "../../../constants/Icons";

const AddFile = ({
  setModalOpen,
  setSubmittedData,
  files,
  setFiles,
  fileURLs,
  setFileURLs,
  description,
  setDescription,
}) => {
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setFileURLs(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const getTruncatedFileName = (file) => {
      const fileName = file.name;
      const extensionIndex = fileName.lastIndexOf(".");
      const extension =
        extensionIndex !== -1 ? fileName.slice(extensionIndex) : "";
      const nameWithoutExtension =
        extensionIndex !== -1 ? fileName.slice(0, extensionIndex) : fileName;

      // Full file name
      const fullFileName = fileName;

      // Truncated file name
      let truncatedFileName;

      if (nameWithoutExtension.length > 20) {
        truncatedFileName = `${nameWithoutExtension.slice(
          0,
          20
        )}...${extension}`;
      } else {
        truncatedFileName = fileName;
      }
      return { fullFileName, truncatedFileName };
    };

    const processedFiles = files.map((file, index) => {
      const { fullFileName, truncatedFileName } = getTruncatedFileName(file);
      return {
        fullFileName,
        truncatedFileName,
        fileSize: `${(file.size / 1024).toFixed(2)}kb`,
        fileURL: fileURLs[index],
      };
    });

    setSubmittedData({
      description,
      files: processedFiles,
    });
    setModalOpen(false);
  };

  return (
    <div>
      <form
        className="file_form display_flex align_items_center justify_content_center flex_direction_column"
        onSubmit={handleSubmit}
      >
        <div className="logo_input_box display_flex">
          <input
            name="file"
            type="file"
            id="subjectFile"
            className="logo_img_file"
            accept="image/*, application/pdf, .docx, .doc, .pptx, .ppt"
            onChange={handleFileChange}
            multiple
          />

          {!fileURLs?.length ? (
            <div className="file_input_uploading display_flex flex_direction_column align_items_center justify_content_center">
              <i className={ICONS.cloudUpload}></i>
              <label htmlFor="subjectFile">
                {t("select") + " " + t("files")}
              </label>
            </div>
          ) : (
            <div className="file_input_uploading display_flex flex_direction_column align_items_center justify_content_center">
              <i className={ICONS.check2Circle}></i>
              <span>
                {fileURLs.length > 1
                  ? t("files") + " " + t("selectSuccessfully")
                  : t("file") + " " + t("selectSuccessfully")}
              </span>
            </div>
          )}
        </div>
        <Button
          btnType="submit"
          id="addButton"
          text={t("save")}
          onClick={handleSubmit}
          loading={false}
        />
      </form>
    </div>
  );
};

export default AddFile;
