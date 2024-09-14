import React, { useState } from "react";
import ReactQuill from "react-quill";
import EditorToolbar, { modules, formats } from "./EditorToolbar";
import "react-quill/dist/quill.snow.css";
import "./QuillEditor.css";
import { t } from "i18next";
import axiosClient from "../../../axios/axios";
import APIEndpoints from "../../../constants/APIEndpoints";
import { toast } from "react-toastify";
import Button from "../Button/Button";
import { useStateValue } from "../../../context/StateProvider";
import { actionTypes } from "../../../context/reducer";

const QuillEditor = ({
  handelSave,
  article,
  updateMode = false,
  closeModal,
}) => {
  const [{ articles }, dispatch] = useStateValue();
  const [isError, setError] = useState(null);
  const [articleInfo, setarticleInfo] = useState({
    title: updateMode ? article.title : "",
    content: updateMode ? article.content : "",
    previewSummary: updateMode ? article.previewSummary : "",
  });
  const onChangeValue = (e) => {
    setarticleInfo({
      ...articleInfo,
      [e.target.name]: e.target.value,
    });
  };
  const onDescriptionChange = (value) => {
    setarticleInfo({ ...articleInfo, content: value });
    handelSave();
  };

  const addArticle = (e) => {
    e.preventDefault();
    console.log(articleInfo);
    const body = {
      title: articleInfo.title,
      content: articleInfo.content,
      previewSummary: articleInfo.previewSummary,
    };
    dispatch({
      type: actionTypes.SET_GLOBAL_LOADING,
      payload: {
        value: true,
      },
    });

    if (updateMode) {
      console.log(article);
      axiosClient
        .put(APIEndpoints.articles.article(article.id), body)
        .then((res) => {
          toast.success("Successfully updated");
          const index = articles.findIndex((item) => item.id == article.id);
          articles[index] = {
            ...articles[index],
            previewSummary: res.data.previewSummary,
            title: res.data.title
          };
          dispatch({
            type: actionTypes.SET_ARTICLES,
            payload: [...articles],
          });
          dispatch({
            type: actionTypes.SET_ARTICLE_DETAILS,
            payload: res.data,
          });
          console.log('updated ', article);
          setError(null);
          closeModal();
        })
        .catch((err) => {
          console.log(err);
          setError(err.response?.data?.message || "An error occurred");
          toast.error(err.response?.data?.message || "An error occurred");
          closeModal();
        })
        .finally(() => {
          dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: {
              value: false,
            },
          });
        });
    } else {
      axiosClient
        .post(APIEndpoints.articles.articles, body)
        .then((res) => {
          toast.success("Successfully added");
          dispatch({
            type: actionTypes.SET_ARTICLES,
            payload: [...articles, res.data],
          });
          //
          setError(null);
          closeModal();
        })
        .catch((err) => {
          setError(err.response?.data?.message || "An error occurred");
          toast.error(err.response?.data?.message || "An error occurred");
        })
        .finally(() => {
          dispatch({
            type: actionTypes.SET_GLOBAL_LOADING,
            payload: {
              value: false,
            },
          });
        });
    }
  };

  return (
    <div className="quill_editor">
      <div className="quill_editor_container">
        <h3>{t("add")}</h3>
        <form onSubmit={addArticle}>
          <div className="quill_editor_title">
            <label>
              <span>
                {t("title")} <span className="retuire_input"> * </span>
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={articleInfo.title}
              onChange={onChangeValue}
              placeholder={t("title")}
              required
            />
          </div>
          <div className="quill_editor_summary">
            <label>
              <span>
                {t("summary")} <span className="retuire_input"> * </span>
              </span>
            </label>
            <textarea
              name="previewSummary"
              rows={5}
              value={articleInfo.previewSummary}
              onChange={onChangeValue}
              placeholder={t("summary")}
              required
              style={{ height: "unset" }}
              maxLength={400}
              minLength={100}
            ></textarea>
          </div>
          <div className="quill_edito_content">
            <label>
              {t("contents")} <span className="retuire_input"> * </span>
            </label>
            <EditorToolbar toolbarId={"t1"} />
            <ReactQuill
              theme="snow"
              value={articleInfo.content}
              onChange={onDescriptionChange}
              placeholder={t("WriteSomethingAwesome")}
              modules={modules("t1")}
              formats={formats}
              className="react_quill"
            />
          </div>
          <br />
          {isError !== null && <div className="error_msg"> {isError} </div>}
          <Button type="submit" text={t("save")} />
        </form>
      </div>
    </div>
  );
};

export default QuillEditor;
