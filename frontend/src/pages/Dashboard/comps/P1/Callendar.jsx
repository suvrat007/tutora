import Calendar from "react-calendar";

import {useState} from "react";

const Callendar = () => {
    const [value, setValue] = useState(new Date());

    return (
        <div
            className="w-full sm:w-[30%] mt-2 p-4 rounded-2xl border-2 border-gray-200 shadow hover:shadow-lg transition-shadow bg-white">
            <Calendar
                onChange={setValue}
                value={value}
                className="w-full font-medium text-gray-700 bg-transparent"
                tileClassName="text-gray-700 hover:bg-blue-100"
                navigationLabel={({date}) =>
                    `${date.toLocaleString("default", {month: "long"})} ${date.getFullYear()}`
                }
            />

        </div>

    )
}
export default Callendar