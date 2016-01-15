module.exports = function(str, data) {
    return data.text.toLowerCase().indexOf(str) > -1;
};
