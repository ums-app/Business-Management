import React from "react";
import "./TabMenu.css";

function TabMenu(props) {
  // this is for avoiding UX issues while clicking on tab-menu if the page is a little scrolled down
  const scollToTop = () => {
    const wrp = document.getElementById("wrapper")
    if (wrp.scrollTop > 2) {
      wrp.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  return (
    <div className="page_tab">
      <ul className="profile_menu display_flex flex_flow_wrap align_items_center justify_content_center" onClick={scollToTop}>
        {props.children}
      </ul>
    </div>
  );
}

export default TabMenu;
