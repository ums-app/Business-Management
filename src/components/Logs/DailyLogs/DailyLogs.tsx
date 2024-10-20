import React, { useEffect, useState } from 'react'
import { Log } from '../../../Types/Types'
import { getTodayLogs } from '../../../Utils/FirebaseTools'

const DailyLogs: React.FC = () => {
    const [logs, setlogs] = useState<Log[]>([])

    useEffect(() => {
        getTodayLogs()
            .then(res => {
                setlogs(res)
            })


    })



    return (
        <div>
            {logs.map(item => {
                return <div>{item.title} {item.createdDate.toString()}</div>
            })}
        </div>
    )
}

export default DailyLogs