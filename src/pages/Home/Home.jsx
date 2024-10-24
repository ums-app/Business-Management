import React, { useState, useEffect } from "react";
import { useStateValue } from "../../context/StateProvider";
import "./Home.css";
import Footer from "../../components/Footer/Footer";
import Clock from 'react-live-clock';
import { UserTypes } from "../../constants/Others";
import VisitorHome from "./VisitorHome/VisitorHome";
import CustomerHome from "./CustomerHome/CustomerHome";
import Dashboard from "../../components/Dashboard/Dashboard";

const Home = () => {
  const [{ authentication }, dispatch] = useStateValue();

  useEffect(() => {

  }, []);

  if (authentication?.userType?.toLowerCase() == UserTypes.VISITOR?.toLowerCase()) {
    return <VisitorHome />;
  }
  if (authentication?.userType?.toLowerCase() == UserTypes.CUSTOMER?.toLowerCase()) {
    return <CustomerHome />;
  }

  return (
    <div className="home fade_in">

      <h1 className="text_align_center" style={{ fontSize: '34px' }}>
        <Clock format="HH:mm:ss" interval={1000} ticking={true} />
      </h1>

      <Dashboard />
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
