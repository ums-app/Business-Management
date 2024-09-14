import axios from "axios";
import APIEndpoints from "../constants/APIEndpoints";

const axiosClient = axios.create();


axiosClient.defaults.headers = {
    'Content-Type': 'application/json',
    Authorization: "Bearer " + localStorage.getItem("token")
}


axiosClient.defaults.baseURL = APIEndpoints.root;

export default axiosClient;



