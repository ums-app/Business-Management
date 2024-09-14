import React, { useState } from 'react'
import "./BulletPoint.css"
import ICONS from '../../../constants/Icons';

function BulletPoint({ value, id }) {
  const [selected, setSelected] = useState(false);
  return (
    <div className="dropdown_toggle_box border_1px_solid border_radius_6 cursor_pointer"
      key={id}
      onClick={() => setSelected(!selected)}>
      <div className="display_flex justify_content_space_between align_items_center ">
        <i className={selected ? ICONS.dash : ICONS.plus}></i>
      </div>
      <div className={selected ? 'show_content' : 'hide_content'}>
        {value}
      </div>
    </div>
  )
}

export default BulletPoint