import React, { useState } from 'react'
import Modal from '../UI/modal/Modal'
import { t } from 'i18next'
import Button from '../UI/Button/Button'
import { toast } from 'react-toastify'
import AddEmployee from './AddEmployee/AddEmployee'
import { db } from '../../constants/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';


function Employees() {
    const [addFormModal, setaddFormModal] = useState(false)

    const [data, setData] = useState([]);

    // useEffect(() => {

    //     const fetchData = async () => {
    //         const querySnapshot = await getDocs(collection(db, ''));
    //         const items = querySnapshot.docs.map((doc) => doc.data());
    //         setData(items);
    //     };

    //     fetchData();
    // }, []);



    const sendDataToAPI = () => {
        toast.success("data added")
    }

    return (
        <div>
            <Button
                text={t('add') + " " + t('employee')}
                onClick={() => setaddFormModal(true)}
            />

            <Modal
                modalClose={() => setaddFormModal(false)}
                show={addFormModal}>
                <AddEmployee />
            </Modal>

        </div>
    )
}



export default Employees