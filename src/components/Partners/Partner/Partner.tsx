import React, { useEffect, useState } from 'react'
import { Partner } from '../../../Types/Types'
import { getPartners } from '../../../Utils/FirebaseTools';

const Partner: React.FC = () => {
    const [partners, setpartners] = useState<Partner[]>([]);


    useEffect(() => {
        getPartners()
            .then(res => {
                setpartners(res)
            })

    }, [])

    return (
        <div>Partner</div>
    )
}

export default Partner