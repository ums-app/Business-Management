import React, {
    useState,
    useEffect,
    useRef,
} from "react";

import "./LangBox.css";
import ICONS from "../../constants/Icons";
import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";
import { useOnClickOutside } from "usehooks-ts";

function LangBox() {
    const [showLangBox, setShowLangBox] = useState(false);
    const langBoxRef = useRef(null);
    const [{ locale }, dispatch] = useStateValue()

    const showBoxHandler = () => {
        setShowLangBox((prev) => !prev);
    }
    useEffect(() => {
        document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
        document.documentElement.lang = locale === "en" ? "en" : "fa";
        console.log(document.documentElement.dir)
        console.log(locale)
    }, [locale]);

    useOnClickOutside(langBoxRef, () => {
        setShowLangBox(false)
    })

    console.log(locale);
    return (
        <div className={'lang'} ref={langBoxRef}>
            <div className='lanBox' onClick={showBoxHandler}>
                <i className={ICONS.translate}></i>

                <div className={'lang_slc'}>{locale} {!locale && 'fa'}</div>

                <i className={ICONS.arrowDown}></i>
            </div>
            <div className={'lang_menu showLangBox ' + (showLangBox && 'show')} >
                <div
                    onClick={() => {
                        dispatch({
                            type: actionTypes.CHANGE_LOCALE,
                            payload: {
                                lang: 'en'
                            },
                        })
                        showBoxHandler();
                    }}
                >
                    English (en)
                </div>
                <div
                    onClick={() => {
                        dispatch({
                            type: actionTypes.CHANGE_LOCALE,
                            payload: {
                                lang: 'fa'
                            },
                        })
                        showBoxHandler();
                    }}
                >
                    Farsi (fa)
                </div>
            </div>
        </div >
    );
}

export default LangBox;