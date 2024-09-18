import { useFormikContext } from "formik";
import { Form } from "react-bootstrap";

import { DatePicker } from "jalali-react-datepicker";

import styles from "./styles";

const Date = ({ parentName, name, label, style, hidden, ...props }) => {
    const { values, errors, touched, setFieldTouched, setFieldValue } =
        useFormikContext();

    const fieldName = parentName ? parentName + "." + name : name;

    const handleChange = ({ value: { _d: date } }) => {
        date.setHours(4);
        date.setMinutes(30);

        const UTCDate = date.toISOString();

        UTCDate
            ? setFieldValue(fieldName, UTCDate)
            : (
                values[parentName].constructor === Object
                    ? Object.keys(values[parentName]).length === 1
                    : values[parentName].length === 1
            )
                ? setFieldValue(parentName, undefined)
                : setFieldValue(fieldName, undefined);
    };

    const handleBlur = () => setFieldTouched(fieldName, true);

    return (
        <Form.Group style={style} hidden={hidden} onBlur={handleBlur}>
            {label && <Form.Label>{label}</Form.Label>}
            <DatePicker
                timePicker={false}
                className="form-control"
                onClickSubmitButton={handleChange}
                {...props}
            />
            {touched[parentName] &&
                name &&
                touched[parentName][name] &&
                errors[parentName] &&
                name &&
                errors[parentName][name] ? (
                <Form.Label style={styles.errorField}>
                    {name ? errors[parentName][name] : errors[parentName]}
                </Form.Label>
            ) : null}
        </Form.Group>
    );
};

export default Date;
