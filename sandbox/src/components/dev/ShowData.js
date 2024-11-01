import React from "react";
import JSONPretty from "react-json-pretty";

const ShowData = ({data}) => {
    return <JSONPretty data={data} />
}

export default ShowData;