import React, { useEffect } from 'react'
import { useStateValue } from '../../context/StateProvider'
import { actionTypes } from '../../context/reducer'

function Notifications() {
    const [{ notificationCount }, dispatch] = useStateValue()
    useEffect(() => {
        dispatch({
            type: actionTypes.REMOVE_NOTIFICATION_COUNT,
        })
    }, [])
    return (
        <div>Notifications.. 😎😎</div>
    )
}

export default Notifications