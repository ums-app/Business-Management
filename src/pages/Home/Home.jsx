import React, { useState, useEffect } from "react";
import { useStateValue } from "../../context/StateProvider";
import "./Home.css";
import Footer from "../../components/Footer/Footer";

import { UserTypes } from "../../constants/Others";
import VisitorHome from "./VisitorHome/VisitorHome";
import CustomerHome from "./CustomerHome/CustomerHome";

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
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
