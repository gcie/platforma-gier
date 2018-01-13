// generator tokenów
module.exports = function(x = 1) {
    var hash = Math.random().toString(36).slice(2);
    while(--x>0)
        hash += Math.random().toString(36).slice(2);
    return hash;
}