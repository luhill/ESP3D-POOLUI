/*
P0  Current Time
P1  Main pump on/off
P2  Booster on / off
P3
P4
P5
P6
P7
P8
P9
P10
P11
*/
function init_pool_panel(){//get pool settings
    getStatus();
}
function pool_status_update(msg){
    console.log("pool status update|" + msg + "| end");
    var js = JSON.parse(msg);
    var p = js.POOL;
    if("time_current" in p){document.getElementById('time_current').value = p.time_current;}
    if("pump_on" in p){document.getElementById('pump_on').checked = p.pump_on;}
    if("booster_on" in p){document.getElementById('booster_on').checked = p.booster_on;}
    if("auto_on" in p){document.getElementById('auto_on').checked = p.auto_on;}
    if("time_start" in p){document.getElementById('time_start').value = secondsToHHMM(p.time_start);}
    if("time_stop" in p){document.getElementById('time_stop').value = secondsToHHMM(p.time_stop);}
    if("chlorine_on" in p){document.getElementById('chlorine_on').checked = p.chlorine_on;}
    if("duty_chlorine" in p){document.getElementById('duty_chlorine').value = p.duty_chlorine;}
    if("ion_on" in p){document.getElementById('ion_on').checked = p.ion_on;}
    if("duty_ion" in p){document.getElementById('duty_ion').value = p.duty_ion;}
    if("cycle_chlorine" in p){document.getElementById('cycle_chlorine').value = p.cycle_chlorine;}
    if("cycle_ion" in p){document.getElementById('cycle_ion').value = p.cycle_ion;}
}
function secondsToHHMM(seconds){
    var date = new Date(0);
    date.setSeconds(seconds); // specify value for SECONDS here
    var timeString = date.toISOString().substring(11, 19);
    return timeString;
}
function HHMMToSeconds(sTime){
    var array = sTime.split(":");
    var seconds = parseInt(array[0])*3600 + parseInt(array[1])*60;
    return seconds;
}
function getStatus(){
    SendPrinterCommand("P114",false);//update all
}
function timeCurrent(){
    var st = document.getElementById('time_current').value;
    SendPrinterCommand("P0 "+st, false);
}
function pumpOn(){
    var on = document.getElementById("pump_on").checked+0;
    SendPrinterCommand("P1 "+on,false);//turning off the pump turns off chlorinator and ionizer
}
function boosterOn(){
    var on = document.getElementById("booster_on").checked+0;
    SendPrinterCommand("P2 "+on,false);//turning off the pump turns off chlorinator and ionizer
}
function autoOn(){
    var on = document.getElementById("auto_on").checked+0;
    SendPrinterCommand("P3 "+on,false);
}
function setAutoTime(){
    var start = HHMMToSeconds(document.getElementById('time_start').value);
    var stop = HHMMToSeconds(document.getElementById('time_stop').value);
    SendPrinterCommand("P4 "+start+"\n P5 "+stop,false);
}

function chlorineOn(){
    var on = document.getElementById("chlorine_on").checked+0;
    SendPrinterCommand("P6 "+on,false);
}
function dutyChlorine(){
    var duty = document.getElementById('duty_chlorine').value;
    SendPrinterCommand("P7 "+duty,false);
}
function ionOn(){
    var on = document.getElementById("ion_on").checked+0;
    SendPrinterCommand("P8 "+on,false);
}
function dutyIon(){
    var duty = document.getElementById('duty_ion').value;
    SendPrinterCommand("P9 "+duty,false);
}
function cycleChlorine(){
    var p = document.getElementById('cycle_chlorine').value;
    SendPrinterCommand("P10 "+p, false);
}
function cycleIon(){
    var p = document.getElementById('cycle_ion').value;
    SendPrinterCommand("P11 "+p,false);
}
