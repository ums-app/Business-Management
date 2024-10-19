import React, { useEffect, useState } from 'react'
import { Partner } from '../../../Types/Types'
import { getPartnerById, getPartners } from '../../../Utils/FirebaseTools';
import { useParams } from 'react-router-dom';

const PartnerPage: React.FC = () => {
    const [partner, setpartner] = useState<Partner>();
    const { partnerId } = useParams();

    useEffect(() => {
        if (partnerId) {
            getPartnerById(partnerId)
                .then(res => {
                    setpartner(res)
                })
        }
    }, [partnerId])

    return (
        <div>Partner: {partner?.name} {partner?.lastName}</div>
    )
}

export default PartnerPage