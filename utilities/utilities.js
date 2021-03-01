
function getTimestamp() {

    const currentDate = new Date();

    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const timestamp_string = currentDayOfMonth + ":" + (currentMonth + 1) + ":" + currentYear + "-" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

    return timestamp_string;
}

function getTime() {
    
    const currentDate = new Date();

    const time_string = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

    return time_string;
}

function formatDate(timestamp) {

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let date = timestamp.getDate();
    let month = months[timestamp.getMonth()];
    let year = timestamp.getFullYear() % 100;

    return (date + ' ' + month + ' ' + year);

}


module.exports = {
    getTimestamp,
    formatDate,
    getTime
};