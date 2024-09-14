const print = ({ pageSize = 'A4', orientation = 'landscape' }) => `
@media print {
  @page{
    size: ${pageSize} ${orientation};
    
  }
  body {
    -webkit-print-color-adjust: exact;
    overflow:visible;


  }


  footer {
    display: none;
  }
  header {
    display: none;
  }
  * {
  direction:${localStorage.getItem("locale") == 'en' ? 'ltr' : 'rtl'};
  }
 
  @top-right-corner {
    content: "Page " counter(page);
  }
}
`;

export default print;